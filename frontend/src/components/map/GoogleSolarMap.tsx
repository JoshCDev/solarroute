import { useEffect, useRef, useState, useCallback } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { useLanguageStore } from '../../store/languageStore'
import { useGoogleMaps } from '../../hooks/useGoogleMaps'
import { MagnifyingGlass, Crosshair, Check, Trash, ArrowUUpLeft, MapPin } from '@phosphor-icons/react'

function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay]) as T
}

export function GoogleSolarMap() {
  const { 
    polygon, 
    isDrawing, 
    setIsDrawing,
    addPoint,
    removeLastPoint,
    clearPolygon,
    showToast,
    canCalculate
  } = useSimulationStore()
  
const { language, t } = useLanguageStore()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const drawingPolygonRef = useRef<google.maps.Polygon | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const isDrawingRef = useRef(isDrawing)
  const [isLocating, setIsLocating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasDrawnOnce, setHasDrawnOnce] = useState(false)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const { isLoaded, error: mapError } = useGoogleMaps(apiKey)

  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

  const debouncedAddPoint = useDebounce(addPoint, 100)

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const defaultCenter = { lat: -6.2088, lng: 106.8456 }

const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 18,
      mapTypeId: 'roadmap',
      tilt: 0,
      draggable: true,
      scrollwheel: true,
      disableDoubleClickZoom: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
      streetViewControl: false,
      fullscreenControl: false,
    })

    mapInstanceRef.current = map

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (isDrawingRef.current && e.latLng) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        debouncedAddPoint({ lat, lng })
      }
    })
    clickListenerRef.current = listener

    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current)
      }
    }
  }, [isLoaded, debouncedAddPoint])

// Update polygon visualization with delta updates
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !window.google?.maps) return

    const currentMarkers = markersRef.current
    const currentPolygon = drawingPolygonRef.current

    // Determine what changed
    const prevLength = currentMarkers.length
    const newLength = polygon.length

    // Clear old polygon
    if (currentPolygon) {
      currentPolygon.setMap(null)
      drawingPolygonRef.current = null
    }

    // Remove excess markers
    if (newLength < prevLength) {
      for (let i = newLength; i < prevLength; i++) {
        currentMarkers[i].setMap(null)
      }
      currentMarkers.length = newLength
    }

    // Add/update markers
    polygon.forEach((point, index) => {
      if (index < prevLength) {
        // Update existing marker position
        if (currentMarkers[index]) {
          currentMarkers[index].setPosition({ lat: point.lat, lng: point.lng })
        }
      } else {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#FF4D00',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          label: {
            text: String(index + 1),
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          title: `Point ${index + 1}`
        })
        currentMarkers.push(marker)
      }
    })

    // Draw polygon if we have 3+ points
    if (polygon.length >= 3) {
      const path = polygon.map(p => ({ lat: p.lat, lng: p.lng }))

      drawingPolygonRef.current = new window.google.maps.Polygon({
        paths: path,
        strokeColor: '#FF4D00',
        strokeOpacity: 1,
        strokeWeight: 4,
        fillColor: '#FF4D00',
        fillOpacity: 0.35,
        editable: false,
        map
      })
    }
  }, [polygon])

const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast(t('error.noGeolocation'), 'error')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const map = mapInstanceRef.current
        if (map) {
          map.setCenter({ lat: latitude, lng: longitude })
          map.setZoom(20)
        }
        setIsLocating(false)
        showToast(t('error.locationFound'), 'success')
      },
      () => {
        showToast(t('error.failedLocation'), 'error')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [t, showToast])

const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !window.google?.maps) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode(
      { address: searchQuery + ', Indonesia' },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          const map = mapInstanceRef.current
          if (map) {
            map.setCenter(location)
            map.setZoom(20)
          }
        } else {
          showToast(t('error.locationNotFound'), 'error')
        }
      }
    )
  }, [searchQuery, t, showToast])

const handleStartDrawing = () => {
    setIsDrawing(true)
    setHasDrawnOnce(true)
    showToast(t('error.drawModeActive'), 'info')
  }

  const handleFinishDrawing = () => {
    if (polygon.length < 3) {
      showToast(t('error.need3Points'), 'error')
    } else {
      const count = polygon.length
      showToast(t('error.areaComplete').replace('{count}', String(count)), 'success')
      setIsDrawing(false)
    }
  }

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">⚠️ {mapError}</p>
          <p className="text-gray-400 text-sm">
            {language === 'id' 
              ? 'Tambahkan VITE_GOOGLE_MAPS_API_KEY ke frontend/.env'
              : 'Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-[#0a0a0a]">
      {/* Drawing Mode Indicator */}
      {isDrawing && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <div className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FF4D00] text-white font-bold rounded-xl shadow-2xl animate-pulse whitespace-nowrap text-sm sm:text-base">
            {t('map.drawingMode')}
          </div>
          <p className="text-center text-white/80 text-xs sm:text-sm mt-2 bg-black/50 px-3 py-1 rounded-full">
            {t('map.clickRoofCorners')}
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
        <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-[#333] rounded-2xl p-2 shadow-2xl">
          <div className="flex gap-2">
            <label htmlFor="search-input" className="sr-only">
              {t('map.searchPlaceholder')}
            </label>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('map.searchPlaceholder')}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm px-3 py-2.5"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#FF4D00] hover:bg-[#FF8800] text-white rounded-xl transition-colors"
              aria-label={t('map.search')}
            >
              <MagnifyingGlass className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#444] rounded-xl transition-colors disabled:opacity-50"
              aria-label={t('map.useMyLocation')}
            >
              <Crosshair className={`w-5 h-5 ${isLocating ? 'animate-pulse text-[#FF4D00]' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ background: '#0a0a0a' }}
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">
              {language === 'id' ? 'Memuat Google Maps...' : 'Loading Google Maps...'}
            </p>
          </div>
        </div>
      )}

{/* Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]">
        {!isDrawing ? (
          <div className="flex gap-3">
            <button
              onClick={handleStartDrawing}
              className="px-6 py-3 bg-gradient-to-r from-[#FF4D00] to-[#D91E18] text-white font-bold rounded-xl shadow-lg hover:shadow-[#FF4D00]/30 hover:scale-105 transition-all flex items-center gap-2"
              aria-label={t('map.startDrawing')}
            >
              <MapPin className="w-5 h-5" aria-hidden="true" />
              {hasDrawnOnce ? t('sidebar.addArea') : t('sidebar.drawArea')}
            </button>

            {polygon.length > 0 && (
              <button
                onClick={clearPolygon}
                className="px-4 py-3 bg-[#1a1a1a] text-white border border-[#444] rounded-xl hover:bg-[#2a2a2a] transition-colors"
                aria-label={t('map.clearArea')}
              >
                <Trash className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-3 bg-[#0f0f0f]/95 backdrop-blur-xl p-3 rounded-2xl border border-[#333] shadow-2xl">
            <button
              onClick={() => removeLastPoint()}
              disabled={polygon.length === 0}
              className="px-4 py-2.5 bg-[#1a1a1a] text-white border border-[#444] rounded-xl hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              aria-label={t('map.undoPoint')}
            >
              <ArrowUUpLeft className="w-4 h-4" aria-hidden="true" />
              Undo
            </button>

            <div className="flex items-center px-4 bg-[#1a1a1a] rounded-xl border border-[#333]" aria-live="polite">
              <span className="text-[#FF4D00] font-mono font-bold text-xl">
                {polygon.length}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                {t('map.pts')}
              </span>
            </div>

            <button
              onClick={handleFinishDrawing}
              disabled={polygon.length < 3}
              className="px-6 py-2.5 bg-gradient-to-r from-[#00FF94] to-[#00cc77] text-black font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2"
              aria-label={t('map.finishDrawing')}
            >
              <Check className="w-5 h-5" aria-hidden="true" />
              {t('map.done')}
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="absolute bottom-6 left-6 z-[999]">
        <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
          canCalculate
            ? 'bg-[#00FF94]/20 text-[#00FF94] border-[#00FF94]/50'
            : polygon.length > 0
              ? 'bg-[#FF4D00]/20 text-[#FF4D00] border-[#FF4D00]/50'
              : 'bg-[#1a1a1a] text-gray-400 border-[#333]'
        }`}>
          {canCalculate
            ? t('map.calculateReady')
            : polygon.length > 0
              ? t('map.hasPoints').replace('{count}', String(polygon.length))
              : t('map.noArea')
          }
        </div>
      </div>

      {/* Tips */}
      <div className="absolute top-20 right-4 z-[999] max-w-xs">
        <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-[#333] rounded-xl p-4 shadow-xl">
          <p className="text-sm text-white">
            {!isDrawing && polygon.length === 0 && t('map.tipSearch')}
            {isDrawing && t('map.tipDrawing')}
            {!isDrawing && polygon.length > 0 && polygon.length < 3 && t('map.tipAdd').replace('{count}', String(3 - polygon.length))}
            {!isDrawing && polygon.length >= 3 && t('map.tipCalculate').replace('{count}', String(polygon.length))}
          </p>
        </div>
      </div>
    </div>
  )
}
