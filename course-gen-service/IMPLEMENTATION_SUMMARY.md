# Database Integration - Implementation Summary

## Changes Made

This document summarizes all changes made to integrate PostgreSQL database storage for generated courses.

## Files Modified

### 1. `requirements.txt`
**Added:**
- `psycopg2-binary>=2.9.0` - PostgreSQL adapter for Python

### 2. `src/services/database_service.py` (NEW)
**Purpose:** Complete database service for PostgreSQL operations

**Key Features:**
- Connection management with context managers
- Course CRUD operations
- Lesson CRUD operations
- Lesson body storage (markdown + JSON)
- Status tracking (QUEUED → GENERATING → READY/FAILED)
- Automatic JSON parsing of markdown content into structured sections
- Error handling and logging

**Main Methods:**
- `create_course()` - Create course record with metadata
- `update_course_status()` - Update course status (GENERATING, READY, FAILED)
- `create_lesson()` - Create lesson record with metadata
- `save_lesson_body()` - Save markdown and JSON content
- `save_complete_course()` - Complete workflow to save entire course
- `get_course()` - Retrieve course by ID
- `get_course_lessons()` - Get all lessons for a course

### 3. `src/services/course_generator.py`
**Changes:**
- Added `db_service` parameter to constructor
- Added `save_course_to_database()` method
- Imports `DatabaseService` for type hints
- Maintains backward compatibility with file system storage

### 4. `src/services/__init__.py`
**Changes:**
- Added `DatabaseService` to exports

### 5. `src/consumers/generation_consumer.py`
**Changes:**
- Extract `user_id` from incoming message
- Validate `user_id` is present (required field)
- Call `save_course_to_database()` with user_id
- Include `course_id` in status messages
- Keep file system backup as fallback (optional)
- Enhanced error handling with course_id tracking

### 6. `app.py`
**Changes:**
- Import `DatabaseService`
- Initialize `DatabaseService` in `initialize_services()`
- Connect to database on startup
- Pass `db_service` to `CourseGeneratorService`
- Disconnect database in `shutdown()`
- Graceful degradation if database unavailable

### 7. `test_publisher.py`
**Changes:**
- Added `user_id` parameter to `publish_course_request()`
- Auto-generate test `user_id` if not provided
- Include `user_id` in message payload
- Log `user_id` in output

## New Files Created

### 1. `DATABASE.md`
Comprehensive documentation covering:
- Database schema overview
- Setup instructions
- Usage examples
- Message format
- API reference
- Monitoring queries
- Migration guide

## Architecture Changes

### Before
```
Request → Generate Course → Save to File System → Response
```

### After
```
Request (with user_id) → Generate Course → Save to Database → Save to File System (backup) → Response (with course_id)
```

## Database Schema Mapping

### Course Generation Flow
1. **Initial Request**
   ```
   courses table (status: GENERATING)
   ```

2. **Lesson Generation**
   ```
   For each lesson:
     - lessons table (metadata)
     - lesson_bodies table (content_md, content_json)
   ```

3. **Completion**
   ```
   courses table (status: READY, generated_at: now())
   ```

### Data Structure
```
courses (1) ──< (N) lessons (1) ──< (1) lesson_bodies
                      │
                      └──< (N) lesson_checks
```

## Message Format Changes

### Before
```json
{
  "request_id": "uuid",
  "topic": "Cell Biology",
  "grade_level": "Grade 8",
  "num_lessons": 4,
  "source_filter": "microbiology/"
}
```

### After (Added user_id)
```json
{
  "request_id": "uuid",
  "user_id": "user-uuid-here",
  "topic": "Cell Biology",
  "grade_level": "Grade 8",
  "num_lessons": 4,
  "source_filter": "microbiology/"
}
```

## Response Format Changes

### Success Response (Added course_id)
```json
{
  "request_id": "uuid",
  "status": "success",
  "course_id": "course-uuid-from-db",
  "course_title": "Cell Biology Course",
  "total_lessons": 4,
  "timestamp": "2025-11-03T..."
}
```

## Content Storage

### Markdown (content_md)
- Full lesson content as generated
- Preserved exactly as created by OpenAI
- Used for display/rendering

### JSON (content_json)
Structured format:
```json
{
  "lesson_number": 1,
  "title": "Lesson Title",
  "description": "Description",
  "key_concepts": ["concept1", "concept2"],
  "learning_objectives": ["objective1", "objective2"],
  "sections": [
    {
      "heading": "Section Name",
      "content": "Section content..."
    }
  ]
}
```

## Environment Variables

All required variables are in `.env.example`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learningdb
DB_USER=postgres
DB_PASSWORD=postgres
```

## Error Handling

1. **Database Connection Failure**
   - Logs warning
   - Continues with file system only
   - Service remains operational

2. **Course Save Failure**
   - Sets course status to FAILED
   - Stores error_message in database
   - Publishes error status to RabbitMQ
   - Rejects message (no requeue)

3. **Missing user_id**
   - Validation error
   - Request rejected immediately
   - Error status published

## Testing

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Setup Database
```bash
psql -U postgres -d learningdb -f schema.sql
```

### Test with Publisher
```bash
python test_publisher.py
```

The test will automatically generate a user_id and send a complete request.

## Monitoring

### Check Course Status
```sql
SELECT id, title, status, generated_at, created_at
FROM courses
ORDER BY created_at DESC
LIMIT 10;
```

### View Course with Lessons
```sql
SELECT c.title, l.lesson_number, l.title as lesson_title
FROM courses c
JOIN lessons l ON c.id = l.course_id
WHERE c.id = 'course-uuid'
ORDER BY l.lesson_number;
```

### Failed Courses
```sql
SELECT id, title, error_message, created_at
FROM courses
WHERE status = 'FAILED'
ORDER BY created_at DESC;
```

## Next Steps

1. **Install psycopg2**: `pip install -r requirements.txt`
2. **Setup database**: Run `schema.sql` in PostgreSQL
3. **Configure .env**: Add database credentials
4. **Test**: Run `python test_publisher.py`
5. **Monitor**: Check database for saved courses

## Backward Compatibility

- File system storage still available as backup
- Old courses in `courses/` directory remain untouched
- Can disable file system backup by removing `save_course()` call in `generation_consumer.py`

## Benefits

✅ **Persistent Storage**: Courses stored in database, not just files  
✅ **User Association**: Courses linked to users via user_id  
✅ **Status Tracking**: Track generation progress and failures  
✅ **Structured Data**: Both markdown and JSON formats  
✅ **Query Support**: Easy filtering, searching via SQL  
✅ **Scalability**: Better performance for large datasets  
✅ **Integration Ready**: Easy integration with frontend/API
