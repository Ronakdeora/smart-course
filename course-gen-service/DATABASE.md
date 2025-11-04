# Database Integration Guide

## Overview

The Course Generator Service now stores generated courses in a PostgreSQL database instead of just the file system. This enables better data management, querying, and integration with other services.

## Database Schema

The database schema is defined in `schema.sql` and includes the following tables:

### Tables

1. **courses** - Main course metadata
   - `id` (UUID): Primary key
   - `user_id` (UUID): User who created the course
   - `slug` (TEXT): Auto-generated URL-friendly slug from title
   - `title` (TEXT): Course title
   - `topic` (TEXT): Course topic
   - `grade_level` (TEXT): Target grade level
   - `source_filter` (TEXT): Optional source filter used
   - `total_lessons` (INT): Number of lessons
   - `outline_json` (JSONB): Course outline structure
   - `status` (course_status): QUEUED, GENERATING, READY, or FAILED
   - `error_message` (TEXT): Error details if failed
   - `generated_at` (TIMESTAMPTZ): When course generation completed
   - `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

2. **lessons** - Lesson metadata
   - `id` (UUID): Primary key
   - `course_id` (UUID): Foreign key to courses
   - `lesson_number` (INT): Lesson sequence number
   - `title` (TEXT): Lesson title
   - `description` (TEXT): Lesson description
   - `key_concepts` (TEXT[]): Array of key concepts
   - `learning_objectives` (TEXT[]): Array of learning objectives
   - `sources` (TEXT[]): Array of source references
   - `generated_at`, `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

3. **lesson_bodies** - Lesson content (split for performance)
   - `lesson_id` (UUID): Primary key, foreign key to lessons
   - `content_md` (TEXT): Markdown content
   - `content_json` (JSONB): Structured JSON content
   - `updated_at` (TIMESTAMPTZ): Timestamp

4. **lesson_checks** - Optional formative assessment questions
   - `id` (UUID): Primary key
   - `lesson_id` (UUID): Foreign key to lessons
   - `q_order` (INT): Question order
   - `question` (TEXT): Question text
   - `answer` (TEXT): Answer text

### Views

- **v_course_summary**: Course list/card view
- **v_course_lessons**: Lesson titles for table of contents
- **v_lessons_full**: Complete lesson data with content joined

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This includes `psycopg2-binary` for PostgreSQL connectivity.

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learningdb
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Initialize Database

Run the schema file to create the database structure:

```bash
psql -U postgres -d learningdb -f schema.sql
```

Or using a PostgreSQL client, execute the contents of `schema.sql`.

## Usage

### Message Format

When sending a course generation request via RabbitMQ, include the `user_id` field:

```json
{
  "request_id": "unique-request-id",
  "user_id": "user-uuid-here",
  "topic": "Cell Biology",
  "grade_level": "Grade 8",
  "num_lessons": 4,
  "source_filter": "microbiology/"
}
```

### Course Generation Flow

1. **Request received** → Course record created with status `GENERATING`
2. **Course generated** → Lessons and lesson bodies saved to database
3. **Success** → Course status updated to `READY` with `generated_at` timestamp
4. **Failure** → Course status updated to `FAILED` with error message

### Data Storage

The service now:
- **Primary storage**: PostgreSQL database (via `DatabaseService`)
- **Backup storage**: File system (optional, for debugging/backup)

Both markdown and JSON representations are stored:
- **content_md**: Full markdown content for display
- **content_json**: Structured JSON with sections for API access

## Database Service API

### Key Methods

```python
from src.services import DatabaseService
from src.config import Settings

settings = Settings()
db_service = DatabaseService(config=settings.database)
db_service.connect()

# Save complete course
course_id = db_service.save_complete_course(
    user_id="user-uuid",
    course_data=course_dict
)

# Get course
course = db_service.get_course(course_id)

# Get course lessons
lessons = db_service.get_course_lessons(course_id)

# Update course status
db_service.update_course_status(
    course_id=course_id,
    status='READY'
)
```

## Content Structure

### content_json Format

The `content_json` field stores structured lesson content:

```json
{
  "lesson_number": 1,
  "title": "Lesson Title",
  "description": "Lesson description",
  "key_concepts": ["concept1", "concept2"],
  "learning_objectives": ["objective1", "objective2"],
  "sections": [
    {
      "heading": "Introduction",
      "content": "Section content..."
    },
    {
      "heading": "Main Content",
      "content": "Section content..."
    }
  ]
}
```

## Error Handling

- **Database connection failures**: Service continues with file system only, logs warning
- **Course save failures**: Course status set to `FAILED`, error message stored
- **Invalid user_id**: Request rejected with validation error

## Performance Optimizations

1. **Compressed storage**: Large text fields use LZ4 compression (PostgreSQL 14+)
2. **Indexed queries**: Indexes on common query patterns (slug, status, course_id)
3. **Split bodies**: Large content separated into `lesson_bodies` table
4. **Views**: Pre-defined views for common frontend queries

## Monitoring

Check course generation status:

```sql
-- Recent courses by status
SELECT status, COUNT(*) 
FROM courses 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Failed courses with errors
SELECT id, title, error_message, created_at
FROM courses
WHERE status = 'FAILED'
ORDER BY created_at DESC;

-- Course with lessons
SELECT c.title, COUNT(l.id) as lesson_count
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
WHERE c.status = 'READY'
GROUP BY c.id, c.title;
```

## Migration from File System

Existing courses in the `courses/` directory are kept as backups. New courses are:
1. Saved to database (primary)
2. Also saved to file system (backup/debugging)

To disable file system backup, modify `generation_consumer.py` to remove the `save_course()` call.
