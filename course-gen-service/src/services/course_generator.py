"""Course generation service using OpenAI"""
import json
import re
from datetime import datetime
from typing import List, Tuple, Optional, TYPE_CHECKING
from openai import OpenAI

from ..utils.logger import setup_logger

if TYPE_CHECKING:
    from .database_service import DatabaseService

logger = setup_logger(__name__)


class CourseGeneratorService:
    """Service for generating courses using OpenAI API"""
    
    def __init__(self, api_key: str, vector_store_id: str, output_dir: str = "courses",
                 db_service: Optional['DatabaseService'] = None):
        self.client = OpenAI(api_key=api_key)
        self.vector_store_id = vector_store_id
        self.output_dir = output_dir
        self.db_service = db_service
    
    def search_content(self, query: str, source_filter: Optional[str] = None, 
                      max_results: int = 5) -> Tuple[str, List[str]]:
        """Search vector store for relevant content"""
        try:
            search_results = self.client.vector_stores.search(
                vector_store_id=self.vector_store_id,
                query=query,
                max_num_results=max_results
            )
            
            context_chunks = []
            sources = set()
            
            for result in search_results.data:
                file_path = (getattr(result, 'filename', None) or 
                           getattr(result, 'file_path', None) or 
                           getattr(result, 'source', None))
                section = getattr(result, 'section', '')
                
                if source_filter and source_filter not in str(file_path):
                    continue
                
                for content_obj in getattr(result, 'content', []):
                    chunk_text = getattr(content_obj, 'text', None)
                    if chunk_text:
                        context_chunks.append(f"From {file_path} [{section}]:\n{chunk_text}\n")
                        sources.add(f"{file_path} [{section}]")
            
            return "\n---\n".join(context_chunks), list(sources)
        
        except Exception as e:
            logger.error(f"Error searching content: {e}")
            return "", []
    
    def generate_course_outline(self, topic: str, grade_level: str, 
                               num_lessons: int, source_filter: Optional[str] = None) -> Tuple[dict, List[str]]:
        """Generate course outline with lesson structure"""
        logger.info(f"Generating outline for '{topic}' - {num_lessons} lessons")
        
        context, sources = self.search_content(topic, source_filter, max_results=5)
        
        prompt = f"""Generate a {num_lessons}-lesson course outline on '{topic}' for {grade_level}.
                    REQUIREMENTS:
                    • Each lesson must include: title, description, key_concepts (list), learning_objectives (list)
                    • Content should be age-appropriate for {grade_level}
                    • Return ONLY valid JSON with this exact structure:
                    {{
                    "course_title": "Course title here",
                    "lessons": [
                        {{
                        "lesson_number": 1,
                        "title": "Lesson title",
                        "description": "Brief description",
                        "key_concepts": ["concept1", "concept2"],
                        "learning_objectives": ["objective1", "objective2"]
                        }}
                    ]
                    }}

                    {f"Use ONLY content from '{source_filter}' sources." if source_filter else ""}

                    Relevant context:
                    {context}
                """
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        outline = json.loads(response.choices[0].message.content)
        logger.info(f"Generated outline with {len(outline.get('lessons', []))} lessons")
        
        return outline, sources
    
    def generate_lesson_content(self, lesson_info: dict, grade_level: str, 
                               source_filter: Optional[str] = None) -> Tuple[str, List[str]]:
        """Generate detailed content for a single lesson"""
        logger.info(f"Generating content for lesson: {lesson_info['title']}")
        
        search_query = (f"{lesson_info['title']} {lesson_info.get('description', '')} "
                       f"{' '.join(lesson_info.get('key_concepts', []))}")
        
        context, sources = self.search_content(search_query, source_filter, max_results=6)
        
        prompt = f"""Write a comprehensive lesson for {grade_level} on '{lesson_info['title']}'.
                    Lesson Details:
                    - Description: {lesson_info.get('description', '')}
                    - Key Concepts: {', '.join(lesson_info.get('key_concepts', []))}
                    - Learning Objectives: {', '.join(lesson_info.get('learning_objectives', []))}

                    STRUCTURE:
                    1. Introduction - Engaging hook and overview
                    2. Main Content - Detailed explanation with subsections
                    3. Key Terms - Vocabulary with definitions
                    4. Real-World Applications - Practical examples
                    5. Summary - Recap of main points
                    6. Check Your Understanding - 3-4 assessment questions

                    GUIDELINES:
                    • Write at {grade_level} reading level
                    • Use clear, engaging language
                    • Include specific examples and analogies
                    • Make content interactive and relatable
                    {f"• Use ONLY content from '{source_filter}' sources" if source_filter else ""}

                    Relevant context:
                    {context}
                    """
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content, sources
    
    def generate_complete_course(self, topic: str, grade_level: str = "Grade 8", 
                                 num_lessons: int = 4, source_filter: Optional[str] = None) -> dict:
        """Generate complete course with all lessons"""
        logger.info(f"Starting course generation: {topic}")
        
        try:
            # Generate outline
            outline, outline_sources = self.generate_course_outline(
                topic, grade_level, num_lessons, source_filter
            )
            
            # Generate detailed lessons
            lessons = []
            all_sources = set(outline_sources)
            
            for lesson_info in outline.get('lessons', []):
                content, lesson_sources = self.generate_lesson_content(
                    lesson_info, grade_level, source_filter
                )
                
                lessons.append({
                    "lesson_info": lesson_info,
                    "content": content,
                    "sources": lesson_sources,
                    "generated_at": datetime.now().isoformat()
                })
                
                all_sources.update(lesson_sources)
                logger.info(f"Completed lesson {lesson_info.get('lesson_number', '?')}")
            
            # Create final course structure
            course = {
                "metadata": {
                    "title": outline.get('course_title', f'{topic} Course'),
                    "topic": topic,
                    "grade_level": grade_level,
                    "source_filter": source_filter,
                    "total_lessons": len(lessons),
                    "generated_at": datetime.now().isoformat()
                },
                "outline": outline,
                "lessons": lessons,
                "all_sources": list(all_sources)
            }
            
            logger.info(f"Course generation completed: {len(lessons)} lessons")
            return course
        
        except Exception as e:
            logger.error(f"Error generating course: {e}")
            raise
    
    def save_course(self, course: dict) -> str:
        """Save course to files"""
        import os
        
        try:
            # Create directory
            topic_clean = re.sub(r'[^a-zA-Z0-9\-_]', '-', 
                               course['metadata']['topic'].lower())
            grade_clean = course['metadata']['grade_level'].replace(' ', '').lower()
            course_dir = os.path.join(self.output_dir, f"{topic_clean}-{grade_clean}")
            os.makedirs(course_dir, exist_ok=True)
            
            # Save as JSON
            json_path = os.path.join(course_dir, "course.json")
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(course, f, indent=2, ensure_ascii=False)
            
            # Save as Markdown
            md_path = os.path.join(course_dir, "course.md")
            self._save_markdown(course, md_path)
            
            logger.info(f"Course saved to: {course_dir}")
            return course_dir
        
        except Exception as e:
            logger.error(f"Error saving course: {e}")
            raise
    
    def _save_markdown(self, course: dict, filepath: str):
        """Save course as markdown file"""
        with open(filepath, 'w', encoding='utf-8') as f:
            metadata = course['metadata']
            
            # Header
            f.write(f"# {metadata['title']}\n\n")
            f.write(f"**Topic:** {metadata['topic']}  \n")
            f.write(f"**Grade Level:** {metadata['grade_level']}  \n")
            f.write(f"**Total Lessons:** {metadata['total_lessons']}  \n")
            f.write(f"**Generated:** {metadata['generated_at']}  \n\n")
            
            # Table of Contents
            f.write("## Table of Contents\n\n")
            for lesson in course['lessons']:
                info = lesson['lesson_info']
                f.write(f"{info['lesson_number']}. {info['title']}\n")
            f.write("\n---\n\n")
            
            # Lessons
            for lesson in course['lessons']:
                info = lesson['lesson_info']
                f.write(f"## Lesson {info['lesson_number']}: {info['title']}\n\n")
                f.write(lesson['content'])
                f.write("\n\n---\n\n")
    
    def save_course_to_database(self, course: dict, user_id: str) -> str:
        """
        Save course to database
        
        Args:
            course: Course data structure
            user_id: UUID of the user creating the course
        
        Returns:
            Course UUID from database
        """
        if not self.db_service:
            raise ValueError("Database service not configured")
        
        try:
            course_id = self.db_service.save_complete_course(
                user_id=user_id,
                course_data=course
            )
            logger.info(f"Course saved to database with ID: {course_id}")
            return course_id
        except Exception as e:
            logger.error(f"Error saving course to database: {e}")
            raise
