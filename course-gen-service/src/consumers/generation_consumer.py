"""Course generation consumer"""
import json
from datetime import datetime

from .base_consumer import BaseConsumer
from ..config import Settings
from ..services import CourseGeneratorService
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class CourseGenerationConsumer(BaseConsumer):
    """Consumer for course generation requests"""
    
    def __init__(self, settings: Settings, course_service: CourseGeneratorService):
        super().__init__(settings)
        self.course_service = course_service
    
    def get_queue_name(self) -> str:
        """Get the generation queue name"""
        return self.settings.rabbitmq.queue_generation
    
    def bind_queue(self):
        """Bind generation queue to exchange"""
        self.channel.queue_bind(
            exchange=self.settings.rabbitmq.exchange,
            queue=self.settings.rabbitmq.queue_generation,
            routing_key=self.settings.rabbitmq.route_generate
        )
    
    def publish_status(self, message: dict):
        """Publish status update"""
        self.publish_message(self.settings.rabbitmq.route_status, message)
    
    def process_message(self, ch, method, properties, body):
        """Process course generation request"""
        course_id = None
        try:
            # Parse message
            message = json.loads(body)
            logger.info(f"Received course generation request: {message}")
            
            # Extract parameters
            topic = message.get('topic')
            grade_level = message.get('grade_level', 'Grade 8')
            num_lessons = message.get('num_lessons', 4)
            source_filter = message.get('source_filter')
            request_id = message.get('request_id', 'unknown')
            user_id = message.get('user_id')  # Get user_id from request
            
            # Validate required fields
            if not topic:
                raise ValueError("Missing required field: 'topic'")
            
            if not user_id:
                raise ValueError("Missing required field: 'user_id'")
            
            # Send processing status
            self.publish_status({
                "request_id": request_id,
                "status": "processing",
                "message": f"Generating course for '{topic}'",
                "timestamp": datetime.now().isoformat()
            })
            
            # Generate course
            course = self.course_service.generate_complete_course(
                topic=topic,
                grade_level=grade_level,
                num_lessons=num_lessons,
                source_filter=source_filter
            )
            
            # Save course to database
            course_id = self.course_service.save_course_to_database(
                course=course,
                user_id=user_id
            )
            
            # Also save to file system for backup (optional)
            try:
                course_dir = self.course_service.save_course(course)
                logger.info(f"Course also saved to filesystem: {course_dir}")
            except Exception as e:
                logger.warning(f"Failed to save course to filesystem: {e}")
            
            # Send success status
            self.publish_status({
                "request_id": request_id,
                "status": "success",
                "message": f"Course generated successfully",
                "course_id": course_id,
                "course_title": course['metadata']['title'],
                "total_lessons": course['metadata']['total_lessons'],
                "timestamp": datetime.now().isoformat()
            })
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            logger.info(f"Successfully processed request: {request_id}")
        
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            
            # Send error status
            try:
                self.publish_status({
                    "request_id": message.get('request_id', 'unknown') if 'message' in locals() else 'unknown',
                    "status": "error",
                    "message": str(e),
                    "course_id": course_id,
                    "timestamp": datetime.now().isoformat()
                })
            except:
                pass
            
            # Reject message (don't requeue to avoid infinite loop)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
