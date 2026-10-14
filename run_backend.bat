@echo off
title Student Performance Prediction - Flask Backend
echo ========================================================
echo   Starting Flask Backend API on http://127.0.0.1:5000
echo ========================================================
cd /d "%~dp0"

if exist "backend\venv\Scripts\python.exe" (
    echo Using Python Virtual Environment...
    "backend\venv\Scripts\python.exe" backend\app.py
) else (
    echo Using System Python...
    python backend\app.py
)

pause
