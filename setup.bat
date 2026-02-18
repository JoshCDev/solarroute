@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo.
echo    ███████╗ ██████╗ ██████╗ ███████╗████████╗██████╗  ██████╗ ███████╗
echo    ██╔════╝██╔═══██╗██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝
echo    ███████╗██║   ██║██║  ██║█████╗     ██║   ██████╔╝██║   ██║███████╗
echo    ╚════██║██║   ██║██║  ██║██╔══╝     ██║   ██╔══██╗██║   ██║╚════██║
echo    ███████║╚██████╔╝██████╔╝███████╗   ██║   ██║  ██║╚██████╔╝███████║
echo    ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
echo.
echo                     First-Time Setup Script v1.0
echo.

:: Check Python
echo [1/6] Checking Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install from https://python.org
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYVER=%%i
echo        Python %PYVER% found

:: Check Node.js
echo [2/6] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODEVER=%%i
echo        Node.js %NODEVER% found

:: Setup Backend
echo [3/6] Setting up Backend...
cd /d "%~dp0backend"

if not exist ".venv" (
    echo        Creating virtual environment...
    python -m venv .venv
)

echo        Activating virtual environment...
call .venv\Scripts\activate.bat

echo        Upgrading pip...
python -m pip install --upgrade pip --quiet

echo        Installing Python dependencies...
pip install -r requirements.txt --quiet

if exist ".env.example" if not exist ".env" (
    echo        Creating .env file...
    copy .env.example .env >nul
)

echo        [OK] Backend setup complete

:: Setup Frontend
echo [4/6] Setting up Frontend...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo        Installing npm dependencies...
    npm install --silent
)

if not exist ".env" (
    echo        Creating .env file...
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
    ) > .env
)

echo        [OK] Frontend setup complete

:: Return to root
cd /d "%~dp0"

:: Create run scripts
echo [5/6] Creating run scripts...

(
    echo @echo off
    echo cd /d "%%~dp0backend"
    echo call .venv\Scripts\activate.bat
    echo python main.py
) > run-backend.bat

(
    echo @echo off
    echo cd /d "%%~dp0frontend"
    echo npm run dev
) > run-frontend.bat

echo        [OK] Run scripts created

:: Final message
echo.
echo ========================================
echo          SETUP COMPLETE!
echo ========================================
echo.
echo  To start the application:
echo.
echo    Terminal 1: run-backend.bat
echo    Terminal 2: run-frontend.bat
echo.
echo  URLs:
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:8000
echo.
echo  Don't forget to:
echo    1. Set up PostgreSQL with PostGIS
echo    2. Add your API keys to .env files
echo       - backend/.env:  OPENWEATHER_API_KEY
echo       - frontend/.env: VITE_GOOGLE_MAPS_API_KEY
echo.
echo ========================================
echo.
pause
