# Implementation Plan: SolarRoute MVP

**Status:** In Progress
**Phase:** Planning
**Architect:** Solar Architect (AI)

This plan outlines the step-by-step execution to build the SolarRoute MVP, adhering to the "Eclipse Fluidity" design system and the "Solar Engine" scientific logic.

## Phase 1: Backend Core (The Solar Engine) - Python/FastAPI
**Goal:** Implement the scientific calculation logic using `pvlib` and expose it via FastAPI.

- [ ] **1.1. Environment Setup**
    - [ ] Create `backend/` directory structure.
    - [ ] Create `backend/requirements.txt` (FastAPI, Uvicorn, pvlib, numpy, pandas, pydantic, sqlalchemy, asyncpg, redis).
    - [ ] Create `backend/.env` template.

- [ ] **1.2. The Physics Engine (`core/solar_engine.py`)**
    - [ ] Implement `SolarEngine` class.
    - [ ] Implement `calculate_dynamic_pr` (Tropical Penalty logic).
    - [ ] Implement `calculate_energy_output` using `pvlib` for GHI adjustment.
    - [ ] **Test:** Create a unit test script to verify formulas against manual calculations.

- [ ] **1.3. Database & Models**
    - [ ] Define SQLAlchemy/SQLModel models in `models/schemas.py`: `Site`, `SolarCache`, `SimulationResult`.
    - [ ] Setup Database connection (Async) in `core/database.py`.

- [ ] **1.4. API Layer**
    - [ ] Create `api/v1/endpoints/simulation.py`.
    - [ ] Implement `POST /calculate` endpoint.
    - [ ] Integrate `SolarEngine` into the endpoint.
    - [ ] Mock Redis/OpenWeatherMap for MVP (or implement real connection if API key provided, otherwise use robust fallbacks/mocks for development).

## Phase 2: Frontend Setup (The Eclipse Shell) - React/Vite
**Goal:** Initialize the "Eclipse Fluidity" design system.

- [ ] **2.1. Project Initialization**
    - [ ] Scaffold `frontend/` using Vite (React + TS).
    - [ ] Install dependencies: `tailwindcss`, `framer-motion`, `lucide-react` (or phosphor), `leaflet`, `react-leaflet`, `zustand`, `axios`.

- [ ] **2.2. Design System Implementation**
    - [ ] Configure `tailwind.config.js` with the "Eclipse" palette (Void Black, Solar Flare, Glass effects).
    - [ ] Create `index.css` with base styles (Dark mode defaults, custom fonts).
    - [ ] Create `components/ui/GlassCard.tsx` (Liquid Glass effect).
    - [ ] Create `components/ui/MagneticButton.tsx` (Hover interaction).

## Phase 3: The Map Interface (Interactive)
**Goal:** Allow users to draw polygons on a dark-mode map.

- [ ] **3.1. Map Component**
    - [ ] Create `components/map/SolarMap.tsx`.
    - [ ] Integrate Leaflet with Dark Mode tiles (CartoDB Dark Matter or Mapbox).
    - [ ] Implement Polygon Drawing Tool (using `react-leaflet-draw` or custom logic).
    - [ ] Implement "Spotlight Cursor" effect overlay.

- [ ] **3.2. Sidebar & HUD**
    - [ ] Create `components/layout/Sidebar.tsx` (Controls: Tilt, Azimuth, Bill Input).
    - [ ] Create `components/dashboard/ResultsHUD.tsx` (Floating Result Panel).

## Phase 4: Integration & "The Magic"
**Goal:** Connect Frontend to Backend and visualize results.

- [ ] **4.1. API Integration**
    - [ ] Create `services/api.ts`.
    - [ ] Connect "Hitung Potensi" button to `POST /calculate`.

- [ ] **4.2. Visualization**
    - [ ] Implement "The Scan" animation (laser scanning the polygon).
    - [ ] Implement "Count Up" animation for results.
    - [ ] Display Charts (using `recharts` or simple CSS bars for MVP).

## Phase 5: Final Polish
- [ ] **5.1. UX Refinement**
    - [ ] Ensure all "Eclipse" aesthetics are met (Glows, Noise, Fluidity).
    - [ ] Check responsiveness.
