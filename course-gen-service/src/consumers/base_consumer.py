"""Base RabbitMQ consumer"""
import pika
import json
from abc import ABC, abstractmethod
from typing import Any

from ..config import Settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class BaseConsumer(ABC):
    """Base class for RabbitMQ consumers"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.connection = None
        self.channel = None
    
    def connect(self):
        """Establish RabbitMQ connection"""
        try:
            credentials = pika.PlainCredentials(
                self.settings.rabbitmq.username,
                self.settings.rabbitmq.password
            )
            
            parameters = pika.ConnectionParameters(
                host=self.settings.rabbitmq.host,
                port=self.settings.rabbitmq.port,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare exchange
            self.channel.exchange_declare(
                exchange=self.settings.rabbitmq.exchange,
                exchange_type='topic',
                durable=True
            )
            
            logger.info("Connected to RabbitMQ successfully")
        
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise
    
    def publish_message(self, routing_key: str, message: dict):
        """Publish a message to the exchange"""
        try:
            self.channel.basic_publish(
                exchange=self.settings.rabbitmq.exchange,
                routing_key=routing_key,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Persistent
                    content_type='application/json'
                )
            )
            logger.debug(f"Published message to {routing_key}")
        
        except Exception as e:
            logger.error(f"Error publishing message: {e}")
            raise
    
    @abstractmethod
    def process_message(self, ch, method, properties, body):
        """Process incoming message - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def get_queue_name(self) -> str:
        """Get the queue name to consume from"""
        pass
    
    def start_consuming(self):
        """Start consuming messages"""
        try:
            queue_name = self.get_queue_name()
            
            # Declare queue
            self.channel.queue_declare(queue=queue_name, durable=True)
            
            # Bind queue to exchange
            self.bind_queue()
            
            # Set QoS
            self.channel.basic_qos(prefetch_count=1)
            
            # Start consuming
            self.channel.basic_consume(
                queue=queue_name,
                on_message_callback=self.process_message
            )
            
            logger.info(f"Waiting for messages on queue: {queue_name}")
            self.channel.start_consuming()
        
        except KeyboardInterrupt:
            logger.info("Shutting down consumer...")
            self.stop()
        
        except Exception as e:
            logger.error(f"Error in consumer: {e}")
            raise
    
    def bind_queue(self):
        """Bind queue to exchange - can be overridden by subclasses"""
        pass
    
    def stop(self):
        """Stop consumer and close connection"""
        try:
            if self.channel:
                self.channel.stop_consuming()
            if self.connection:
                self.connection.close()
            logger.info("Consumer stopped")
        except Exception as e:
            logger.error(f"Error stopping consumer: {e}")
