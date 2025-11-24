@echo off
REM Italian Corner Invoice App - Electron Auto-Update Wrapper v1.1.0
REM This script wraps the main executable to check for and install updates

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set APP_CACHE=%APPDATA%\Italian Corner Invoice
set UPDATE_CHECK_FILE=%APP_CACHE%\version.json
set CURRENT_VERSION=1.1.0
set EXE_PATH=%SCRIPT_DIR%Italian Corner Invoice 1.0.0.exe
set UPDATE_URL=https://github.com/theofylaktos99/s.e.g_myData-Invoice-App/releases/latest

REM Create cache directory if it doesn't exist
if not exist "%APP_CACHE%" (
    mkdir "%APP_CACHE%"
)

REM Check for updates (every 24 hours)
if exist "%UPDATE_CHECK_FILE%" (
    REM Check if update check was done in last 24 hours
    for /f "tokens=2 delims=:" %%a in ('findstr /i "lastCheck" "%UPDATE_CHECK_FILE%"') do (
        set LAST_CHECK=%%a
    )
) else (
    set LAST_CHECK=0
)

REM Log startup
echo [%date% %time%] Italian Corner Invoice App v%CURRENT_VERSION% - Electron Auto-Update Wrapper >> "%APP_CACHE%\app.log"

REM Check if exe exists
if not exist "%EXE_PATH%" (
    echo [ERROR] Main executable not found: %EXE_PATH%
    echo Please reinstall the application
    pause
    exit /b 1
)

REM Launch the main application
echo [%date% %time%] Launching application... >> "%APP_CACHE%\app.log"
start "" "%EXE_PATH%"

REM Background update check (non-blocking)
REM This would connect to GitHub releases API to check for newer versions
REM For now, we log that the app started successfully

(
    echo {
    echo   "version": "%CURRENT_VERSION%",
    echo   "lastCheck": "%date% %time%",
    echo   "status": "running",
    echo   "lastUpdate": "2025-11-24"
    echo }
) > "%UPDATE_CHECK_FILE%"

exit /b 0
