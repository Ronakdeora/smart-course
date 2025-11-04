# Course Generator Service

A unified RabbitMQ-based microservice for generating educational courses using OpenAI's API.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Course Generator Microservice                 │
│                                                                   │
│  ┌────────────────────┐          ┌──────────────────────┐       │
│  │  Generation        │          │  Status              │       │
│  │  Consumer Thread   │          │  Consumer Thread     │       │
│  │                    │          │                      │       │
│  │  • Receives        │          │  • Monitors          │       │
│  │    requests        │          │    progress          │       │
│  │  • Generates       │◄────────►│  • Displays          │       │
│  │    courses         │          │    updates           │       │
│  │  • Publishes       │          │                      │       │
│  │    status          │          │                      │       │
│  └────────┬───────────┘          └──────────────────────┘       │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────────┐                                        │
│  │ Course Generator    │                                        │
│  │ Service             │                                        │
│  │ (OpenAI API)        │                                        │
│  └─────────────────────┘                                        │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   RabbitMQ   │
                   │   Exchange   │
                   └──────────────┘
```

## ✨ Features

- **🔄 Unified Service**: Single process runs both generation and status consumers
- **🧵 Multi-threaded**: Each consumer runs in its own thread for parallel processing
- **📦 Modular Design**: Clean separation of concerns with services, consumers, and config
- **🔌 Extensible**: Easy to add new consumers or services
- **⚙️ Configuration-driven**: Environment-based settings
- **📊 Real-time Monitoring**: Built-in status tracking
- **🛡️ Robust Error Handling**: Comprehensive error handling and logging
- **💾 Database Storage**: Stores courses in PostgreSQL for persistence and querying
- **📁 Dual Storage**: Also saves to file system as backup
- **👤 User Association**: Links courses to users via user_id

## 📁 Project Structure

```
course-gen-service/
├── app.py                          # Main application entry point
├── test_publisher.py               # Test utility to send requests
├── requirements.txt                # Python dependencies
├── .env                           # Environment configuration
├── .env.example                   # Example environment file
├── README.md                      # This file
│
├── src/                           # Source code
│   ├── __init__.py
│   ├── config/                    # Configuration
│   │   ├── __init__.py
│   │   └── settings.py           # Settings management
│   │
│   ├── services/                  # Business logic
│   │   ├── __init__.py
│   │   ├── course_generator.py   # Course generation service
│   │   └── database_service.py   # PostgreSQL database service
│   │
│   ├── consumers/                 # RabbitMQ consumers
│   │   ├── __init__.py
│   │   ├── base_consumer.py      # Base consumer class
│   │   ├── generation_consumer.py # Course generation consumer
│   │   └── status_consumer.py    # Status monitoring consumer
│   │
│   └── utils/                     # Utilities
│       ├── __init__.py
│       └── logger.py             # Logging setup
│
└── courses/                       # Generated courses output
    └── [topic-grade]/
        ├── course.json
        └── course.md
```

## 🚀 Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup PostgreSQL Database

**Create the database:**
```bash
createdb learningdb
```

**Load the schema:**
```bash
psql -U postgres -d learningdb -f schema.sql
```

**Test database connection:**
```bash
python test_database.py
```

### 3. Configure Environment

Create a `.env` file based on `.env.example`:

```bash
# OpenAI
OPENAI_API_KEY=sk-your-key-here
VECTOR_DB_ID=vs-your-vector-store-id

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_EXCHANGE=course.exchange
RABBITMQ_QUEUE_GENERATION=course.generation.queue
RABBITMQ_QUEUE_STATUS=course.status.queue
RABBITMQ_ROUTE_GENERATE=course.generate
RABBITMQ_ROUTE_STATUS=course.status

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learningdb
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Start RabbitMQ

Make sure RabbitMQ is running:

```bash
# Using Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Access management UI at http://localhost:15672
# Default credentials: guest/guest
```

## 🎮 Usage

### Start the Microservice (Single Command!)

```bash
python app.py
```

This single command starts:
- ✅ Course Generation Consumer (processes course requests)
- ✅ Status Consumer (displays real-time updates)
- ✅ All necessary RabbitMQ connections

**Output:**
```
2025-11-03 10:30:00 - INFO - ======================================================================
2025-11-03 10:30:00 - INFO - Course Generator Microservice Starting...
2025-11-03 10:30:00 - INFO - ======================================================================
2025-11-03 10:30:00 - INFO - Initializing services...
2025-11-03 10:30:00 - INFO - Services initialized successfully
2025-11-03 10:30:00 - INFO - Initializing consumers...
2025-11-03 10:30:00 - INFO - Initialized 2 consumers
2025-11-03 10:30:00 - INFO - Starting CourseGenerationConsumer...
2025-11-03 10:30:00 - INFO - Starting StatusConsumer...
2025-11-03 10:30:01 - INFO - Connected to RabbitMQ successfully
2025-11-03 10:30:01 - INFO - Waiting for messages on queue: course.generation.queue
2025-11-03 10:30:01 - INFO - Connected to RabbitMQ successfully
2025-11-03 10:30:01 - INFO - Listening for status updates on: course.status.queue
2025-11-03 10:30:01 - INFO - ======================================================================
2025-11-03 10:30:01 - INFO - All consumers started successfully!
2025-11-03 10:30:01 - INFO - Active consumers: 2
2025-11-03 10:30:01 - INFO - Press CTRL+C to shutdown
2025-11-03 10:30:01 - INFO - ======================================================================
```

### Send a Course Generation Request

Use the test publisher to send requests:

```bash
python test_publisher.py
```

Or programmatically:

```python
from test_publisher import publish_course_request

request_id = publish_course_request(
    topic="Photosynthesis",
    grade_level="Grade 10",
    num_lessons=5,
    source_filter="biology/"
)
```

## Message Format

### Generation Request Message

```json
{
  "request_id": "uuid-here",
  "user_id": "user-uuid-here",
  "topic": "Gram staining",
  "grade_level": "Grade 8",
  "num_lessons": 4,
  "source_filter": "microbiology/"
}
```

**Required Fields:**
- `topic`: The subject matter for the course
- `user_id`: UUID of the user creating the course

**Optional Fields:**
- `request_id`: Unique identifier (auto-generated if not provided)
- `grade_level`: Target grade level (default: "Grade 8")
- `num_lessons`: Number of lessons to generate (default: 4)
- `source_filter`: Filter for vector store sources (default: null)

### Status Update Messages

**Processing Status:**
```json
{
  "request_id": "uuid-here",
  "status": "processing",
  "message": "Generating course for 'Gram staining'",
  "timestamp": "2025-11-03T10:30:00"
}
```

**Success Status:**
```json
{
  "request_id": "uuid-here",
  "status": "success",
  "message": "Course generated successfully",
  "course_id": "course-uuid-from-database",
  "course_title": "Introduction to Gram Staining",
  "total_lessons": 4,
  "timestamp": "2025-11-03T10:35:00"
}
```

**Error Status:**
```json
{
  "request_id": "uuid-here",
  "status": "error",
  "message": "Error description here",
  "timestamp": "2025-11-03T10:32:00"
}
```

## Output

Generated courses are saved to:

1. **PostgreSQL Database** (primary storage)
   - `courses` table: Course metadata and status
   - `lessons` table: Lesson metadata
   - `lesson_bodies` table: Full content (markdown + JSON)
   
2. **File System** (backup)
   - `courses/` directory with JSON and Markdown files

### Database Storage

See [DATABASE.md](DATABASE.md) for complete documentation on:
- Database schema
- Tables and relationships
- Query examples
- Migration guide

### File System Backup

```
courses/
└── gram-staining-grade8/
    ├── course.json          # Complete course data
    └── course.md            # Formatted markdown version
```

### Course Structure

```json
{
  "metadata": {
    "title": "Course title",
    "topic": "Topic name",
    "grade_level": "Grade 8",
    "total_lessons": 4,
    "generated_at": "ISO timestamp"
  },
  "outline": {
    "course_title": "...",
    "lessons": [...]
  },
  "lessons": [
    {
      "lesson_info": {
        "lesson_number": 1,
        "title": "...",
        "description": "...",
        "key_concepts": [...],
        "learning_objectives": [...]
      },
      "content": "Full lesson content...",
      "sources": [...],
      "generated_at": "ISO timestamp"
    }
  ],
  "all_sources": [...]
}
```

## 📦 Components

### Application (`app.py`)

Main entry point that:
- Initializes all services and consumers
- Manages multi-threaded consumer execution
- Handles graceful shutdown
- Provides centralized logging

### Services

**CourseGeneratorService** (`src/services/course_generator.py`):
- Searches OpenAI vector store for content
- Generates course outlines
- Creates detailed lesson content
- Saves courses to database and disk

**DatabaseService** (`src/services/database_service.py`):
- PostgreSQL connection management
- Course and lesson CRUD operations
- Status tracking (QUEUED → GENERATING → READY/FAILED)
- Content storage (markdown + JSON)

### Consumers

**BaseConsumer** (`src/consumers/base_consumer.py`):
- Abstract base class for all consumers
- Manages RabbitMQ connections
- Provides common message handling patterns

**CourseGenerationConsumer** (`src/consumers/generation_consumer.py`):
- Consumes course generation requests
- Orchestrates course creation workflow
- Publishes status updates

**StatusConsumer** (`src/consumers/status_consumer.py`):
- Monitors status updates
- Displays formatted progress information
- Provides real-time feedback

### Configuration

**Settings** (`src/config/settings.py`):
- Centralized configuration management
- Environment variable loading
- Type-safe configuration objects

## 🔧 Development

### Running in Development

```bash
# Terminal 1: Start the microservice
python app.py

# Terminal 2: Send test requests
python test_publisher.py
```

### Adding a New Consumer

1. Create a new consumer class in `src/consumers/`:

```python
from .base_consumer import BaseConsumer

class MyNewConsumer(BaseConsumer):
    def get_queue_name(self) -> str:
        return "my.new.queue"
    
    def bind_queue(self):
        self.channel.queue_bind(
            exchange=self.settings.rabbitmq.exchange,
            queue="my.new.queue",
            routing_key="my.routing.key"
        )
    
    def process_message(self, ch, method, properties, body):
        # Your logic here
        ch.basic_ack(delivery_tag=method.delivery_tag)
```

2. Add it to `app.py`:

```python
from src.consumers import MyNewConsumer

# In initialize_consumers():
my_consumer = MyNewConsumer(settings=self.settings)
self.consumers.append(my_consumer)
```

3. Restart the application - your new consumer will run automatically!

### Adding a New Service

1. Create a service in `src/services/`:

```python
class MyNewService:
    def __init__(self, config):
        self.config = config
    
    def do_something(self):
        # Your logic here
        pass
```

2. Initialize in `app.py`:

```python
# In initialize_services():
self.my_service = MyNewService(config=self.settings)
```

3. Use it in your consumers:

```python
consumer = MyConsumer(
    settings=self.settings,
    my_service=self.my_service
)
```

## 📊 Logging

The service uses structured logging with INFO level by default:

```
2025-11-03 10:30:15 - src.consumers.generation_consumer - INFO - Received course generation request: {...}
2025-11-03 10:30:15 - src.services.course_generator - INFO - Starting course generation: Gram staining
2025-11-03 10:30:20 - src.services.course_generator - INFO - Generating outline for 'Gram staining' - 4 lessons
2025-11-03 10:30:25 - src.services.course_generator - INFO - Generated outline with 4 lessons
2025-11-03 10:30:30 - src.services.course_generator - INFO - Generating content for lesson: Introduction to Bacteria
2025-11-03 10:30:45 - src.services.course_generator - INFO - Completed lesson 1
...
```

Change log level via environment variable:

```bash
LOG_LEVEL=DEBUG python app.py
```

## ⚠️ Error Handling

The service includes comprehensive error handling:

- **Connection Errors**: Logs and raises connection failures with retry logic
- **Message Validation**: Validates required fields before processing
- **Generation Errors**: Catches and reports OpenAI API errors
- **File I/O Errors**: Handles file system errors gracefully
- **Message Rejection**: Failed messages are not requeued to prevent infinite loops
- **Graceful Shutdown**: Properly closes all connections and threads on CTRL+C

## 🎯 Benefits of This Architecture

### Before (Separate Scripts)
❌ Had to run multiple virtual environments  
❌ Multiple terminal windows needed  
❌ Manual process management  
❌ Difficult to coordinate between consumers  
❌ Separate logging streams  

### After (Unified Microservice)
✅ **Single Entry Point**: One command starts everything  
✅ **One Virtual Environment**: All dependencies managed together  
✅ **Coordinated Execution**: Consumers work together seamlessly  
✅ **Unified Logging**: All logs in one stream  
✅ **Easy Deployment**: Single process to containerize/deploy  
✅ **Extensible**: Add new consumers without changing architecture  
✅ **Production-Ready**: Proper shutdown handling, error recovery  

## 🐳 Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

Build and run:

```bash
docker build -t course-generator .
docker run --env-file .env course-generator
```

## Requirements

- Python 3.8+
- PostgreSQL 12+
- RabbitMQ 3.8+
- OpenAI API access with vector store
- Dependencies in `requirements.txt`

## 📚 Additional Documentation

- **[DATABASE.md](DATABASE.md)** - Complete database integration guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation details and changes

## License

MIT
