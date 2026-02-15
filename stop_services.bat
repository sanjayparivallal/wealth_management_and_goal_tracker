@echo off
echo ===================================================
echo Wealth Management - Stopping Services
echo ===================================================

echo [INFO] Stopping Celery Worker...
taskkill /F /IM celery.exe >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo [SUCCESS] Celery Worker stopped.
) else (
    echo [INFO] Celery Worker was not running.
)

echo [INFO] Stopping Redis Server...
taskkill /F /IM redis-server.exe >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo [SUCCESS] Redis Server stopped.
) else (
    echo [INFO] Redis Server was not running.
)

echo.
echo [DONE] All background services have been stopped.
pause
