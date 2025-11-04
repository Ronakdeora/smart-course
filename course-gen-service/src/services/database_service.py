"""Database service for PostgreSQL operations"""
import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from contextlib import contextmanager

from ..config import DatabaseConfig
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class DatabaseService:
    """Service for database operations"""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self._connection = None
    
    def get_connection_string(self) -> str:
        """Build PostgreSQL connection string"""
        return (
            f"host={self.config.host} "
            f"port={self.config.port} "
            f"dbname={self.config.name} "
            f"user={self.config.user} "
            f"password={self.config.password}"
        )
    
    def connect(self):
        """Establish database connection"""
        try:
            self._connection = psycopg2.connect(
                self.get_connection_string(),
                cursor_factory=RealDictCursor
            )
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def disconnect(self):
        """Close database connection"""
        if self._connection:
            self._connection.close()
            logger.info("Database connection closed")
    
    @contextmanager
    def get_cursor(self):
        """Context manager for database cursor"""
        if not self._connection or self._connection.closed:
            self.connect()
        
        cursor = self._connection.cursor()
        try:
            yield cursor
            self._connection.commit()
        except Exception as e:
            self._connection.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            cursor.close()
    
    def create_course(
        self,
        user_id: str,
        title: str,
        topic: str,
        grade_level: str,
        total_lessons: int,
        source_filter: Optional[str] = None,
        outline_json: Optional[Dict] = None
    ) -> str:
        """
        Create a new course record
        
        Args:
            user_id: UUID of the user creating the course
            title: Course title
            topic: Course topic
            grade_level: Target grade level
            total_lessons: Number of lessons in the course
            source_filter: Optional source filter used
            outline_json: Course outline as JSON
        
        Returns:
            Course UUID as string
        """
        course_id = str(uuid.uuid4())
        
        with self.get_cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO courses (
                    id, user_id, title, topic, grade_level, 
                    total_lessons, source_filter, outline_json, 
                    status, generated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    course_id,
                    user_id,
                    title,
                    topic,
                    grade_level,
                    total_lessons,
                    source_filter,
                    Json(outline_json) if outline_json else None,
                    'GENERATING',
                    None  # generated_at will be set when status changes to READY
                )
            )
            
            result = cursor.fetchone()
            logger.info(f"Created course: {course_id}")
            return result['id']
    
    def update_course_status(
        self,
        course_id: str,
        status: str,
        error_message: Optional[str] = None
    ):
        """
        Update course status
        
        Args:
            course_id: Course UUID
            status: New status (QUEUED, GENERATING, READY, FAILED)
            error_message: Error message if status is FAILED
        """
        with self.get_cursor() as cursor:
            generated_at = datetime.now() if status == 'READY' else None
            
            cursor.execute(
                """
                UPDATE courses
                SET status = %s,
                    error_message = %s,
                    generated_at = COALESCE(%s, generated_at)
                WHERE id = %s
                """,
                (status, error_message, generated_at, course_id)
            )
            
            logger.info(f"Updated course {course_id} status to {status}")
    
    def create_lesson(
        self,
        course_id: str,
        lesson_number: int,
        title: str,
        description: Optional[str] = None,
        key_concepts: Optional[List[str]] = None,
        learning_objectives: Optional[List[str]] = None,
        sources: Optional[List[str]] = None
    ) -> str:
        """
        Create a new lesson record
        
        Returns:
            Lesson UUID as string
        """
        lesson_id = str(uuid.uuid4())
        
        with self.get_cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO lessons (
                    id, course_id, lesson_number, title, description,
                    key_concepts, learning_objectives, sources, generated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    lesson_id,
                    course_id,
                    lesson_number,
                    title,
                    description,
                    key_concepts or [],
                    learning_objectives or [],
                    sources or [],
                    datetime.now()
                )
            )
            
            result = cursor.fetchone()
            logger.info(f"Created lesson {lesson_number}: {lesson_id}")
            return result['id']
    
    def save_lesson_body(
        self,
        lesson_id: str,
        content_md: str,
        content_json: Optional[Dict] = None
    ):
        """
        Save lesson body content
        
        Args:
            lesson_id: Lesson UUID
            content_md: Markdown content
            content_json: Structured JSON content
        """
        with self.get_cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO lesson_bodies (lesson_id, content_md, content_json)
                VALUES (%s, %s, %s)
                ON CONFLICT (lesson_id)
                DO UPDATE SET
                    content_md = EXCLUDED.content_md,
                    content_json = EXCLUDED.content_json,
                    updated_at = now()
                """,
                (lesson_id, content_md, Json(content_json) if content_json else None)
            )
            
            logger.info(f"Saved lesson body for lesson: {lesson_id}")
    
    def save_complete_course(
        self,
        user_id: str,
        course_data: Dict[str, Any]
    ) -> str:
        """
        Save complete course with all lessons and content
        
        Args:
            user_id: UUID of the user
            course_data: Complete course data structure
        
        Returns:
            Course UUID as string
        """
        try:
            metadata = course_data['metadata']
            outline = course_data.get('outline', {})
            lessons = course_data.get('lessons', [])
            
            # Create course record
            course_id = self.create_course(
                user_id=user_id,
                title=metadata['title'],
                topic=metadata['topic'],
                grade_level=metadata['grade_level'],
                total_lessons=metadata['total_lessons'],
                source_filter=metadata.get('source_filter'),
                outline_json=outline
            )
            
            # Create lesson records and bodies
            for lesson_data in lessons:
                lesson_info = lesson_data['lesson_info']
                
                # Create lesson
                lesson_id = self.create_lesson(
                    course_id=course_id,
                    lesson_number=lesson_info['lesson_number'],
                    title=lesson_info['title'],
                    description=lesson_info.get('description'),
                    key_concepts=lesson_info.get('key_concepts', []),
                    learning_objectives=lesson_info.get('learning_objectives', []),
                    sources=lesson_data.get('sources', [])
                )
                
                # Parse and save lesson body
                content_md = lesson_data.get('content', '')
                content_json = self._parse_lesson_to_json(content_md, lesson_info)
                
                self.save_lesson_body(
                    lesson_id=lesson_id,
                    content_md=content_md,
                    content_json=content_json
                )
            
            # Update course status to READY
            self.update_course_status(course_id, 'READY')
            
            logger.info(f"Successfully saved complete course: {course_id}")
            return course_id
        
        except Exception as e:
            logger.error(f"Error saving course: {e}")
            # Update course status to FAILED if course was created
            if 'course_id' in locals():
                try:
                    self.update_course_status(course_id, 'FAILED', str(e))
                except:
                    pass
            raise
    
    def _parse_lesson_to_json(
        self,
        content_md: str,
        lesson_info: Dict
    ) -> Dict:
        """
        Parse markdown content into structured JSON
        
        Args:
            content_md: Markdown content
            lesson_info: Lesson metadata
        
        Returns:
            Structured lesson content as dict
        """
        # Split content into sections
        sections = []
        current_section = None
        
        for line in content_md.split('\n'):
            # Check for section headers (## or ###)
            if line.startswith('## ') or line.startswith('### '):
                if current_section:
                    sections.append(current_section)
                
                current_section = {
                    'heading': line.lstrip('#').strip(),
                    'content': []
                }
            elif current_section is not None:
                current_section['content'].append(line)
        
        # Add last section
        if current_section:
            sections.append(current_section)
        
        # Clean up section content
        for section in sections:
            section['content'] = '\n'.join(section['content']).strip()
        
        return {
            'lesson_number': lesson_info.get('lesson_number'),
            'title': lesson_info.get('title'),
            'description': lesson_info.get('description'),
            'key_concepts': lesson_info.get('key_concepts', []),
            'learning_objectives': lesson_info.get('learning_objectives', []),
            'sections': sections
        }
    
    def get_course(self, course_id: str) -> Optional[Dict]:
        """Get course by ID"""
        with self.get_cursor() as cursor:
            cursor.execute(
                "SELECT * FROM courses WHERE id = %s",
                (course_id,)
            )
            return cursor.fetchone()
    
    def get_course_lessons(self, course_id: str) -> List[Dict]:
        """Get all lessons for a course"""
        with self.get_cursor() as cursor:
            cursor.execute(
                """
                SELECT l.*, lb.content_md, lb.content_json
                FROM lessons l
                LEFT JOIN lesson_bodies lb ON l.id = lb.lesson_id
                WHERE l.course_id = %s
                ORDER BY l.lesson_number
                """,
                (course_id,)
            )
            return cursor.fetchall()
