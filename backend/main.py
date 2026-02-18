from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.endpoints import simulation
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SolarRoute API",
    description="Precision Solar Potential Calculator for Indonesia",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
    "*" # For development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(simulation.router, prefix="/api/v1/simulation", tags=["simulation"])

if __name__ == "__main__":
    import uvicorn
    import sys
    import io

    # Fix Windows encoding for emoji support
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    port = int(os.getenv("PORT", 8000))
    print(f"Starting SolarRoute API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

@app.get("/")
async def root():
    return {"message": "SolarRoute API is running. Eclipse Fluidity System Active."}
