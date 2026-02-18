import unittest
from core.solar_engine import SolarEngine

class TestSolarEngine(unittest.TestCase):

    def test_tropical_penalty_logic(self):
        """
        Verify the specific Tropical PR formula.
        """
        # Case 1: Standard Test Conditions (STC) -> Temp 25C, but calculate_dynamic_pr takes T_cell
        # If T_cell is 25, L_temp should be 0.
        pr_stc = SolarEngine.calculate_dynamic_pr(t_cell=25.0)
        # PR = 1 - (0 + 0.14) = 0.86
        self.assertAlmostEqual(pr_stc, 0.86, places=2)

        # Case 2: Hot Tropical Day
        # T_cell = 60C
        # L_temp = 0.004 * (60 - 25) = 0.004 * 35 = 0.14
        # PR = 1 - (0.14 + 0.14) = 0.72
        pr_hot = SolarEngine.calculate_dynamic_pr(t_cell=60.0)
        self.assertAlmostEqual(pr_hot, 0.72, places=2)

    def test_daily_simulation_bandung(self):
        """
        End-to-end test for a typical Bandung scenario.
        """
        # Inputs
        lat, lon = -6.9175, 107.6191 # Bandung
        area = 50.0
        tilt = 20.0
        azimuth = 0.0 # North facing (Good for Bandung in Southern Hemisphere? Actually near equator, N/S varies. Let's test North).
        
        ghi_daily = 5.0 # kWh/m2
        temp_avg = 30.0 # C
        
        result = SolarEngine.calculate_daily_simulation(
            latitude=lat,
            longitude=lon,
            area_sqm=area,
            tilt=tilt,
            azimuth=azimuth,
            ghi_daily_kwh=ghi_daily,
            temp_day_c=temp_avg
        )
        
        # 1. Check Capacity Calculation (Simple)
        # 50m2 * 20% = 10 kWp
        self.assertEqual(result['estimated_capacity_kwp'], 10.0)
        
        # 2. Check Cell Temp Logic
        # Approx GHI Power = 5000 Wh / 12h = 416 W/m2
        # T_cell = 30 + 0.025 * 416 = 30 + 10.4 = 40.4
        # Allowing some variance due to implementation details of averaging in 'calculate_daily_simulation' if I changed logic.
        # But currently the code uses (ghi * 1000) / 12.
        expected_t_cell = 30 + (0.025 * (5.0 * 1000 / 12))
        self.assertAlmostEqual(result['t_cell_c'], expected_t_cell, delta=0.5)
        
        # 3. Check PR
        # If T_cell ~ 40.4
        # L_temp = 0.004 * (40.4 - 25) = 0.0616
        # PR = 1 - (0.0616 + 0.14) = 0.798
        self.assertTrue(0.75 < result['pr_value'] < 0.85)
        
        # 4. Check Energy
        # E = 50 * (5 * k_trans) * 0.2 * PR
        # k_trans should be around 1.0
        # E ~ 50 * 5 * 0.2 * 0.8 = 40 kWh
        self.assertTrue(35.0 < result['daily_energy_kwh'] < 45.0)
        
        print(f"Simulation Result: {result}")

if __name__ == '__main__':
    unittest.main()
