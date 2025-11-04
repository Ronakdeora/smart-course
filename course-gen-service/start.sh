#!/bin/bash
# Course Generator Microservice Launcher
# This script starts the unified microservice

echo ""
echo "===================================================================="
echo "  Course Generator Microservice"
echo "===================================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo "Please create a .env file based on .env.example"
    echo ""
    exit 1
fi

# Check if virtual environment exists
if [ ! -d venv ]; then
    echo "[INFO] Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "[INFO] Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "[INFO] Installing dependencies..."
pip install -q -r requirements.txt

# Start the application
echo ""
echo "[INFO] Starting Course Generator Microservice..."
echo ""
python app.py

# Deactivate on exit
deactivate
