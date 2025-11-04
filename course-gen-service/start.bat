@echo off
REM Course Generator Microservice Launcher
REM This script starts the unified microservice

echo.
echo ====================================================================
echo   Course Generator Microservice
echo ====================================================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create a .env file based on .env.example
    echo.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist venv (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Installing dependencies...
pip install -q -r requirements.txt

REM Start the application
echo.
echo [INFO] Starting Course Generator Microservice...
echo.
python app.py

REM Deactivate on exit
deactivate
