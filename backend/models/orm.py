from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geography
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    # Storing Polygon as Geography (srid 4326 is default for Geography)
    roof_polygon = Column(Geography('POLYGON', srid=4326), nullable=False)
    area_sqm = Column(Float, nullable=False)
    tilt = Column(Float, default=20.0)
    azimuth = Column(Float, default=0.0)
    monthly_bill_idr = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    results = relationship("SimulationResult", back_populates="site", uselist=False)

class SolarCache(Base):
    __tablename__ = "solar_data_cache"

    id = Column(Integer, primary_key=True, index=True)
    # Spatial Index Grid (Point or Polygon representing the grid cell)
    grid_location = Column(Geography('POINT', srid=4326), index=True)
    raw_weather_data = Column(JSONB)
    ghi_daily_avg = Column(Float)
    temp_daily_avg = Column(Float)
    cached_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"))
    
    installed_capacity_kwp = Column(Float)
    annual_production_kwh = Column(Float)
    daily_production_kwh = Column(Float)
    system_cost_idr = Column(Float)
    annual_savings_idr = Column(Float)
    roi_years = Column(Float)
    co2_reduced_ton = Column(Float)
    
    calculated_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="results")
