@echo off
cd /d "%~dp0"
echo 🚀 Starting POLACARE Backend...
cd backend
if %errorlevel% neq 0 (
    echo ❌ Cannot find backend directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)
call npm run dev
pause

