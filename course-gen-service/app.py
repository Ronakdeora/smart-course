"""
Course Generator Microservice - Main Application
Unified entry point for all consumers
"""

from dotenv import load_dotenv
load_dotenv()

import sys
import threading
import signal
from typing import List

from src.config import Settings
from src.services import CourseGeneratorService, DatabaseService
from src.consumers import CourseGenerationConsumer, StatusConsumer
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class Application:
    """Main application class that manages all consumers"""
    
    def __init__(self):
        self.settings = Settings()
        self.consumers: List = []
        self.threads: List[threading.Thread] = []
        self.running = True
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info("Shutdown signal received")
        self.shutdown()
    
    def initialize_services(self):
        """Initialize all services"""
        logger.info("Initializing services...")
        
        # Initialize database service
        self.db_service = DatabaseService(config=self.settings.database)
        try:
            self.db_service.connect()
            logger.info("Database service initialized and connected")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            logger.warning("Continuing without database connection...")
        
        # Initialize course generator service
        self.course_service = CourseGeneratorService(
            api_key=self.settings.openai.api_key,
            vector_store_id=self.settings.openai.vector_store_id,
            output_dir=self.settings.output_dir,
            db_service=self.db_service
        )
        
        logger.info("Services initialized successfully")
    
    def initialize_consumers(self):
        """Initialize all consumers"""
        logger.info("Initializing consumers...")
        
        # Create course generation consumer
        generation_consumer = CourseGenerationConsumer(
            settings=self.settings,
            course_service=self.course_service
        )
        
        # Create status consumer
        status_consumer = StatusConsumer(settings=self.settings)
        
        self.consumers = [generation_consumer, status_consumer]
        logger.info(f"Initialized {len(self.consumers)} consumers")
    
    def start_consumer_thread(self, consumer, name: str):
        """Start a consumer in a separate thread"""
        def run_consumer():
            try:
                logger.info(f"Starting {name}...")
                consumer.connect()
                consumer.start_consuming()
            except Exception as e:
                logger.error(f"Error in {name}: {e}", exc_info=True)
                self.running = False
        
        thread = threading.Thread(target=run_consumer, name=name, daemon=True)
        thread.start()
        return thread
    
    def start(self):
        """Start the application"""
        try:
            logger.info("="*70)
            logger.info("Course Generator Microservice Starting...")
            logger.info("="*70)
            
            # Initialize services
            self.initialize_services()
            
            # Initialize consumers
            self.initialize_consumers()
            
            # Start each consumer in its own thread
            for i, consumer in enumerate(self.consumers):
                consumer_name = consumer.__class__.__name__
                thread = self.start_consumer_thread(consumer, consumer_name)
                self.threads.append(thread)
            
            logger.info("="*70)
            logger.info("All consumers started successfully!")
            logger.info(f"Active consumers: {len(self.consumers)}")
            logger.info("Press CTRL+C to shutdown")
            logger.info("="*70)
            
            # Keep main thread alive
            while self.running:
                # Check if all threads are still alive
                alive_threads = [t for t in self.threads if t.is_alive()]
                if len(alive_threads) < len(self.threads):
                    logger.warning("Some consumer threads have died")
                    self.shutdown()
                    break
                
                # Wait a bit before checking again
                signal.pause() if hasattr(signal, 'pause') else threading.Event().wait(1)
        
        except Exception as e:
            logger.error(f"Application error: {e}", exc_info=True)
            self.shutdown()
            sys.exit(1)
    
    def shutdown(self):
        """Shutdown the application gracefully"""
        if not self.running:
            return
        
        logger.info("="*70)
        logger.info("Shutting down application...")
        logger.info("="*70)
        
        self.running = False
        
        # Stop all consumers
        for consumer in self.consumers:
            try:
                consumer.stop()
            except Exception as e:
                logger.error(f"Error stopping consumer: {e}")
        
        # Disconnect database
        try:
            if hasattr(self, 'db_service'):
                self.db_service.disconnect()
        except Exception as e:
            logger.error(f"Error disconnecting database: {e}")
        
        # Wait for threads to finish
        for thread in self.threads:
            if thread.is_alive():
                thread.join(timeout=5)
        
        logger.info("Application shutdown complete")


def main():
    """Main entry point"""
    app = Application()
    app.start()


if __name__ == "__main__":
    main()
