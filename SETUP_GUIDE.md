# SolarRoute Setup Guide

## Prerequisites

Before running the setup script, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| Python | 3.10+ | https://python.org/downloads |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://postgresql.org/download |
| PostGIS | 3.0+ | Included with PostgreSQL Windows installer |
| Redis | 7+ | https://github.com/tporadowski/redis/releases (Windows) |

## Quick Start

### Option 1: PowerShell (Recommended)

```powershell
# Right-click setup.ps1 and select "Run with PowerShell"
# Or from PowerShell terminal:
.\setup.ps1
```

### Option 2: Command Prompt

```cmd
# Double-click setup.bat
# Or from Command Prompt:
setup.bat
```

---

## Manual Setup

If you prefer manual setup or the script fails:

### 1. Backend Setup

```cmd
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows CMD)
.venv\Scripts\activate.bat

# Activate (PowerShell)
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env with your credentials
```

### 2. Frontend Setup

```cmd
cd frontend

# Install dependencies
npm install

# Create .env file
# Edit with your Google Maps API key
```

### 3. Database Setup

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE solarroute;

-- Connect to database
\c solarroute

-- Enable PostGIS
CREATE EXTENSION postgis;
```

Then run the initialization script:

```cmd
cd backend
.venv\Scripts\activate
python init_db.py
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection for caching |
| `OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `PORT` | No | Server port (default: 8000) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key |

---

## Getting API Keys

### OpenWeatherMap API Key

1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Navigate to API Keys
4. Copy your key
5. Add to `backend/.env`:
   ```
   OPENWEATHER_API_KEY=your_key_here
   ```

### Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable APIs:
   - Maps JavaScript API
   - Geocoding API
4. Go to Credentials → Create Credentials → API Key
5. Copy your key
6. Add to `frontend/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```

---

## Running the Application

### Development Mode

**Terminal 1 (Backend):**
```cmd
cd backend
.venv\Scripts\activate
python main.py
```

**Terminal 2 (Frontend):**
```cmd
cd frontend
npm run dev
```

### Quick Launch Scripts

After running setup, use the generated scripts:

- `run-backend.bat` - Starts the API server
- `run-frontend.bat` - Starts the development server

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| API ReDoc | http://localhost:8000/redoc |

---

## Troubleshooting

### "Python not found"
- Ensure Python is installed and added to PATH
- Restart terminal after installation

### "pip install fails"
- Try: `python -m pip install --upgrade pip`
- Then: `pip install -r requirements.txt --no-cache-dir`

### "npm install fails"
- Clear cache: `npm cache clean --force`
- Delete `node_modules` folder and try again

### "Database connection failed"
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -U postgres -l`

### "PostGIS extension not found"
- Re-run PostgreSQL installer
- Select "PostGIS" from component list
- Or: `CREATE EXTENSION postgis;` as superuser

### "Redis connection failed"
- Redis is optional; the app will use in-memory fallback
- To enable caching, install and start Redis

### "Google Maps not loading"
- Verify API key in `frontend/.env`
- Check Google Cloud Console for API errors
- Ensure billing is enabled (Maps API requires it)

---

## Project Structure After Setup

```
solarroute/
├── setup.ps1              # PowerShell setup script
├── setup.bat              # Batch setup script
├── run-backend.bat        # Quick launch backend
├── run-frontend.bat       # Quick launch frontend
├── SETUP_GUIDE.md         # This file
│
├── backend/
│   ├── .venv/             # Virtual environment
│   ├── .env               # Your configuration
│   ├── .env.example       # Template
│   ├── requirements.txt   # Python dependencies
│   ├── init_db.py         # Database initializer
│   └── ...
│
└── frontend/
    ├── node_modules/      # npm dependencies
    ├── .env               # Your configuration
    └── ...
```

---

## Next Steps

1. Add your API keys to `.env` files
2. Ensure PostgreSQL + PostGIS is running
3. Run `python init_db.py` to create tables
4. Start both servers
5. Open http://localhost:5173

Happy solar calculating! ☀️
