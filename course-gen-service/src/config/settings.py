"""Application configuration"""
import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class OpenAIConfig:
    """OpenAI configuration"""
    api_key: str
    vector_store_id: str


@dataclass
class RabbitMQConfig:
    """RabbitMQ configuration"""
    host: str
    port: int
    username: str
    password: str
    exchange: str
    queue_generation: str
    queue_status: str
    route_generate: str
    route_status: str


@dataclass
class DatabaseConfig:
    """Database configuration (for future use)"""
    host: str
    port: int
    name: str
    user: str
    password: str


class Settings:
    """Application settings loaded from environment variables"""
    
    def __init__(self):
        self.openai = OpenAIConfig(
            api_key=self._get_env('OPENAI_API_KEY'),
            vector_store_id=self._get_env('VECTOR_DB_ID')
        )
        
        self.rabbitmq = RabbitMQConfig(
            host=os.getenv('RABBITMQ_HOST', 'localhost'),
            port=int(os.getenv('RABBITMQ_PORT', '5672')),
            username=os.getenv('RABBITMQ_USERNAME', 'guest'),
            password=os.getenv('RABBITMQ_PASSWORD', 'guest'),
            exchange=os.getenv('RABBITMQ_EXCHANGE', 'course.exchange'),
            queue_generation=os.getenv('RABBITMQ_QUEUE_GENERATION', 'course.generation.queue'),
            queue_status=os.getenv('RABBITMQ_QUEUE_STATUS', 'course.status.queue'),
            route_generate=os.getenv('RABBITMQ_ROUTE_GENERATE', 'course.generate'),
            route_status=os.getenv('RABBITMQ_ROUTE_STATUS', 'course.status')
        )
        
        self.database = DatabaseConfig(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', '5432')),
            name=os.getenv('DB_NAME', 'learningdb'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres')
        )
        
        # General settings
        self.output_dir = os.getenv('OUTPUT_DIR', 'courses')
        self.log_level = os.getenv('LOG_LEVEL', 'INFO')
    
    @staticmethod
    def _get_env(key: str, default: Optional[str] = None) -> str:
        """Get environment variable or raise error if required and not found"""
        value = os.getenv(key, default)
        if value is None:
            raise ValueError(f"Required environment variable '{key}' not found")
        return value
