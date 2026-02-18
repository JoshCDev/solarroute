"""
Weather Service for SolarRoute.
Fetches solar irradiance and temperature data from OpenWeatherMap API
with Redis caching for performance and cost optimization.
"""

import os
import json
import httpx
import redis.asyncio as redis
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

class WeatherService:
    """
    Handles fetching weather data from OpenWeatherMap API.
    Implements smart caching using Redis to minimize API calls.
    """
    
    # OpenWeatherMap API Configuration
    OWM_BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    # Cache Configuration
    CACHE_TTL_HOURS = 6
    GRID_PRECISION = 2
    
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._redis_client: Optional[redis.Redis] = None
        self._http_client: Optional[httpx.AsyncClient] = None
        
    async def _get_redis(self) -> Optional[redis.Redis]:
        """Lazy initialization of Redis connection."""
        if self._redis_client is None:
            try:
                self._redis_client = redis.from_url(self.redis_url, decode_responses=True)
            except Exception as e:
                print(f"Redis connection failed: {e}. Caching disabled.")
                return None
        return self._redis_client
    
    async def _get_http_client(self) -> httpx.AsyncClient:
        """Lazy initialization of HTTP client."""
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(timeout=30.0)
        return self._http_client
    
    def _get_grid_key(self, lat: float, lon: float) -> str:
        """Generate a cache key based on grid coordinates."""
        grid_lat = round(lat, self.GRID_PRECISION)
        grid_lon = round(lon, self.GRID_PRECISION)
        return f"weather:{grid_lat}:{grid_lon}"
    
    async def _get_cached_weather(self, lat: float, lon: float) -> Optional[Dict]:
        """Try to get weather data from Redis cache."""
        redis_client = await self._get_redis()
        if not redis_client:
            return None
            
        try:
            cache_key = self._get_grid_key(lat, lon)
            cached_data = await redis_client.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                cached_time = datetime.fromisoformat(data.get('cached_at', '2000-01-01'))
                if datetime.utcnow() - cached_time < timedelta(hours=self.CACHE_TTL_HOURS):
                    return {
                        "ghi_daily_kwh": data['ghi_daily_kwh'],
                        "temp_avg": data['temp_avg'],
                        "source": "cache",
                        "cached_at": cached_time
                    }
        except Exception as e:
            print(f"Cache read error: {e}")
            
        return None
    
    async def _cache_weather(self, lat: float, lon: float, data: Dict):
        """Store weather data in Redis cache."""
        redis_client = await self._get_redis()
        if not redis_client:
            return
            
        try:
            cache_key = self._get_grid_key(lat, lon)
            cache_data = {
                'ghi_daily_kwh': data['ghi_daily_kwh'],
                'temp_avg': data['temp_avg'],
                'cached_at': datetime.utcnow().isoformat()
            }
            await redis_client.setex(
                cache_key,
                timedelta(hours=self.CACHE_TTL_HOURS),
                json.dumps(cache_data)
            )
        except Exception as e:
            print(f"Cache write error: {e}")
    
    async def _fetch_from_owm(self, lat: float, lon: float) -> Dict:
        """
        Fetch weather data from OpenWeatherMap API.
        Uses the free Current Weather API.
        """
        if not self.api_key or self.api_key == "your_api_key_here":
            print("Warning: No OpenWeatherMap API key found. Using mock data.")
            return self._get_mock_weather(lat, lon)
        
        client = await self._get_http_client()
        
        try:
            # Current Weather API (Free tier)
            url = f"{self.OWM_BASE_URL}/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = await client.get(url, params=params)
            
            if response.status_code == 401:
                print("Warning: Invalid OpenWeatherMap API key. Using mock data.")
                return self._get_mock_weather(lat, lon)
            
            if response.status_code == 429:
                print("Warning: API rate limit exceeded. Using mock data.")
                return self._get_mock_weather(lat, lon)
            
            response.raise_for_status()
            data = response.json()
            
            # Extract weather data
            main = data.get('main', {})
            clouds = data.get('clouds', {}).get('all', 0)
            
            temp = main.get('temp', 28.0)
            
            # Estimate GHI based on clouds and time of day
            # Clear sky GHI in tropics: ~5-6 kWh/m2/day
            cloud_factor = 1 - (clouds / 100) * 0.7
            
            # Check if it's daytime based on sunrise/sunset
            sys = data.get('sys', {})
            sunrise = sys.get('sunrise', 0)
            sunset = sys.get('sunset', 0)
            current_time = data.get('dt', 0)
            
            is_daytime = sunrise < current_time < sunset
            
            # Estimate daily GHI
            if is_daytime:
                # Daytime - use cloud factor
                base_ghi = 5.5  # Tropical average
                ghi_daily = base_ghi * cloud_factor
            else:
                # Nighttime - estimate based on typical daily pattern
                base_ghi = 5.5
                ghi_daily = base_ghi * cloud_factor
            
            # Clamp to realistic values
            ghi_daily = max(2.0, min(ghi_daily, 7.0))
            
            return {
                "ghi_daily_kwh": round(ghi_daily, 2),
                "temp_avg": round(temp, 1),
                "source": "openweathermap",
                "clouds": clouds,
                "location": data.get('name', 'Unknown')
            }
            
        except httpx.HTTPStatusError as e:
            print(f"OWM API error: {e}. Using mock data.")
            return self._get_mock_weather(lat, lon)
        except Exception as e:
            print(f"Weather fetch error: {e}. Using mock data.")
            return self._get_mock_weather(lat, lon)
    
    def _get_mock_weather(self, lat: float, lon: float) -> Dict:
        """Provide realistic mock weather data based on location."""
        abs_lat = abs(lat)
        
        # Base GHI for equatorial regions
        if abs_lat < 5:
            base_ghi = 5.2
        elif abs_lat < 10:
            base_ghi = 4.8
        else:
            base_ghi = 4.5
        
        # Temperature based on latitude
        base_temp = 28.0 - (abs_lat * 0.3)
        
        return {
            "ghi_daily_kwh": round(base_ghi, 1),
            "temp_avg": round(base_temp, 1),
            "source": "mock",
            "note": "Using mock data - check API key or connection"
        }
    
    async def get_weather_data(self, lat: float, lon: float) -> Dict:
        """Main method to get weather data with caching."""
        # 1. Check cache
        cached = await self._get_cached_weather(lat, lon)
        if cached:
            return cached
        
        # 2. Fetch from API
        weather_data = await self._fetch_from_owm(lat, lon)
        
        # 3. Cache the result
        await self._cache_weather(lat, lon, weather_data)
        
        return weather_data
    
    async def close(self):
        """Cleanup resources."""
        if self._http_client:
            await self._http_client.aclose()
        if self._redis_client:
            await self._redis_client.close()


# Singleton instance
_weather_service: Optional[WeatherService] = None

async def get_weather_service() -> WeatherService:
    """Get or create WeatherService singleton."""
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service

async def get_weather_data(lat: float, lon: float) -> Dict:
    """Convenience function to fetch weather data."""
    service = await get_weather_service()
    return await service.get_weather_data(lat, lon)
