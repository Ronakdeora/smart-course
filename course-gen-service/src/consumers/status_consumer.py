"""Status monitoring consumer"""
import json

from .base_consumer import BaseConsumer
from ..config import Settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class StatusConsumer(BaseConsumer):
    """Consumer for status updates"""
    
    def __init__(self, settings: Settings):
        super().__init__(settings)
    
    def get_queue_name(self) -> str:
        """Get the status queue name"""
        return self.settings.rabbitmq.queue_status
    
    def bind_queue(self):
        """Bind status queue to exchange"""
        self.channel.queue_bind(
            exchange=self.settings.rabbitmq.exchange,
            queue=self.settings.rabbitmq.queue_status,
            routing_key=self.settings.rabbitmq.route_status
        )
    
    def process_message(self, ch, method, properties, body):
        """Process status update"""
        try:
            status = json.loads(body)
            
            # Format output based on status
            request_id = status.get('request_id', 'unknown')
            status_type = status.get('status', 'unknown')
            message = status.get('message', '')
            timestamp = status.get('timestamp', '')
            
            print("\n" + "="*70)
            print(f"📢 STATUS UPDATE")
            print("="*70)
            print(f"Request ID: {request_id}")
            print(f"Status:     {status_type.upper()}")
            print(f"Message:    {message}")
            print(f"Time:       {timestamp}")
            
            if status_type == "success":
                print(f"\n✅ Course Title:   {status.get('course_title', 'N/A')}")
                print(f"   Total Lessons:  {status.get('total_lessons', 'N/A')}")
                print(f"   Output Path:    {status.get('output_path', 'N/A')}")
            
            elif status_type == "error":
                print(f"\n❌ Error occurred during course generation")
            
            print("="*70 + "\n")
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
        
        except Exception as e:
            logger.error(f"Error processing status: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
