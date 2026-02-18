from pydantic import BaseModel, Field, UUID4
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime

class RoofPolygonInput(BaseModel):
    # List of [lat, lng]
    coordinates: List[Tuple[float, float]]

class SimulationRequest(BaseModel):
    polygon: List[List[float]] # [[lat, lng], [lat, lng], ...]
    bill_idr: float = Field(..., gt=0, description="Monthly electricity bill in IDR")
    tilt: float = Field(20.0, description="Roof tilt in degrees")
    azimuth: float = Field(180.0, description="Roof azimuth (0=North, 180=South)")
    panel_efficiency: float = Field(0.20, ge=0.15, le=0.25, description="Panel efficiency (0.15-0.25)")
    system_cost_per_kwp: float = Field(15_000_000, ge=10_000_000, le=25_000_000, description="System cost per kWp in IDR")
    electricity_tariff: float = Field(1444.7, ge=1000, le=5000, description="Electricity tariff per kWh in IDR")

class MonthlyProduction(BaseModel):
    month: str
    days: int
    ghi_daily_kwh: float
    temp_avg_c: float
    pr_value: float
    daily_energy_kwh: float
    monthly_energy_kwh: float

class MonthlyBreakdown(BaseModel):
    monthly_breakdown: List[MonthlyProduction]
    annual_total_kwh: float
    average_daily_kwh: float
    peak_month: str
    lowest_month: str
    seasonal_variation: float

class PanelLayout(BaseModel):
    total_panels: int
    rows: int
    columns: int
    usable_area_sqm: float
    total_panel_area_sqm: float
    coverage_percentage: float
    effective_coverage_percentage: float
    layout_width_m: float
    layout_height_m: float
    panel_dimensions: Dict[str, float]
    estimated_system_kwp: float
    setback_distance_m: float
    row_spacing_m: float

class DetailedLosses(BaseModel):
    temperature_loss_percent: float
    soiling_loss_percent: float
    mismatch_loss_percent: float
    wiring_loss_percent: float
    inverter_loss_percent: float
    orientation_loss_percent: float
    total_dc_losses_percent: float
    dc_efficiency_percent: float
    ac_efficiency_percent: float
    performance_ratio: float

class EnergyOutput(BaseModel):
    recommended_system_size_kwp: float
    daily_production_kwh: float
    annual_production_kwh: float
    monthly_breakdown: Optional[MonthlyBreakdown] = None

class SiteDetails(BaseModel):
    roof_area_sqm: float
    location: str
    panel_layout: Optional[PanelLayout] = None
    detailed_losses: Optional[DetailedLosses] = None

class FinancialOutput(BaseModel):
    estimated_system_cost_idr: float
    annual_savings_idr: float
    break_even_point_years: float

class EnvironmentOutput(BaseModel):
    co2_offset_ton: float

class MetaInfo(BaseModel):
    weather_source: str
    calculation_timestamp: datetime

class SimulationResponse(BaseModel):
    site_details: SiteDetails
    energy_output: EnergyOutput
    financials: FinancialOutput
    environment: EnvironmentOutput
    meta: MetaInfo
