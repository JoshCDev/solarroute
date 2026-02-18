"""
SolarRoute Database Initialization Script

This script creates all required database tables with PostGIS spatial support.
Run this after setting up PostgreSQL with PostGIS extension.

Usage:
    python init_db.py
    
Requirements:
    - PostgreSQL 14+ running
    - PostGIS extension installed
    - Correct DATABASE_URL in .env file
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError
from core.database import engine, Base
from models.orm import Site, SolarCache, SimulationResult


async def check_connection() -> bool:
    """Test database connection."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except OperationalError as e:
        print(f"[ERROR] Cannot connect to database: {e}")
        print("\nMake sure PostgreSQL is running and DATABASE_URL is correct.")
        return False


async def enable_postgis() -> bool:
    """Enable PostGIS extension if not already enabled."""
    try:
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis_topology"))
        print("[OK] PostGIS extension enabled")
        return True
    except ProgrammingError as e:
        print(f"[WARNING] Could not enable PostGIS: {e}")
        print("You may need to run this as a superuser:")
        print("  psql -U postgres -d solarroute -c 'CREATE EXTENSION postgis;'")
        return False


async def create_tables() -> bool:
    """Create all database tables."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[OK] Database tables created successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to create tables: {e}")
        return False


async def verify_tables() -> bool:
    """Verify that all tables were created correctly."""
    expected_tables = ["sites", "solar_data_cache", "simulation_results"]
    
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            existing_tables = [row[0] for row in result]
            
        missing = set(expected_tables) - set(existing_tables)
        if missing:
            print(f"[WARNING] Missing tables: {missing}")
            return False
            
        print(f"[OK] All tables verified: {', '.join(expected_tables)}")
        return True
    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")
        return False


async def main():
    print("\n" + "=" * 50)
    print("  SolarRoute Database Initialization")
    print("=" * 50 + "\n")
    
    print("Step 1: Checking database connection...")
    if not await check_connection():
        sys.exit(1)
    
    print("\nStep 2: Enabling PostGIS extension...")
    await enable_postgis()
    
    print("\nStep 3: Creating database tables...")
    if not await create_tables():
        sys.exit(1)
    
    print("\nStep 4: Verifying tables...")
    if not await verify_tables():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("  Database initialization complete!")
    print("=" * 50 + "\n")
    
    print("Tables created:")
    print("  - sites           (roof polygons, area, tilt, azimuth)")
    print("  - solar_data_cache (cached weather data)")
    print("  - simulation_results (calculation results)")
    print("\nYou can now start the SolarRoute API server.")


if __name__ == "__main__":
    asyncio.run(main())
