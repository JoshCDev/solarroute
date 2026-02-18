import axios from 'axios'
import type { SimulationResults } from '../store/simulationStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export interface CalculationRequest {
  polygon: [number, number][]  // [lat, lng][]
  bill_idr: number
  tilt: number
  azimuth: number
  panel_efficiency?: number
  system_cost_per_kwp?: number
  electricity_tariff?: number
}

export const simulationApi = {
  calculate: async (data: CalculationRequest): Promise<SimulationResults> => {
    const response = await api.post<SimulationResults>('/simulation/calculate', data)
    return response.data
  },
}

export default api
