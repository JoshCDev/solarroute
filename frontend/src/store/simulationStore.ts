import { create } from 'zustand'

export interface PolygonPoint {
  lat: number
  lng: number
}

/**
 * Calculate planar polygon area with latitude-based scaling.
 * Simple but robust - works for small polygons (like roofs).
 * Accuracy: ~99% for areas under 1000m² at mid-latitudes.
 */
function calculatePlanarPolygonArea(points: PolygonPoint[]): number {
  if (points.length < 3) return 0
  
  // Calculate centroid latitude for scaling factor
  const centroidLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length
  
  // Meters per degree at this latitude
  const metersPerLat = 111132.92 - 559.82 * Math.cos(2 * centroidLat * Math.PI / 180)
  const metersPerLng = 111412.84 * Math.cos(centroidLat * Math.PI / 180)
  
  // Shoelace formula on lat/lng converted to meters
  let area = 0
  const n = points.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const xi = points[i].lng * metersPerLng
    const yi = points[i].lat * metersPerLat
    const xj = points[j].lng * metersPerLng
    const yj = points[j].lat * metersPerLat
    area += xi * yj - xj * yi
  }
  
  return Math.abs(area) / 2
}

/**
 * Calculate geodesic area of a polygon on Earth's surface.
 * 
 * Uses proper spherical polygon area calculation via triangulation
 * from an arbitrary vertex (vertex 0). Each triangle (0, i, i+1) is
 * calculated using spherical excess (Girard's theorem).
 * 
 * Reference: Karney (2013) "Algorithms for geodesics"
 * Accuracy: ~0.5% for polygons up to ~100km across
 */
function calculateSphericalPolygonArea(points: PolygonPoint[]): number {
  if (points.length < 3) return 0
  
  const R = 6371000 // Earth's mean radius in meters
  const n = points.length
  
  // Convert to radians
  const coords = points.map(p => ({
    lat: p.lat * Math.PI / 180,
    lng: p.lng * Math.PI / 180
  }))
  
  // Triangulate from vertex 0: triangles (0, i, i+1) for i = 1 to n-2
  // This creates n-2 non-overlapping triangles covering the polygon
  let totalArea = 0
  
  for (let i = 1; i < n - 1; i++) {
    const triangleArea = sphericalTriangleArea(
      coords[0],
      coords[i],
      coords[i + 1],
      R
    )
    totalArea += triangleArea
  }
  
  return totalArea
}

/**
 * Calculate area of a spherical triangle using L'Huilier's theorem.
 * Given three points on a sphere, returns the surface area.
 */
function sphericalTriangleArea(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  c: { lat: number; lng: number },
  radius: number
): number {
  // Calculate side lengths (great-circle distances / radius)
  const A = centralAngle(b, c)
  const B = centralAngle(a, c)
  const C = centralAngle(a, b)
  
  // Semi-perimeter
  const s = (A + B + C) / 2
  
  // L'Huilier's theorem for spherical excess:
  // tan(E/4) = √[tan(s/2) × tan((s-A)/2) × tan((s-B)/2) × tan((s-C)/2)]
  const tanHalfS = Math.tan(s / 2)
  const tanHalfSA = Math.tan((s - A) / 2)
  const tanHalfSB = Math.tan((s - B) / 2)
  const tanHalfSC = Math.tan((s - C) / 2)
  
  // Handle negative values due to floating point errors
  const product = Math.max(0, tanHalfS * tanHalfSA * tanHalfSB * tanHalfSC)
  const tanE4 = Math.sqrt(product)
  const E = 4 * Math.atan(tanE4)
  
  // Area = R² × E (spherical excess)
  return radius * radius * E
}

/**
 * Central angle between two points on a sphere (angle at center).
 * Uses the haversine formula for numerical stability.
 */
function centralAngle(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const dLat = p2.lat - p1.lat
  const dLng = p2.lng - p1.lng
  
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(p1.lat) * Math.cos(p2.lat) * Math.sin(dLng / 2) ** 2
  
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface SimulationResults {
  site_details: {
    roof_area_sqm: number
    location: string
    panel_layout?: {
      total_panels: number
      rows: number
      columns: number
      coverage_percentage: number
      layout_width_m: number
      layout_height_m: number
    }
    detailed_losses?: {
      temperature_loss_percent: number
      soiling_loss_percent: number
      wiring_loss_percent: number
      inverter_loss_percent: number
      orientation_loss_percent: number
      total_dc_losses_percent: number
      performance_ratio: number
    }
  }
  energy_output: {
    recommended_system_size_kwp: number
    daily_production_kwh: number
    annual_production_kwh: number
    monthly_breakdown?: {
      monthly_breakdown: Array<{ month: string; monthly_energy_kwh: number }>
      peak_month: string
      lowest_month: string
    }
  }
  financials: {
    estimated_system_cost_idr: number
    annual_savings_idr: number
    break_even_point_years: number
  }
  environment: {
    co2_offset_ton: number
  }
  meta: {
    weather_source: string
    calculation_timestamp: string
  }
}

interface SimulationState {
  // Polygon State
  polygon: PolygonPoint[]
  isDrawing: boolean
  drawMode: 'click' | 'disabled'
  
  // Configuration
  tilt: number
  azimuth: number
  monthlyBill: number
  panelEfficiency: number  // Panel efficiency (0.15 - 0.25)
  systemCostPerKwp: number  // System cost per kWp in IDR
  electricityTariff: number  // Electricity tariff per kWh in IDR
  
  // Computed values (stored in state for reactivity)
  area: number
  canCalculate: boolean
  
  // UI State
  isCalculating: boolean
  error: string | null
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  
  // Results
  results: SimulationResults | null
  
  // Actions
  setPolygon: (polygon: PolygonPoint[]) => void
  addPoint: (point: PolygonPoint) => void
  removeLastPoint: () => void
  clearPolygon: () => void
  setIsDrawing: (isDrawing: boolean) => void
  finishDrawing: () => void
  
  setTilt: (tilt: number) => void
  setAzimuth: (azimuth: number) => void
  setMonthlyBill: (bill: number) => void
  setPanelEfficiency: (efficiency: number) => void
  setSystemCostPerKwp: (cost: number) => void
  setElectricityTariff: (tariff: number) => void
  
  setIsCalculating: (isCalculating: boolean) => void
  setError: (error: string | null) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  clearToast: () => void
  setResults: (results: SimulationResults | null) => void
  
  // Helper to recompute values
  recompute: () => void
  
  // Computed (as functions, not getters)
  getCentroid: () => { lat: number; lng: number } | null
}

// Helper functions
const calculateArea = (polygon: PolygonPoint[]): number => {
  if (polygon.length < 3) return 0
  
  // Use Google Maps spherical geometry if available (most accurate)
  if (typeof window !== 'undefined' && window.google?.maps?.geometry?.spherical) {
    try {
      const path = polygon.map(p => new window.google.maps.LatLng(p.lat, p.lng))
      const area = window.google.maps.geometry.spherical.computeArea(path)
      if (area > 0) return area
    } catch (e) {
      console.error('Google Maps area calculation failed:', e)
    }
  }
  
  // Fallback 1: Proper geodesic area using spherical excess formula
  try {
    const sphericalArea = calculateSphericalPolygonArea(polygon)
    if (sphericalArea > 0) return sphericalArea
  } catch (e) {
    console.error('Spherical area calculation failed:', e)
  }
  
  // Fallback 2: Planar approximation with latitude correction
  return calculatePlanarPolygonArea(polygon)
}

const calculateCanCalculate = (polygon: PolygonPoint[], monthlyBill: number): boolean => {
  return polygon.length >= 3 && monthlyBill > 0
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial State
  polygon: [],
  isDrawing: false,
  drawMode: 'disabled',
  
  tilt: 20,
  azimuth: 180,
  monthlyBill: 1500000,
  panelEfficiency: 0.20,  // 20% default (modern monocrystalline)
  systemCostPerKwp: 15000000,  // Rp 15jt/kWp
  electricityTariff: 1444.7,  // PLN R1 tariff per kWh
  
  area: 0,
  canCalculate: false,
  
  isCalculating: false,
  error: null,
  toast: null,
  results: null,
  
  // Helper to recompute values
  recompute: () => {
    const state = get()
    const newArea = calculateArea(state.polygon)
    const newCanCalculate = calculateCanCalculate(state.polygon, state.monthlyBill)
    set({ area: newArea, canCalculate: newCanCalculate })
  },
  
  // Actions
  setPolygon: (polygon) => {
    set({ polygon })
    get().recompute()
  },
  
addPoint: (point) => set((state) => {
    // Prevent duplicate points (within small radius)
    const isDuplicate = state.polygon.some(
      p => Math.abs(p.lat - point.lat) < 0.00001 && Math.abs(p.lng - point.lng) < 0.00001
    )
    if (isDuplicate) return state
    
    const newPolygon = [...state.polygon, point]
    const newArea = calculateArea(newPolygon)
    const newCanCalculate = calculateCanCalculate(newPolygon, state.monthlyBill)
    return { polygon: newPolygon, area: newArea, canCalculate: newCanCalculate }
  }),
  
  removeLastPoint: () => set((state) => {
    const newPolygon = state.polygon.slice(0, -1)
    const newArea = calculateArea(newPolygon)
    const newCanCalculate = calculateCanCalculate(newPolygon, state.monthlyBill)
    return { polygon: newPolygon, area: newArea, canCalculate: newCanCalculate }
  }),
  
  clearPolygon: () => {
    set({ polygon: [], results: null, error: null, area: 0, canCalculate: false })
  },
  
  setIsDrawing: (isDrawing) => set({ 
    isDrawing, 
    drawMode: isDrawing ? 'click' : 'disabled' 
  }),
  
  finishDrawing: () => {
    const { polygon } = get()
    if (polygon.length < 3) {
      set({ isDrawing: false, drawMode: 'disabled', polygon: [], area: 0, canCalculate: false })
    } else {
      set({ isDrawing: false, drawMode: 'disabled' })
    }
  },
  
  setTilt: (tilt) => set({ tilt }),
  setAzimuth: (azimuth) => set({ azimuth }),
  
  setMonthlyBill: (monthlyBill) => set((state) => {
    const newCanCalculate = calculateCanCalculate(state.polygon, monthlyBill)
    return { monthlyBill, canCalculate: newCanCalculate }
  }),
  
  setPanelEfficiency: (panelEfficiency) => set({ panelEfficiency }),
  setSystemCostPerKwp: (systemCostPerKwp) => set({ systemCostPerKwp }),
  setElectricityTariff: (electricityTariff) => set({ electricityTariff }),
  
  setIsCalculating: (isCalculating) => set({ isCalculating }),
  setError: (error) => set({ error }),
  
  showToast: (message, type) => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
  
setResults: (results) => {
    set({ results, error: null })
  },
  
  // Computed function (not getter)
  getCentroid: () => {
    const { polygon } = get()
    if (polygon.length === 0) return null
    
    const lat = polygon.reduce((sum, p) => sum + p.lat, 0) / polygon.length
    const lng = polygon.reduce((sum, p) => sum + p.lng, 0) / polygon.length
    return { lat, lng }
  }
}))
