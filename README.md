# SolarRoute ☀️

A precision solar potential calculator web application tailored for the Indonesian market. Built with the "Eclipse Fluidity" design system.

## Features

- 🗺️ **Interactive Map Drawing**: Draw your roof polygon directly on satellite imagery
- ⚡ **Physics-Based Calculations**: Accurate solar energy calculations using `pvlib` with tropical climate adjustments
- 🌡️ **Temperature Derating**: Accounts for Indonesia's hot climate impact on panel efficiency
- 💰 **Financial Analysis**: ROI, payback period, and savings estimation
- 🌱 **Environmental Impact**: CO₂ offset calculations
- 🎨 **Eclipse Fluidity UI**: Dark, immersive glassmorphism design

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Scientific**: pvlib, numpy, pandas
- **Database**: PostgreSQL + PostGIS
- **Caching**: Redis
- **Weather API**: OpenWeatherMap

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Maps**: Leaflet + React-Leaflet
- **State**: Zustand

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL with PostGIS extension
- Redis (optional, for caching)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd solarroute
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env with your database and API credentials
```

### 3. Database Setup

```sql
-- Create database
CREATE DATABASE solarroute;

-- Enable PostGIS
\c solarroute
CREATE EXTENSION postgis;
```

### 4. Run Backend

```bash
cd backend
.venv\Scripts\python main.py
# Or: uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/solarroute
REDIS_URL=redis://localhost:6379/0
OPENWEATHER_API_KEY=your_api_key_here
```

Get your OpenWeatherMap API key at: https://openweathermap.org/api

## API Endpoints

### POST /api/v1/simulation/calculate

Calculate solar potential for a given roof polygon.

**Request:**
```json
{
  "polygon": [[-6.9175, 107.6191], [-6.9176, 107.6192], [-6.9178, 107.6190]],
  "bill_idr": 1500000,
  "tilt": 20,
  "azimuth": 180
}
```

**Response:**
```json
{
  "site_details": {
    "roof_area_sqm": 45.5,
    "location": "-6.9176, 107.6191"
  },
  "energy_output": {
    "recommended_system_size_kwp": 3.2,
    "daily_production_kwh": 12.6,
    "annual_production_kwh": 4600.50
  },
  "financials": {
    "estimated_system_cost_idr": 48000000,
    "annual_savings_idr": 6645000,
    "break_even_point_years": 7.2
  },
  "environment": {
    "co2_offset_ton": 3.8
  },
  "meta": {
    "weather_source": "openweathermap",
    "calculation_timestamp": "2026-02-09T20:30:00"
  }
}
```

## Scientific Model

### Energy Formula
```
E_day (kWh) = A × GHI_adj × η_panel × PR
```

Where:
- **A**: Geodesic roof area (m²)
- **GHI_adj**: Adjusted Global Horizontal Irradiance (kWh/m²/day)
- **η_panel**: Panel efficiency (20% for monocrystalline)
- **PR**: Performance Ratio (dynamic based on temperature)

### Tropical Performance Ratio
```
PR = 1 - (L_temp + L_sys)

L_temp = γ × (T_cell - 25)
T_cell = T_air + (0.025 × GHI)
```

- **γ**: Temperature coefficient (0.004 /°C)
- **L_sys**: System losses (14%)

## Design System: Eclipse Fluidity

### Color Palette
- **Background**: `#050505` (Void Black)
- **Primary**: `#FF4D00` (Solar Flare)
- **Secondary**: `#D91E18` (Magma Red)
- **Success**: `#00FF94` (Profit Green)
- **Glass**: `rgba(255, 255, 255, 0.03)`

### Typography
- **Headings**: Space Grotesk
- **Body**: Inter
- **Data/Numbers**: JetBrains Mono

## Testing

```bash
# Backend tests
cd backend
.venv\Scripts\python -m unittest tests.test_solar_engine -v

# Frontend tests (when added)
cd frontend
npm test
```

## Project Structure

```
solarroute/
├── backend/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── simulation.py
│   ├── core/
│   │   ├── solar_engine.py
│   │   ├── weather_service.py
│   │   └── database.py
│   ├── models/
│   │   ├── schemas.py
│   │   └── orm.py
│   ├── tests/
│   │   └── test_solar_engine.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── map/
│   │   │   ├── layout/
│   │   │   └── dashboard/
│   │   ├── store/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## License

MIT License - See LICENSE for details.

---

Built with precision physics and Eclipse Fluidity design.
