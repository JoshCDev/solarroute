from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SimulationRequest, SimulationResponse
from core.solar_engine import SolarEngine
from core.weather_service import get_weather_data
from datetime import datetime
from shapely.geometry import Polygon
from shapely.ops import transform
import pyproj
from typing import List

router = APIRouter()

def calculate_geodesic_area(coordinates: List[List[float]]) -> float:
    """
    Calculates area in square meters from lat/lon polygon using Geodesic projection.
    """
    if len(coordinates) < 3:
        return 0.0
        
    # Create Shapely Polygon (Note: Shapely expects (x, y) = (lon, lat))
    # Input coordinates are [lat, lon] from Leaflet usually, check schema?
    # Schema says: polygon: List[List[float]] # [[lat, lng], ...]
    
    # Swap to [lon, lat] for Shapely
    poly_coords = [(p[1], p[0]) for p in coordinates]
    poly = Polygon(poly_coords)
    
    # Project to Albers Equal Area for Indonesia (or generic equivalent)
    # Using specific EPSG for Indonesia would be better, but World Mollweide or similar works for area.
    # Or simpler: Project wgs84 to local UTM. 
    # Let's use pyproj for a robust geodesic area calculation without full projection if possible,
    # or project to a local UTM zone.
    
    # Simple Auto-UTM projection
    # Estimate UTM zone
    lon_centroid = poly.centroid.x
    lat_centroid = poly.centroid.y
    utm_zone = int((lon_centroid + 180) / 6) + 1
    is_northern = lat_centroid > 0
    
    # Define projection
    # WGS84
    wgs84 = pyproj.CRS('EPSG:4326')
    # UTM (approx)
    utm_crs_code = f'EPSG:326{utm_zone}' if is_northern else f'EPSG:327{utm_zone}'
    utm = pyproj.CRS(utm_crs_code)
    
    project = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True).transform
    projected_poly = transform(project, poly)
    
    return projected_poly.area


@router.post("/calculate", response_model=SimulationResponse)
async def calculate_simulation(request: SimulationRequest):
    """
    Core Calculation Endpoint.
    Receives Polygon -> Calculates Area -> Fetches Weather -> Runs Physics Engine -> Returns Financials.
    Enhanced with monthly breakdown, panel layout, and detailed losses.
    """

    # 1. Validate Polygon
    if len(request.polygon) < 3:
        raise HTTPException(status_code=400, detail="Polygon must have at least 3 points.")

    # 2. Calculate Area (Geodesic)
    try:
        area_sqm = calculate_geodesic_area(request.polygon)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geometry Error: {str(e)}")

    # 3. Get Centroid for Weather Lookup
    lat_centroid = sum(p[0] for p in request.polygon) / len(request.polygon)
    lon_centroid = sum(p[1] for p in request.polygon) / len(request.polygon)

    # 4. Fetch Weather (Mock/Real)
    weather = await get_weather_data(lat_centroid, lon_centroid)

# 5. Run Solar Engine - Daily Simulation
    physics_result = SolarEngine.calculate_daily_simulation(
        latitude=lat_centroid,
        longitude=lon_centroid,
        area_sqm=area_sqm,
        tilt=request.tilt,
        azimuth=request.azimuth,
        ghi_daily_kwh=weather['ghi_daily_kwh'],
        temp_day_c=weather['temp_avg'],
        panel_efficiency=request.panel_efficiency
    )

    # 6. Calculate Panel Layout
    panel_layout = SolarEngine.calculate_panel_layout(
        area_sqm=area_sqm,
        panel_width_m=1.134,  # Standard 550W panel in Indonesia
        panel_height_m=2.279,
        setback_m=0.5,
        row_spacing_m=0.3,
        tilt=request.tilt,
        panel_efficiency=request.panel_efficiency
    )

    # 7. Calculate Monthly Breakdown
    monthly_breakdown = SolarEngine.calculate_monthly_simulation(
        latitude=lat_centroid,
        longitude=lon_centroid,
        area_sqm=area_sqm,
        tilt=request.tilt,
        azimuth=request.azimuth,
        base_ghi_daily_kwh=weather['ghi_daily_kwh'],
        base_temp_c=weather['temp_avg'],
        panel_efficiency=request.panel_efficiency
    )

    # 8. Calculate Detailed Losses
    detailed_losses = SolarEngine.calculate_detailed_losses(
        latitude=lat_centroid,
        tilt=request.tilt,
        azimuth=request.azimuth,
        temp_avg_c=weather['temp_avg']
    )

    # 9. Financial Calculations - Use user-provided values
    # Use monthly breakdown for accurate annual production
    annual_production = monthly_breakdown['annual_total_kwh']
    daily_production = monthly_breakdown['average_daily_kwh']
    system_size_kwp = panel_layout['estimated_system_kwp']

    estimated_cost = system_size_kwp * request.system_cost_per_kwp
    annual_savings = annual_production * request.electricity_tariff
    roi = estimated_cost / annual_savings if annual_savings > 0 else 0

    # 10. Environment
    # 0.85 kg CO2 per kWh (Coal heavy grid like Java-Bali)
    co2_offset = (annual_production * 0.85) / 1000  # Tons

    return {
        "site_details": {
            "roof_area_sqm": round(area_sqm, 2),
            "location": f"{round(lat_centroid, 4)}, {round(lon_centroid, 4)}",
            "panel_layout": panel_layout,
            "detailed_losses": detailed_losses
        },
        "energy_output": {
            "recommended_system_size_kwp": round(system_size_kwp, 2),
            "daily_production_kwh": round(daily_production, 2),
            "annual_production_kwh": round(annual_production, 2),
            "monthly_breakdown": monthly_breakdown
        },
        "financials": {
            "estimated_system_cost_idr": round(estimated_cost, -3),  # Round to nearest thousand
            "annual_savings_idr": round(annual_savings, -3),
            "break_even_point_years": round(roi, 1)
        },
        "environment": {
            "co2_offset_ton": round(co2_offset, 2)
        },
        "meta": {
            "weather_source": weather.get('source', 'OpenWeatherMap'),
            "calculation_timestamp": datetime.utcnow().isoformat()
        }
    }
