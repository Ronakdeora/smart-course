"""Consumers module"""
from .base_consumer import BaseConsumer
from .generation_consumer import CourseGenerationConsumer
from .status_consumer import StatusConsumer

__all__ = ['BaseConsumer', 'CourseGenerationConsumer', 'StatusConsumer']
