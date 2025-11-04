"""
Test publisher to send course generation requests to RabbitMQ
Usage: python test_publisher.py
"""

from dotenv import load_dotenv
load_dotenv()

import os
import json
import uuid
import pika
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from src.config import Settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def publish_course_request(topic, grade_level="Grade 8", num_lessons=4, source_filter=None, user_id=None):
    """Publish a course generation request to RabbitMQ"""
    
    # Load settings
    settings = Settings()
    
    try:
        # Connect to RabbitMQ
        credentials = pika.PlainCredentials(
            settings.rabbitmq.username,
            settings.rabbitmq.password
        )
        parameters = pika.ConnectionParameters(
            host=settings.rabbitmq.host,
            port=settings.rabbitmq.port,
            credentials=credentials
        )
        
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # Declare exchange
        channel.exchange_declare(
            exchange=settings.rabbitmq.exchange,
            exchange_type='topic',
            durable=True
        )
        
        # Create message
        request_id = str(uuid.uuid4())
        if not user_id:
            user_id = str(uuid.uuid4())  # Generate a test user_id if not provided
        
        message = {
            "request_id": request_id,
            "user_id": user_id,
            "topic": topic,
            "grade_level": grade_level,
            "num_lessons": num_lessons,
            "source_filter": source_filter
        }
        
        # Publish message
        channel.basic_publish(
            exchange=settings.rabbitmq.exchange,
            routing_key=settings.rabbitmq.route_generate,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Persistent
                content_type='application/json'
            )
        )
        
        logger.info(f"Published course request:")
        logger.info(f"  Request ID: {request_id}")
        logger.info(f"  User ID: {user_id}")
        logger.info(f"  Topic: {topic}")
        logger.info(f"  Grade Level: {grade_level}")
        logger.info(f"  Lessons: {num_lessons}")
        logger.info(f"  Source Filter: {source_filter}")
        
        # Close connection
        connection.close()
        
        return request_id
    
    except Exception as e:
        logger.error(f"Error publishing request: {e}")
        raise


if __name__ == "__main__":
    # Example: Send a course generation request
    request_id = publish_course_request(
        topic="Cell",
        grade_level="Grade 8",
        num_lessons=4,
        source_filter="microbiology/"
    )
    
    print(f"\n✅ Course generation request sent!")
    print(f"Request ID: {request_id}")
    print(f"Check the consumer logs for progress...")
