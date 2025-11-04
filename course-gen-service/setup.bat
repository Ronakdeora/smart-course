@echo off
REM Setup script for Course Generator Service - Windows
echo ======================================================================
echo Course Generator Service - Setup
echo ======================================================================
echo.

REM Check Python installation
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo.

REM Install dependencies
echo [2/5] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

REM Check PostgreSQL
echo [3/5] Checking PostgreSQL connection...
python -c "from dotenv import load_dotenv; load_dotenv(); from src.config import Settings; s = Settings(); print(f'Database: {s.database.name} on {s.database.host}:{s.database.port}')"
echo.
echo Please ensure:
echo - PostgreSQL is running
echo - Database exists (run: createdb learningdb)
echo - Schema is loaded (run: psql -U postgres -d learningdb -f schema.sql)
echo.
echo Test database connection? (Y/N)
set /p test_db=
if /i "%test_db%"=="Y" (
    python test_database.py
    if errorlevel 1 (
        echo.
        echo WARNING: Database connection test failed
        echo You can continue but database features will not work
        echo.
    )
)
echo.

REM Check RabbitMQ
echo [4/5] Checking RabbitMQ configuration...
python -c "from dotenv import load_dotenv; load_dotenv(); from src.config import Settings; s = Settings(); print(f'RabbitMQ: {s.rabbitmq.host}:{s.rabbitmq.port}')"
echo.
echo Please ensure RabbitMQ is running:
echo - Docker: docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
echo - Management UI: http://localhost:15672 (guest/guest)
echo.

REM Setup complete
echo [5/5] Setup complete!
echo ======================================================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running and schema is loaded
echo 2. Make sure RabbitMQ is running
echo 3. Start the service: python app.py
echo 4. Test with: python test_publisher.py
echo.
echo Documentation:
echo - README.md - General documentation
echo - DATABASE.md - Database integration guide
echo - IMPLEMENTATION_SUMMARY.md - Technical details
echo.
echo ======================================================================
pause
