@echo off
REM Italian Corner Invoice App v1.1.0 - Build Electron Executable
REM This script builds the Electron executable with all new features

setlocal enabledelayedexpansion

echo.
echo ======================================================
echo Building Italian Corner Invoice App v1.1.0 (Electron)
echo ======================================================
echo Features: GSIS Lookup, Cancel Invoices, Auto-Updates
echo ======================================================
echo.

set SCRIPT_DIR=%~dp0

REM Check if we're in the right directory
if not exist "%SCRIPT_DIR%dist" (
    echo [ERROR] dist folder not found - Please run "npm run build" first
    pause
    exit /b 1
)

if not exist "%SCRIPT_DIR%backendaade" (
    echo [ERROR] backendaade folder not found
    pause
    exit /b 1
)

echo [OK] Project structure validated

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed

REM Copy electron-package.json to package.json for Electron build
echo [*] Preparing Electron build configuration...
if exist "%SCRIPT_DIR%electron-package.json" (
    copy /y "%SCRIPT_DIR%electron-package.json" "%SCRIPT_DIR%package.json"
    echo [OK] Electron configuration applied
) else (
    echo [ERROR] electron-package.json not found
    pause
    exit /b 1
)

REM Install Electron dependencies
echo.
echo [*] Installing Electron and build tools...
call npm install --save-dev electron@27.0.0 electron-builder@24.6.4

if errorlevel 1 (
    echo [WARNING] Some dependencies had issues but continuing...
)

echo [OK] Dependencies installed

REM Build Electron executable
echo.
echo [*] Building Electron executable for Windows...
call npx electron-builder --win --publish never

if errorlevel 1 (
    echo [ERROR] Electron build failed
    pause
    exit /b 1
)

echo [OK] Electron build completed successfully!

REM Verify output
if exist "%SCRIPT_DIR%dist\Italian Corner Invoice 1.0.0.exe" (
    echo [OK] Executable created: Italian Corner Invoice 1.0.0.exe
    echo.
    echo Build completed! The application is ready for distribution.
    echo Location: %SCRIPT_DIR%dist\Italian Corner Invoice 1.0.0.exe
) else (
    echo [WARNING] Executable may be in different location
    echo Check the dist folder
)

echo.
pause
exit /b 0
