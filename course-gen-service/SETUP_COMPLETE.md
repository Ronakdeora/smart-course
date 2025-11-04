# PostgreSQL Database Integration - Complete Summary

## 🎯 What Was Done

Your Course Generator Service has been upgraded to store generated courses in a PostgreSQL database instead of just the file system. This enables better data management, user association, status tracking, and integration capabilities.

## 📋 Changes Summary

### New Files Created
1. **`src/services/database_service.py`** - Complete PostgreSQL service
2. **`test_database.py`** - Database connection testing utility
3. **`DATABASE.md`** - Comprehensive database documentation
4. **`IMPLEMENTATION_SUMMARY.md`** - Technical implementation details
5. **`setup.bat`** - Windows setup automation script
6. **This summary document**

### Modified Files
1. **`requirements.txt`** - Added `psycopg2-binary>=2.9.0`
2. **`src/services/__init__.py`** - Export DatabaseService
3. **`src/services/course_generator.py`** - Added database integration
4. **`src/consumers/generation_consumer.py`** - Database storage + user_id handling
5. **`app.py`** - Database service initialization
6. **`test_publisher.py`** - Added user_id parameter
7. **`README.md`** - Updated documentation

## 🗄️ Database Schema

The schema (already in `schema.sql`) includes:

### Tables
- **courses** - Course metadata with status tracking
- **lessons** - Lesson metadata (title, concepts, objectives)
- **lesson_bodies** - Content storage (markdown + JSON)
- **lesson_checks** - Assessment questions (optional)

### Status Flow
```
QUEUED → GENERATING → READY (success)
                  ↓
                FAILED (error)
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

Or use the automated setup:
```bash
setup.bat
```

### 2. Setup Database
```bash
# Create database
createdb learningdb

# Load schema
psql -U postgres -d learningdb -f schema.sql

# Test connection
python test_database.py
```

### 3. Update .env
Your `.env` file should already have these (they were in `.env.example`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learningdb
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Start the Service
```bash
python app.py
```

### 5. Test
```bash
python test_publisher.py
```

## 📊 How It Works Now

### Request Flow
```
1. Request arrives with user_id and topic
   ↓
2. Course record created (status: GENERATING)
   ↓
3. OpenAI generates course content
   ↓
4. Lessons saved to database (markdown + JSON)
   ↓
5. Course status updated to READY
   ↓
6. Response includes course_id from database
```

### Message Format (NEW)
```json
{
  "request_id": "uuid",
  "user_id": "user-uuid-here",  ← REQUIRED NOW
  "topic": "Cell Biology",
  "grade_level": "Grade 8",
  "num_lessons": 4,
  "source_filter": "microbiology/"
}
```

### Response Format (UPDATED)
```json
{
  "request_id": "uuid",
  "status": "success",
  "course_id": "course-uuid-from-db",  ← NEW
  "course_title": "Cell Biology Course",
  "total_lessons": 4,
  "timestamp": "2025-11-03T..."
}
```

## 💾 Data Storage

### Database (Primary)
- **Location**: PostgreSQL database
- **Tables**: courses, lessons, lesson_bodies
- **Format**: Both markdown and structured JSON
- **Benefits**: Queryable, relational, scalable

### File System (Backup)
- **Location**: `courses/` directory
- **Format**: JSON + Markdown files
- **Purpose**: Backup, debugging, manual inspection
- **Optional**: Can be disabled if not needed

## 🔍 Key Features

### 1. User Association
- Every course linked to a user via `user_id`
- Query all courses by user
- Multi-tenant ready

### 2. Status Tracking
- Real-time status updates
- Error message storage
- Generation timestamps

### 3. Dual Format Storage
- **content_md**: Full markdown for display
- **content_json**: Structured sections for API access

### 4. Auto-Generated Slug
- URL-friendly slugs from course titles
- Automatic generation via PostgreSQL trigger

### 5. Compressed Storage
- LZ4 compression on large text fields (PostgreSQL 14+)
- Reduces storage requirements

## 📖 Database Operations

### Query Examples

**Get user's courses:**
```sql
SELECT id, title, status, generated_at 
FROM courses 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

**Get course with lessons:**
```sql
SELECT c.title, l.lesson_number, l.title as lesson_title
FROM courses c
JOIN lessons l ON c.id = l.course_id
WHERE c.id = 'course-uuid'
ORDER BY l.lesson_number;
```

**Check generation status:**
```sql
SELECT status, COUNT(*) 
FROM courses 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

**Failed courses with errors:**
```sql
SELECT title, error_message, created_at
FROM courses
WHERE status = 'FAILED'
ORDER BY created_at DESC;
```

### Using Views (Pre-defined)

```sql
-- Course summaries (for list views)
SELECT * FROM v_course_summary
WHERE created_at > NOW() - INTERVAL '7 days';

-- Course table of contents
SELECT * FROM v_course_lessons
WHERE course_id = 'course-uuid';

-- Full lesson with content
SELECT * FROM v_lessons_full
WHERE course_id = 'course-uuid'
ORDER BY lesson_number;
```

## 🔧 API Integration (for frontend)

The DatabaseService provides methods for easy integration:

```python
from src.services import DatabaseService
from src.config import Settings

settings = Settings()
db = DatabaseService(config=settings.database)
db.connect()

# Get course
course = db.get_course('course-uuid')

# Get lessons
lessons = db.get_course_lessons('course-uuid')

# Update status
db.update_course_status('course-uuid', 'READY')
```

## 🛡️ Error Handling

### Scenario 1: Database Unavailable
- Service logs warning
- Continues with file system only
- No service interruption

### Scenario 2: Save Failure
- Course status set to FAILED
- Error message stored in database
- Error status published to RabbitMQ

### Scenario 3: Missing user_id
- Validation error before processing
- Request rejected immediately
- Clear error message returned

## 📈 Performance Optimizations

1. **Indexes** on common query patterns (slug, status, course_id)
2. **Split tables** - Large content in separate `lesson_bodies` table
3. **Compression** - LZ4 compression on text fields
4. **Connection pooling** - Ready for connection pool integration
5. **Efficient queries** - Pre-defined views for common operations

## 🧪 Testing

### Test Database Connection
```bash
python test_database.py
```

### Test Complete Flow
```bash
# Terminal 1: Start service
python app.py

# Terminal 2: Send request
python test_publisher.py
```

### Check Database
```sql
-- See the newly created course
SELECT * FROM courses ORDER BY created_at DESC LIMIT 1;

-- See its lessons
SELECT * FROM lessons WHERE course_id = 'course-uuid';

-- See lesson content
SELECT * FROM v_lessons_full WHERE course_id = 'course-uuid';
```

## 📚 Documentation

1. **README.md** - Main documentation (updated)
2. **DATABASE.md** - Database guide (new)
3. **IMPLEMENTATION_SUMMARY.md** - Technical details (new)
4. **schema.sql** - Database schema (existing)

## ⚙️ Configuration

All configuration is via environment variables in `.env`:

```env
# Required for database features
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learningdb
DB_USER=postgres
DB_PASSWORD=your_password

# Existing configuration
OPENAI_API_KEY=sk-...
VECTOR_DB_ID=vs-...
RABBITMQ_HOST=localhost
# ... etc
```

## 🎁 Bonus Features

### 1. Automatic Slug Generation
- Course slugs auto-generated from titles
- URL-friendly format
- PostgreSQL trigger handles it

### 2. Timestamp Tracking
- `created_at` - When course was requested
- `updated_at` - Last modification
- `generated_at` - When generation completed

### 3. Source Tracking
- All sources used stored as array
- Per-lesson source tracking
- Easy attribution and citation

### 4. Structured Content
- Markdown for display
- JSON for programmatic access
- Sections parsed automatically

## 🔄 Migration Path

### From File System
- Old courses in `courses/` directory remain
- New courses go to database + file system
- No data loss
- Gradual migration

### Disable File System (Optional)
In `src/consumers/generation_consumer.py`, remove/comment:
```python
# course_dir = self.course_service.save_course(course)
```

## ✅ What You Get

✅ **Persistent database storage** for all courses  
✅ **User association** via user_id  
✅ **Status tracking** (QUEUED → GENERATING → READY/FAILED)  
✅ **Dual format storage** (Markdown + JSON)  
✅ **Error handling** with error messages stored  
✅ **Course metadata** (title, topic, grade_level, etc.)  
✅ **Lesson organization** with structured content  
✅ **Query capabilities** via SQL  
✅ **Pre-defined views** for common queries  
✅ **File system backup** (optional)  
✅ **Automatic slugs** for URLs  
✅ **Timestamp tracking** for audit trail  
✅ **Source attribution** for lessons  
✅ **Compressed storage** for efficiency  

## 🎯 Next Steps

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Setup database**: Run `schema.sql`
3. **Test connection**: `python test_database.py`
4. **Start service**: `python app.py`
5. **Test generation**: `python test_publisher.py`
6. **Query results**: Check PostgreSQL for data

## 📞 Need Help?

- **Database issues**: See DATABASE.md
- **Setup issues**: Run `setup.bat` on Windows
- **Query examples**: Check DATABASE.md
- **API integration**: See IMPLEMENTATION_SUMMARY.md

## 🎉 You're Ready!

Your Course Generator Service now has enterprise-grade database storage with:
- User association
- Status tracking
- Dual storage (DB + files)
- Comprehensive error handling
- Full documentation

Happy course generating! 🚀
