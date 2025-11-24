@echo off
REM Italian Corner Invoice App - Backend Service Installer v1.1.0
REM This script installs the AADE backend service to start automatically on Windows boot
REM Updated with GSIS Lookup support and Auto-Update logic

setlocal enabledelayedexpansion

echo.
echo ======================================================
echo Italian Corner Invoice App - Backend Service Setup v1.1.0
echo ======================================================
echo Features: Cancel Invoices, Auto-Updates, GSIS Lookup
echo ======================================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set BACKEND_FILE=%SCRIPT_DIR%aade-backend-standalone.cjs

REM Verify the backend file exists
if not exist "%BACKEND_FILE%" (
    echo [ERROR] Backend file not found: %BACKEND_FILE%
    echo Please ensure aade-backend-standalone.cjs is in this directory
    pause
    exit /b 1
)

echo [OK] Backend file found: aade-backend-standalone.cjs

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js first from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected: 
node --version

REM Install npm dependencies
echo.
echo [*] Installing npm dependencies...
cd /d "%SCRIPT_DIR%"

REM Install all dependencies from package.json
call npm install >nul 2>&1

if errorlevel 1 (
    echo [WARNING] npm install had issues, but backend may still work
)

echo [OK] Dependencies installed

REM Create startup script in Windows Startup folder
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set STARTUP_SCRIPT=%STARTUP_FOLDER%\start-aade-backend.bat

echo.
echo [*] Creating Windows startup script at:
echo     %STARTUP_SCRIPT%

(
    echo @echo off
    echo REM Auto-start Italian Corner AADE Backend Service
    echo cd /d "%SCRIPT_DIR%"
    echo node aade-backend-standalone.js --service
) > "%STARTUP_SCRIPT%"

if errorlevel 1 (
    echo [ERROR] Failed to create startup script
    pause
    exit /b 1
)

echo [OK] Startup script created

REM Start the service now
echo.
echo [*] Starting backend service (v1.1.0)...
start "Italian Corner AADE Backend Service v1.1.0" cmd /k node "%BACKEND_FILE%" --service --upgrade-check

timeout /t 3 /nobreak

REM Verify service is running
for /f "tokens=5" %%a in ('netstat -ano ^| find "3000" ^| find "LISTENING"') do (
    echo [OK] Backend service is running (PID: %%a^)
    echo.
    echo Setup complete!
    echo.
    echo The backend service will:
    echo  - Start automatically when you turn on your computer
    echo  - Listen on http://127.0.0.1:3000
    echo  - Check for application updates at startup (v1.1.0)
    echo  - Support GSIS VAT number lookup
    echo  - Support Cancel Invoice and Auto-Update features
    echo  - Keep logs in: %APPDATA%\Italian Corner Invoice\backend.log
    echo.
    pause
    exit /b 0
)

echo [WARNING] Service may not have started yet. Check in a few seconds.
pause
exit /b 0
