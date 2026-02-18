import pandas as pd
import numpy as np
import pvlib
from datetime import datetime
from typing import Dict, Optional, List, Tuple

class SolarEngine:
    """
    The Scientific Core of SolarRoute.
    Handles thermodynamic and electrical physics calculations for PV systems
    in tropical climates.
    """

    # Constants from PRD
    PANEL_EFFICIENCY = 0.20  # 20%
    SYSTEM_LOSS = 0.14       # 14% (L_sys)
    TEMP_COEFF = 0.004       # 0.4% per degree C (gamma)

    # Standard panel specifications (Indonesian market)
    PANEL_WATTAGE = 550      # Standard panel in Indonesia
    PANEL_WIDTH_M = 1.134    # Width in meters
    PANEL_HEIGHT_M = 2.279   # Height in meters
    PANEL_AREA_M2 = PANEL_WIDTH_M * PANEL_HEIGHT_M  # 2.583 m²

    # Installation parameters
    SETBACK_M = 0.5          # Edge setback (meters)
    ROW_SPACING_M = 0.3      # Space between rows (meters)
    COLUMN_SPACING_M = 0.05  # Space between columns (meters)

    # Loss breakdown coefficients
    LOSS_SOILING = 0.02      # 2% soiling
    LOSS_CABLING = 0.01      # 1% cabling
    LOSS_INVERTER = 0.03     # 3% inverter efficiency
    LOSS_MISMATCH = 0.02     # 2% mismatch
    LOSS_NAMEPLATE = 0.01    # 1% nameplate
    SYSTEM_LOSS_DETAILED = (
        LOSS_SOILING + LOSS_CABLING + LOSS_INVERTER +
        LOSS_MISMATCH + LOSS_NAMEPLATE
    )
    
    @staticmethod
    def calculate_cell_temperature(t_air: float, ghi: float) -> float:
        """
        Estimates cell temperature based on air temp and GHI.
        Formula: T_cell = T_air + (0.025 * GHI)
        """
        return t_air + (0.025 * ghi)

    @classmethod
    def calculate_dynamic_pr(cls, t_cell: float) -> float:
        """
        Calculates Performance Ratio (PR) with Tropical Penalty.
        Formula: PR = 1 - (L_temp + L_sys)
        L_temp = gamma * (T_cell - 25)
        """
        # Calculate Temperature Loss (L_temp)
        # Note: If T_cell < 25, gain is possible in theory, but usually we cap or allow it.
        # Physics implies better efficiency at lower temps.
        l_temp = cls.TEMP_COEFF * (t_cell - 25.0)
        
        # PR Formula
        pr = 1.0 - (l_temp + cls.SYSTEM_LOSS)
        return pr

    @classmethod
    def calculate_energy_output(
        cls, 
        area_sqm: float, 
        tilt: float, 
        azimuth: float, 
        weather_data: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Calculates daily energy output (E_day).
        
        Formula: E_day = A * GHI_adj * eta_panel * PR
        
        Args:
            area_sqm: Roof area in square meters.
            tilt: Roof tilt in degrees.
            azimuth: Roof azimuth in degrees (0=North, 180=South).
            weather_data: Dictionary containing 'ghi' (kWh/m2/day) and 'temp_avg' (Celsius).
                          Note: If GHI is instantaneous (W/m2), it needs integration. 
                          For MVP/PRD simple formula, we assume input is daily insolation (kWh/m2/day) 
                          OR we perform adjustment on instantaneous and integrate.
                          
                          The PRD says: "Fetch GHI... Apply Transposition Model...".
                          To do Transposition (POA), we need DHI and DNI usually, or estimate them from GHI.
                          
                          For this implementation, we will use pvlib's 'disc' model to estimate DNI 
                          if not provided, then 'haydavies' for POA.
                          
                          HOWEVER, the PRD simplified Formula 3.1 implies a factor adjustment on GHI.
                          For robust scientific accuracy (as requested), we will calculate 
                          Global Tilted Irradiance (GTI) aka Plane of Array (POA) Global.
        """
        
        ghi_daily_kwh = weather_data.get('ghi_daily_kwh', 0.0) # Daily Insolation
        temp_avg = weather_data.get('temp_avg', 30.0)
        
        # 1. Adjust GHI for Tilt/Azimuth (Simplified Transposition Factor for MVP Daily)
        # In a full time-series, we would iterate hourly. 
        # Here we approximate: GHI_adj = GHI * TranspositionFactor.
        # A simple approximation for tropical latitudes (low tilt) is roughly 1.0 to 1.1 
        # depending on orientation. 
        # BUT, the architect role demands 'pvlib'.
        # Let's assume we are running a single 'representative' moment or aggregating.
        # Ideally, we should simulate a full day. 
        
        # Let's generate a clear sky curve for the location to estimate the transposition factor
        # OR use a simplified geometric factor if latitude is known.
        
        # Since we don't have lat/lon/date in this method signature yet (only area/tilt/azimuth),
        # we strictly follow the PRD formula structure: E_day = ... GHI_adj ...
        
        # Let's Refine: We need Lat/Lon to use pvlib properly for Transposition.
        # I will update the signature to accept location.
        raise NotImplementedError("Use calculate_energy_simulation for full logic")

    @classmethod
    def calculate_daily_simulation(
        cls,
        latitude: float,
        longitude: float,
        area_sqm: float,
        tilt: float,
        azimuth: float,
        ghi_daily_kwh: float, # Input from OWM Daily API usually in kWh/m2 or J/m2
        temp_day_c: float,
        panel_efficiency: float = 0.20  # Default 20%, can be overridden
    ) -> Dict[str, float]:
        """
        Performs a daily simulation.

        Since we might only have daily aggregates from OWM Free API (or limited OneCall),
        we will use pvlib to get a transposition factor based on geometry.

        However, to be "Scientific", we should generate a clearsky profile for the day,
        scale it to match the observed GHI, and then transpose that.
        """

        # 1. Get POA (Plane of Array) Irradiance Factor
        # For Indonesia (near equator), optimal tilt is low.
        # We will use pvlib.irradiance.get_total_irradiance if we had components.
        # With only GHI, we estimate.

        # Create a Location object
        site_location = pvlib.location.Location(latitude, longitude)

        # Get clear sky data for today to calculate the geometric factor
        times = pd.date_range(start=datetime.now().date(), periods=24, freq='h', tz='Asia/Jakarta')
        solpos = site_location.get_solarposition(times)

        # Calculate extraterrestrial radiation
        dni_extra = pvlib.irradiance.get_extra_radiation(times)

        # Simple Clear Sky Model (Ineichen)
        clearsky = site_location.get_clearsky(times)

        # Calculate POA for Clear Sky
        # We need surface_tilt and surface_azimuth
        poa_sky = pvlib.irradiance.get_total_irradiance(
            surface_tilt=tilt,
            surface_azimuth=azimuth,
            dni=clearsky['dni'],
            ghi=clearsky['ghi'],
            dhi=clearsky['dhi'],
            solar_zenith=solpos['apparent_zenith'],
            solar_azimuth=solpos['azimuth']
        )

        # Calculate Transposition Factor (k_trans) = POA_global / GHI
        # Sum of daily irradiance
        daily_ghi_clearsky = clearsky['ghi'].sum()
        daily_poa_clearsky = poa_sky['poa_global'].sum()

        if daily_ghi_clearsky > 0:
            k_trans = daily_poa_clearsky / daily_ghi_clearsky
        else:
            k_trans = 1.0 # Fallback

        # 2. Calculate GHI_adj (GTI - Global Tilted Irradiance)
        # Scale the observed daily GHI by the calculated transposition factor
        ghi_adj = ghi_daily_kwh * k_trans

        # 3. Calculate Cell Temperature & PR
        # We assume the average temp provided contributes to the average cell temp
        # Since we are doing a daily aggregate, we use the daily GHI average (power) for the thermal model?
        # The formula T_cell = T_air + (0.025 * GHI) uses GHI in W/m2 usually.
        # ghi_daily_kwh is Energy (kWh). Power (kW) ~ Energy / 24h ?? No, Sun is up ~12h.
        # Avg GHI (W/m2) over daylight hours approx = (kWh/m2 * 1000) / 12 hours.

        avg_ghi_w_m2 = (ghi_daily_kwh * 1000) / 12
        t_cell = cls.calculate_cell_temperature(temp_day_c, avg_ghi_w_m2)

        pr = cls.calculate_dynamic_pr(t_cell)

# 4. Calculate Energy
        # E_day = A * GHI_adj * eta * PR
        e_day_kwh = area_sqm * ghi_adj * panel_efficiency * pr

        return {
            "ghi_adj_kwh_m2": round(ghi_adj, 2),
            "transposition_factor": round(k_trans, 3),
            "pr_value": round(pr, 3),
            "t_cell_c": round(t_cell, 1),
            "daily_energy_kwh": round(e_day_kwh, 2),
            "estimated_capacity_kwp": round(area_sqm * panel_efficiency, 2) # A * eta
        }

    @classmethod
    def calculate_monthly_simulation(
        cls,
        latitude: float,
        longitude: float,
        area_sqm: float,
        tilt: float,
        azimuth: float,
        base_ghi_daily_kwh: float,
        base_temp_c: float,
        panel_efficiency: float = 0.20  # Default 20%, can be overridden
    ) -> Dict[str, any]:
        """
        Calculates monthly and annual energy production with seasonal variation.

        For Indonesia, we model:
        - Wet season (Nov-Apr): ~15-20% lower irradiance due to cloud cover
        - Dry season (May-Oct): ~10-15% higher irradiance

        Returns detailed monthly breakdown and annual totals.
        """
        site_location = pvlib.location.Location(latitude, longitude)

        # Monthly adjustment factors for Indonesia (based on climatology)
        # Values represent ratio of monthly average to annual average
        monthly_factors = {
            1: 0.95,   # January - Wet season
            2: 0.92,   # February - Peak wet
            3: 0.93,   # March - Wet season
            4: 0.96,   # April - Transition
            5: 1.05,   # May - Dry season starts
            6: 1.10,   # June - Dry season
            7: 1.12,   # July - Peak dry
            8: 1.10,   # August - Dry season
            9: 1.05,   # September - Transition
            10: 1.02,  # October - Transition
            11: 0.98,  # November - Wet season starts
            12: 0.96   # December - Wet season
        }

        # Monthly temperature variations (offset from base temp)
        monthly_temp_offset = {
            1: -1.5,   # January
            2: -1.0,   # February
            3: -0.5,   # March
            4: 0.0,    # April
            5: 0.5,    # May
            6: 1.0,    # June
            7: 1.5,    # July
            8: 1.0,    # August
            9: 0.5,    # September
            10: 0.0,   # October
            11: -0.5,  # November
            12: -1.0   # December
        }

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        monthly_production = []
        annual_total = 0

        for month in range(1, 13):
            # Get days in month
            if month in [1, 3, 5, 7, 8, 10, 12]:
                days = 31
            elif month in [4, 6, 9, 11]:
                days = 30
            else:
                days = 28  # Simplified for February

            # Adjusted GHI for this month
            monthly_ghi = base_ghi_daily_kwh * monthly_factors[month]

            # Adjusted temperature for this month
            monthly_temp = base_temp_c + monthly_temp_offset[month]

            # Calculate transposition factor for this month
            # Use the 15th of each month as representative
            year = datetime.now().year
            month_times = pd.date_range(
                start=datetime(year, month, 15),
                periods=24,
                freq='h',
                tz='Asia/Jakarta'
            )
            solpos = site_location.get_solarposition(month_times)
            clearsky = site_location.get_clearsky(month_times)
            poa_sky = pvlib.irradiance.get_total_irradiance(
                surface_tilt=tilt,
                surface_azimuth=azimuth,
                dni=clearsky['dni'],
                ghi=clearsky['ghi'],
                dhi=clearsky['dhi'],
                solar_zenith=solpos['apparent_zenith'],
                solar_azimuth=solpos['azimuth']
            )

            daily_ghi_clearsky = clearsky['ghi'].sum()
            daily_poa_clearsky = poa_sky['poa_global'].sum()
            k_trans = daily_poa_clearsky / daily_ghi_clearsky if daily_ghi_clearsky > 0 else 1.0

            # Calculate POA irradiance
            ghi_adj = monthly_ghi * k_trans

            # Calculate cell temperature and PR
            avg_ghi_w_m2 = (monthly_ghi * 1000) / 12
            t_cell = cls.calculate_cell_temperature(monthly_temp, avg_ghi_w_m2)
            pr = cls.calculate_dynamic_pr(t_cell)

# Daily energy for this month
            daily_energy = area_sqm * ghi_adj * panel_efficiency * pr
            monthly_energy = daily_energy * days

            monthly_production.append({
                'month': month_names[month - 1],
                'days': days,
                'ghi_daily_kwh': round(monthly_ghi, 2),
                'temp_avg_c': round(monthly_temp, 1),
                'pr_value': round(pr, 3),
                'daily_energy_kwh': round(daily_energy, 2),
                'monthly_energy_kwh': round(monthly_energy, 0)
            })

            annual_total += monthly_energy

        return {
            'monthly_breakdown': monthly_production,
            'annual_total_kwh': round(annual_total, 0),
            'average_daily_kwh': round(annual_total / 365, 2),
            'peak_month': max(monthly_production, key=lambda x: x['monthly_energy_kwh'])['month'],
            'lowest_month': min(monthly_production, key=lambda x: x['monthly_energy_kwh'])['month'],
            'seasonal_variation': round(
                (max(monthly_production, key=lambda x: x['monthly_energy_kwh'])['monthly_energy_kwh'] -
                 min(monthly_production, key=lambda x: x['monthly_energy_kwh'])['monthly_energy_kwh']) /
                (annual_total / 12) * 100, 1
            )
        }

    @classmethod
    def calculate_panel_layout(
        cls,
        area_sqm: float,
        panel_width_m: float = 1.75,  # Standard 450W panel
        panel_height_m: float = 1.04,
        setback_m: float = 0.5,       # Edge setback
        row_spacing_m: float = 0.2,   # Spacing between rows
        tilt: float = 20.0,
        panel_efficiency: float = 0.20
    ) -> Dict[str, any]:
        """
        Calculates optimal panel layout and counts for a given roof area.

        Accounts for:
        - Setback distance from edges
        - Row spacing for maintenance
        - Panel dimensions
        - Tilt angle (affects effective coverage)

        Returns panel count, layout dimensions, and coverage percentage.
        """
        # Calculate usable area after setbacks
        # Assuming rectangular roof for simplicity
        usable_width = np.sqrt(area_sqm) - (2 * setback_m)
        usable_length = np.sqrt(area_sqm) - (2 * setback_m)

        if usable_width <= 0 or usable_length <= 0:
            return {
                'total_panels': 0,
                'rows': 0,
                'columns': 0,
                'usable_area_sqm': 0,
                'coverage_percentage': 0,
                'total_panel_area_sqm': 0
            }

        # Calculate how many panels fit in each dimension
        panels_per_row = int(usable_width // panel_width_m)
        panels_per_column = int(usable_length // (panel_height_m + row_spacing_m))

        # Also try swapping dimensions (panels rotated)
        panels_per_row_alt = int(usable_width // panel_height_m)
        panels_per_column_alt = int(usable_length // (panel_width_m + row_spacing_m))

        # Use the orientation that fits more panels
        if panels_per_row * panels_per_column >= panels_per_row_alt * panels_per_column_alt:
            columns = panels_per_row
            rows = panels_per_column
            layout_width = columns * panel_width_m
            layout_height = rows * panel_height_m + (rows - 1) * row_spacing_m
        else:
            columns = panels_per_row_alt
            rows = panels_per_column_alt
            layout_width = columns * panel_height_m
            layout_height = rows * panel_width_m + (rows - 1) * row_spacing_m

        total_panels = columns * rows

        # Calculate areas
        usable_area = usable_width * usable_length
        total_panel_area = total_panels * panel_width_m * panel_height_m
        coverage_percentage = (total_panel_area / usable_area * 100) if usable_area > 0 else 0

        # Calculate effective coverage considering tilt
        # Tilted panels cover more ground area than their actual area
        tilt_factor = np.cos(np.radians(tilt))
        effective_coverage = coverage_percentage * tilt_factor

        return {
            'total_panels': total_panels,
            'rows': rows,
            'columns': columns,
            'usable_area_sqm': round(usable_area, 2),
            'total_panel_area_sqm': round(total_panel_area, 2),
            'coverage_percentage': round(coverage_percentage, 1),
            'effective_coverage_percentage': round(effective_coverage, 1),
            'layout_width_m': round(layout_width, 2),
            'layout_height_m': round(layout_height, 2),
            'panel_dimensions': {
                'width_m': panel_width_m,
                'height_m': panel_height_m,
                'area_sqm': round(panel_width_m * panel_height_m, 2)
            },
            'estimated_system_kwp': round(total_panels * 0.45, 2),  # Assuming 450W panels
            'setback_distance_m': setback_m,
            'row_spacing_m': row_spacing_m
        }

    @classmethod
    def calculate_detailed_losses(
        cls,
        latitude: float,
        tilt: float,
        azimuth: float,
        temp_avg_c: float
    ) -> Dict[str, float]:
        """
        Calculates detailed system losses by component.

        Includes:
        - Temperature losses (varies with climate)
        - Soiling losses
        - Mismatch losses
        - Wiring losses
        - Inverter efficiency
        - Orientation losses (for suboptimal tilt/azimuth)
        """
        # 1. Temperature losses
        # Higher temperatures in tropical regions increase losses
        temp_loss = cls.TEMP_COEFF * max(0, temp_avg_c - 25)  # Only positive losses

        # 2. Soiling losses (higher in Indonesia due to humidity/dust)
        soiling_loss = 0.02  # 2%

        # 3. Mismatch losses
        mismatch_loss = 0.02  # 2%

        # 4. Wiring (DC) losses
        wiring_loss = 0.015  # 1.5%

        # 5. Inverter efficiency loss
        inverter_efficiency = 0.97  # 97% efficiency
        inverter_loss = 1 - inverter_efficiency  # 3%

        # 6. Orientation losses (deviation from optimal)
        # Optimal for Indonesia (near equator): tilt ~latitude, azimuth ~0 (North)
        # Calculate optimal tilt based on latitude
        optimal_tilt = abs(latitude)  # Simplified
        optimal_azimuth = 0  # North-facing

        # Tilt penalty
        tilt_diff = abs(tilt - optimal_tilt)
        tilt_loss = tilt_diff * 0.0015  # ~0.15% loss per degree deviation

        # Azimuth penalty (East/West deviations)
        azimuth_diff = min(abs(azimuth - optimal_azimuth), abs(azimuth - 180))
        azimuth_loss = azimuth_diff * 0.0005  # ~0.05% loss per degree deviation

        orientation_loss = min(tilt_loss + azimuth_loss, 0.15)  # Cap at 15%

        # Calculate total DC losses
        total_dc_losses = temp_loss + soiling_loss + mismatch_loss + wiring_loss + orientation_loss

        # Calculate total system efficiency
        dc_efficiency = (1 - total_dc_losses)
        ac_efficiency = dc_efficiency * inverter_efficiency

        return {
            'temperature_loss_percent': round(temp_loss * 100, 2),
            'soiling_loss_percent': round(soiling_loss * 100, 2),
            'mismatch_loss_percent': round(mismatch_loss * 100, 2),
            'wiring_loss_percent': round(wiring_loss * 100, 2),
            'inverter_loss_percent': round(inverter_loss * 100, 2),
            'orientation_loss_percent': round(orientation_loss * 100, 2),
            'total_dc_losses_percent': round(total_dc_losses * 100, 2),
            'dc_efficiency_percent': round(dc_efficiency * 100, 2),
            'ac_efficiency_percent': round(ac_efficiency * 100, 2),
            'performance_ratio': round(ac_efficiency * 0.95, 3)  # Include availability factor
        }
