"""
Database connection test script
Usage: python test_database.py
"""

from dotenv import load_dotenv
load_dotenv()

import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from src.config import Settings
from src.services import DatabaseService
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def test_database_connection():
    """Test database connection and basic operations"""
    
    print("="*70)
    print("Database Connection Test")
    print("="*70)
    
    try:
        # Load settings
        settings = Settings()
        
        print(f"\nDatabase Configuration:")
        print(f"  Host: {settings.database.host}")
        print(f"  Port: {settings.database.port}")
        print(f"  Database: {settings.database.name}")
        print(f"  User: {settings.database.user}")
        
        # Initialize database service
        print("\n1. Initializing database service...")
        db_service = DatabaseService(config=settings.database)
        
        # Test connection
        print("2. Testing connection...")
        db_service.connect()
        print("   ✅ Connection successful!")
        
        # Test query
        print("3. Testing query execution...")
        with db_service.get_cursor() as cursor:
            cursor.execute("SELECT current_database(), current_user, version();")
            result = cursor.fetchone()
            print(f"   Database: {result['current_database']}")
            print(f"   User: {result['current_user']}")
            print(f"   Version: {result['version'][:50]}...")
        
        # Test table existence
        print("4. Checking tables...")
        with db_service.get_cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            tables = cursor.fetchall()
            
            expected_tables = ['courses', 'lessons', 'lesson_bodies', 'lesson_checks']
            found_tables = [row['table_name'] for row in tables]
            
            for table in expected_tables:
                if table in found_tables:
                    print(f"   ✅ Table '{table}' exists")
                else:
                    print(f"   ❌ Table '{table}' NOT FOUND")
        
        # Test views
        print("5. Checking views...")
        with db_service.get_cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.views 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            views = cursor.fetchall()
            
            expected_views = ['v_course_summary', 'v_course_lessons', 'v_lessons_full']
            found_views = [row['table_name'] for row in views]
            
            for view in expected_views:
                if view in found_views:
                    print(f"   ✅ View '{view}' exists")
                else:
                    print(f"   ❌ View '{view}' NOT FOUND")
        
        # Disconnect
        print("6. Closing connection...")
        db_service.disconnect()
        print("   ✅ Connection closed")
        
        print("\n" + "="*70)
        print("✅ All tests passed!")
        print("="*70)
        
    except Exception as e:
        print("\n" + "="*70)
        print(f"❌ Test failed: {e}")
        print("="*70)
        print("\nPlease ensure:")
        print("1. PostgreSQL is running")
        print("2. Database exists (create with: createdb learningdb)")
        print("3. Schema is loaded (psql -U postgres -d learningdb -f schema.sql)")
        print("4. Environment variables are set correctly in .env")
        sys.exit(1)


if __name__ == "__main__":
    test_database_connection()
