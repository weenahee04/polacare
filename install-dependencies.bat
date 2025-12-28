@echo off
cd /d "%~dp0"
echo 📦 Installing POLACARE Dependencies...
echo Current directory: %CD%
echo.

echo [1/2] Installing Frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend install failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Installing Backend dependencies...
cd backend
if %errorlevel% neq 0 (
    echo ❌ Cannot find backend directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend install failed!
    pause
    exit /b 1
)

echo.
echo ✅ All dependencies installed!
echo.
echo Now you can run:
echo   - start-backend.bat
echo   - start-frontend.bat
echo.
pause

