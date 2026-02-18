import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, useMap, useMapEvents, Marker, Tooltip } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import { useSimulationStore } from '../../store/simulationStore'
import { useLanguageStore } from '../../store/languageStore'
import { LiquidCrystalButton } from '../ui/LiquidCrystalButton'
import { GlassCard } from '../ui/GlassCard'
import { MagnifyingGlass, Crosshair } from '@phosphor-icons/react'
import 'leaflet/dist/leaflet.css'

// Custom vertex icon for polygon
const vertexIcon = new DivIcon({
  className: 'polygon-vertex',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})

// Map controller component
function MapController() {
  const map = useMap()
  const { polygon } = useSimulationStore()

  useEffect(() => {
    if (polygon.length > 0) {
      const bounds = polygon.map(p => [p.lat, p.lng] as [number, number])
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 })
      }
    }
  }, [polygon.length === 0])

  return null
}

// Polygon drawing handler
function PolygonDrawer() {
  const { addPoint, isDrawing } = useSimulationStore()

  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        addPoint({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })

  return null
}

export function SolarMap() {
  const { 
    polygon, 
    isDrawing, 
    clearPolygon, 
    removeLastPoint,
    setIsDrawing,
    results
  } = useSimulationStore()
  
  const { t, language } = useLanguageStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [map, setMap] = useState<any>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Default center: Indonesia (Jakarta area)
  const defaultCenter: [number, number] = [-6.2088, 106.8456]

  // Polygon positions for Leaflet
  const polygonPositions = polygon.map(p => [p.lat, p.lng] as [number, number])

  // Get current location
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert(t('error.location'))
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (map) {
          map.flyTo([latitude, longitude], 19, { duration: 1.5 })
        }
        setIsLocating(false)
      },
      (error) => {
        console.error('Location error:', error)
        alert(t('error.location'))
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [map, t])

  // Search location
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !map) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Indonesia')}`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        map.flyTo([parseFloat(lat), parseFloat(lon)], 19, { duration: 1.5 })
      } else {
        alert(language === 'id' ? 'Lokasi tidak ditemukan' : 'Location not found')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert(language === 'id' ? 'Gagal mencari lokasi' : 'Search failed')
    }
  }, [searchQuery, map, language])

  return (
    <div className="relative w-full h-full">
      {/* Search Bar - Glassmorphism */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
        <GlassCard className="p-2" glow={false}>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('app.search')}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm px-2"
            />
            <LiquidCrystalButton onClick={handleSearch} size="sm" variant="ghost">
              <MagnifyingGlass className="w-5 h-5" />
            </LiquidCrystalButton>
            <LiquidCrystalButton 
              onClick={handleGetLocation} 
              disabled={isLocating}
              size="sm" 
              variant={isLocating ? 'primary' : 'ghost'}
            >
              <Crosshair className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
            </LiquidCrystalButton>
          </div>
        </GlassCard>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: '100%', height: '100%', background: '#050505' }}
        zoomControl={false}
        attributionControl={true}
        ref={setMap}
      >
        {/* Satellite/Hybrid Map Tiles - ESRI World Imagery */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        
        {/* Labels Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          subdomains='abcd'
          maxZoom={19}
          opacity={0.8}
        />

        <MapController />
        <PolygonDrawer />

        {/* Drawn Polygon */}
        {polygon.length > 2 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              fillColor: '#FF4D00',
              fillOpacity: 0.3,
              color: '#FF4D00',
              weight: 3,
              dashArray: results ? undefined : '5, 10',
            }}
          />
        )}

        {/* Polygon Vertices */}
        {polygon.map((point, index) => (
          <Marker
            key={index}
            position={[point.lat, point.lng]}
            icon={vertexIcon}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -10]}
              className="bg-eclipse-800 text-white border-none"
            >
              Titik {index + 1}
            </Tooltip>
          </Marker>
        ))}

        {/* Drawing Hint */}
        {isDrawing && polygon.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
            <GlassCard className="px-6 py-4">
              <p className="text-sm font-medium text-white">{t('app.drawing')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('error.need3Points')}</p>
            </GlassCard>
          </div>
        )}
      </MapContainer>

      {/* Map Controls - Bottom Center */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-2">
        {!isDrawing ? (
          <LiquidCrystalButton onClick={() => setIsDrawing(true)} variant="primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            {t('app.drawRoof')}
          </LiquidCrystalButton>
        ) : (
          <>
            <LiquidCrystalButton
              onClick={() => removeLastPoint()}
              disabled={polygon.length === 0}
              variant="secondary"
            >
              {t('app.undo')}
            </LiquidCrystalButton>
            <LiquidCrystalButton
              onClick={() => {
                setIsDrawing(false)
                if (polygon.length < 3) {
                  clearPolygon()
                }
              }}
              variant="primary"
            >
              {polygon.length >= 3 ? t('app.done') : t('app.cancel')}
            </LiquidCrystalButton>
            {polygon.length > 0 && (
              <LiquidCrystalButton
                onClick={clearPolygon}
                variant="ghost"
              >
                {t('app.clear')}
              </LiquidCrystalButton>
            )}
          </>
        )}
      </div>

      {/* Tips Bar */}
      <div className="absolute bottom-4 left-4 z-[999] hidden lg:block max-w-xs">
        <GlassCard className="p-3">
          <p className="text-xs text-gray-400">
            {polygon.length === 0 && !isDrawing && t('tip.south')}
            {isDrawing && polygon.length < 3 && t('tip.shade')}
            {polygon.length >= 3 && t('tip.tilt')}
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
