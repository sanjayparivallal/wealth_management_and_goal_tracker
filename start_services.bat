@echo off
echo ===================================================
echo Wealth Management - Background Services Starter
echo ===================================================

REM Check if Redis is running
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] Redis Server is already running.
) else (
    echo [INFO] Starting Redis Server...
    start "Redis Server" "redis\redis-server.exe"
    echo [INFO] Waiting for Redis to initialize...
    timeout /t 3 /nobreak >nul
)

echo.
echo ===================================================
echo Starting Celery Worker + Beat (Scheduler)
echo ===================================================
echo This window must remain open for daily updates (6:00 PM IST).
echo.

cd backend
call venv\Scripts\activate

echo [INFO] Launching Celery Worker...
celery -A celery_app worker --beat --pool=solo --loglevel=info

pause
