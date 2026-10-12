@echo off
setlocal enabledelayedexpansion
cd /d "C:\Users\User\Desktop\seehear (2)"
echo Installing dependencies...
.venv\Scripts\python.exe -m pip install --quiet flask flask-cors requests beautifulsoup4 python-dotenv
echo.
echo Starting backend server...
cd seehear
.venv\Scripts\python.exe website_analyzer_backend.py
pause
