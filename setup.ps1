<#
.SYNOPSIS
    SolarRoute First-Time Setup Script
.DESCRIPTION
    This script sets up the complete SolarRoute development environment.
    Run this once when moving the project to a new machine.
.NOTES
    Requirements: PowerShell 5.1+, Python 3.10+, Node.js 18+, PostgreSQL 14+ with PostGIS, Redis
#>

param(
    [switch]$SkipDb,
    [switch]$SkipRedis,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "SolarRoute Setup"

if ($Help) {
    Write-Host @"
SolarRoute Setup Script
=======================

Usage: .\setup.ps1 [-SkipDb] [-SkipRedis] [-Help]

Options:
    -SkipDb     Skip database setup (if already configured)
    -SkipRedis  Skip Redis check (if not using caching)
    -Help       Show this help message

Prerequisites:
    - Python 3.10 or higher
    - Node.js 18 or higher
    - PostgreSQL 14+ with PostGIS extension
    - Redis (optional, for caching)
    - Git (optional)

"@
    exit 0
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  [!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "  [X] $Message" -ForegroundColor Red
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Get-PythonVersion {
    $version = python --version 2>&1
    if ($version -match "(\d+)\.(\d+)") {
        return [int]"$($Matches[1])$($Matches[2])"
    }
    return 0
}

function Get-NodeVersion {
    $version = node --version 2>&1
    if ($version -match "v(\d+)\.") {
        return [int]$Matches[1]
    }
    return 0
}

Clear-Host
Write-Host @"

   ███████╗ ██████╗ ██████╗ ███████╗████████╗██████╗  ██████╗ ███████╗
   ██╔════╝██╔═══██╗██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝
   ███████╗██║   ██║██║  ██║█████╗     ██║   ██████╔╝██║   ██║███████╗
   ╚════██║██║   ██║██║  ██║██╔══╝     ██║   ██╔══██╗██║   ██║╚════██║
   ███████║╚██████╔╝██████╔╝███████╗   ██║   ██║  ██║╚██████╔╝███████║
   ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
   
                    First-Time Setup Script v1.0
                    Target: Indonesian Solar Market

"@ -ForegroundColor Magenta

# ============================================
# STEP 0: Prerequisites Check
# ============================================
Write-Step "Checking Prerequisites"

$prereqsOk = $true

# Check Python
if (Test-Command "python") {
    $pyVersion = Get-PythonVersion
    if ($pyVersion -ge 310) {
        $version = python --version 2>&1
        Write-Success "Python: $version"
    } else {
        Write-Error "Python 3.10+ required. Found: $(python --version)"
        $prereqsOk = $false
    }
} else {
    Write-Error "Python not found. Install from https://python.org"
    $prereqsOk = $false
}

# Check pip
if (Test-Command "pip") {
    Write-Success "pip: $(pip --version 2>&1 | ForEach-Object { $_.Split()[0..1] -join ' ' })"
} else {
    Write-Error "pip not found"
    $prereqsOk = $false
}

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = Get-NodeVersion
    if ($nodeVersion -ge 18) {
        Write-Success "Node.js: $(node --version)"
    } else {
        Write-Error "Node.js 18+ required. Found: $(node --version)"
        $prereqsOk = $false
    }
} else {
    Write-Error "Node.js not found. Install from https://nodejs.org"
    $prereqsOk = $false
}

# Check npm
if (Test-Command "npm") {
    Write-Success "npm: $(npm --version)"
} else {
    Write-Error "npm not found"
    $prereqsOk = $false
}

# Check PostgreSQL (optional but recommended)
if (-not $SkipDb) {
    if (Test-Command "psql") {
        $pgVersion = psql --version 2>&1
        Write-Success "PostgreSQL: $pgVersion"
    } else {
        Write-Warning "PostgreSQL not in PATH. Ensure it's installed with PostGIS."
        Write-Warning "Download from: https://www.postgresql.org/download/windows/"
    }
}

# Check Redis (optional)
if (-not $SkipRedis) {
    $redisRunning = $false
    try {
        $redisCheck = redis-cli ping 2>&1
        if ($redisCheck -eq "PONG") {
            Write-Success "Redis: Running"
            $redisRunning = $true
        }
    } catch {
        Write-Warning "Redis not running. Caching will use fallback."
        Write-Warning "Download from: https://github.com/tporadowski/redis/releases"
    }
}

if (-not $prereqsOk) {
    Write-Host "`n[FATAL] Missing required prerequisites. Install them and re-run setup." -ForegroundColor Red
    exit 1
}

# ============================================
# STEP 1: Backend Setup
# ============================================
Write-Step "Setting Up Backend (Python)"

$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

# Create virtual environment
if (Test-Path ".venv") {
    Write-Warning "Virtual environment already exists. Skipping creation."
} else {
    Write-Host "  Creating Python virtual environment..." -NoNewline
    python -m venv .venv
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Created .venv"
    } else {
        Write-Error "Failed to create virtual environment"
        exit 1
    }
}

# Activate virtual environment
Write-Host "  Activating virtual environment..."
& ".\.venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "  Upgrading pip..." -NoNewline
python -m pip install --upgrade pip --quiet 2>&1 | Out-Null
Write-Success "Done"

# Fix/create requirements.txt if corrupted
$requirementsPath = "requirements.txt"
$requirementsContent = @"
fastapi>=0.100.0
uvicorn>=0.23.0
pvlib>=0.10.0
numpy>=1.24.0
pandas>=2.0.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
sqlalchemy>=2.0.0
asyncpg>=0.28.0
redis>=5.0.0
httpx>=0.24.0
python-multipart
python-dotenv
geoalchemy2>=0.14.0
shapely>=2.0.0
"@

# Check if requirements.txt is valid
$needsFix = $false
if (-not (Test-Path $requirementsPath)) {
    $needsFix = $true
} else {
    $content = Get-Content $requirementsPath -Raw -ErrorAction SilentlyContinue
    if ([string]::IsNullOrWhiteSpace($content) -or $content.Length -gt 1000) {
        $needsFix = $true
    }
}

if ($needsFix) {
    Write-Warning "Creating fresh requirements.txt"
    Set-Content -Path $requirementsPath -Value $requirementsContent -Encoding UTF8
}

# Install Python dependencies
Write-Host "  Installing Python dependencies (this may take a minute)..."
pip install -r requirements.txt --quiet 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "Python dependencies installed"
} else {
    Write-Error "Failed to install Python dependencies"
    Write-Host "  Try running: pip install -r requirements.txt"
    exit 1
}

# Create .env if not exists
if (Test-Path ".env") {
    Write-Warning ".env already exists. Keeping existing configuration."
} else {
    Write-Host "  Creating .env from template..."
    Copy-Item ".env.example" ".env"
    Write-Success "Created .env - Please update with your API keys!"
}

# ============================================
# STEP 2: Frontend Setup
# ============================================
Write-Step "Setting Up Frontend (Node.js)"

$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Warning "node_modules already exists. Skipping npm install."
    Write-Host "  To reinstall, run: Remove-Item -Recurse -Force node_modules; npm install"
} else {
    Write-Host "  Installing npm dependencies (this may take a few minutes)..."
    npm install --silent 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "npm dependencies installed"
    } else {
        Write-Error "Failed to install npm dependencies"
        exit 1
    }
}

# Create frontend .env if not exists
if (-not (Test-Path ".env")) {
    $frontendEnv = @"
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
"@
    Set-Content -Path ".env" -Value $frontendEnv -Encoding UTF8
    Write-Success "Created frontend/.env"
} else {
    Write-Warning "frontend/.env already exists. Keeping existing configuration."
}

# ============================================
# STEP 3: Database Setup
# ============================================
if (-not $SkipDb) {
    Write-Step "Setting Up Database"

    Write-Host @"
  
  Database setup requires PostgreSQL with PostGIS extension.
  
  If you haven't already, please:
  
  1. Open pgAdmin or psql
  2. Create database: CREATE DATABASE solarroute;
  3. Connect to it: \c solarroute
  4. Enable PostGIS: CREATE EXTENSION postgis;
  
  Or run this script with -SkipDb if database is already set up.

"@

    $createDb = Read-Host "  Create database tables now? (Y/n)"
    
    if ($createDb -ne "n" -and $createDb -ne "N") {
        Set-Location $backendPath
        & ".\.venv\Scripts\Activate.ps1"
        
        # Create init script and run it
        $initScript = @'
import asyncio
from sqlalchemy import text
from core.database import engine, Base
from models.orm import Site, SolarCache, SimulationResult

async def init_db():
    print("  Creating database tables...")
    async with engine.begin() as conn:
        # Enable PostGIS extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("  [OK] Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
'@
        Set-Content -Path "init_db_temp.py" -Value $initScript -Encoding UTF8
        
        try {
            python init_db_temp.py
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database tables created"
            }
        } catch {
            Write-Warning "Could not create tables. Make sure PostgreSQL is running and credentials are correct."
        } finally {
            Remove-Item "init_db_temp.py" -ErrorAction SilentlyContinue
        }
    }
}

# ============================================
# STEP 4: API Keys Configuration
# ============================================
Write-Step "API Keys Configuration"

Write-Host @"

  SolarRoute requires the following API keys:

  1. OpenWeatherMap API Key (for weather data)
     - Get free key at: https://openweathermap.org/api
     - Add to: backend/.env
     
  2. Google Maps API Key (for satellite imagery)
     - Get key at: https://console.cloud.google.com/
     - Enable: Maps JavaScript API, Geocoding API
     - Add to: frontend/.env

"@

$openApiKeys = Read-Host "  Configure API keys now? (Y/n)"

if ($openApiKeys -ne "n" -and $openApiKeys -ne "N") {
    # OpenWeatherMap
    $owmKey = Read-Host "  Enter OpenWeatherMap API Key (or press Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($owmKey)) {
        $backendEnvPath = Join-Path $backendPath ".env"
        $envContent = Get-Content $backendEnvPath -Raw
        $envContent = $envContent -replace "OPENWEATHER_API_KEY=.*", "OPENWEATHER_API_KEY=$owmKey"
        Set-Content -Path $backendEnvPath -Value $envContent -Encoding UTF8
        Write-Success "OpenWeatherMap API key saved"
    }
    
    # Google Maps
    $gmapsKey = Read-Host "  Enter Google Maps API Key (or press Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($gmapsKey)) {
        $frontendEnvPath = Join-Path $frontendPath ".env"
        $envContent = Get-Content $frontendEnvPath -Raw
        $envContent = $envContent -replace "VITE_GOOGLE_MAPS_API_KEY=.*", "VITE_GOOGLE_MAPS_API_KEY=$gmapsKey"
        Set-Content -Path $frontendEnvPath -Value $envContent -Encoding UTF8
        Write-Success "Google Maps API key saved"
    }
}

# ============================================
# STEP 5: Final Verification
# ============================================
Write-Step "Verification & Summary"

Set-Location $PSScriptRoot

# Create run scripts
$runBackendScript = @'
@echo off
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
python main.py
'@
Set-Content -Path "run-backend.bat" -Value $runBackendScript -Encoding ASCII

$runFrontendScript = @'
@echo off
cd /d "%~dp0frontend"
npm run dev
'@
Set-Content -Path "run-frontend.bat" -Value $runFrontendScript -Encoding ASCII

Write-Success "Created run-backend.bat"
Write-Success "Created run-frontend.bat"

# Summary
Write-Host @"

========================================
          SETUP COMPLETE!
========================================

  Project Location: $PSScriptRoot

  To start the application:

    Terminal 1 (Backend):
      cd backend
      .venv\Scripts\activate
      python main.py
      OR just run: .\run-backend.bat

    Terminal 2 (Frontend):
      cd frontend
      npm run dev
      OR just run: .\run-frontend.bat

  URLs:
    Frontend:  http://localhost:5173
    Backend:   http://localhost:8000
    API Docs:  http://localhost:8000/docs

  Configuration Files:
    backend/.env   - Database, Redis, OpenWeatherMap key
    frontend/.env  - API URL, Google Maps key

  Database:
    PostgreSQL with PostGIS extension required
    Tables: sites, solar_data_cache, simulation_results

========================================

"@ -ForegroundColor Cyan

Write-Host "  Ready to harness the sun! " -NoNewline
Write-Host "☀️🚀" -ForegroundColor Yellow
