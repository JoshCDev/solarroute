import { useEffect, useState, useRef } from 'react'

// Global loader promise to prevent multiple script loads
let googleMapsLoader: Promise<void> | null = null

export function useGoogleMaps(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    // Already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Already loading (another component is loading it)
    if (googleMapsLoader) {
      googleMapsLoader
        .then(() => setIsLoaded(true))
        .catch((err) => setError(err.message))
      return
    }

    // Not loaded and not loading - start loading
    if (!isLoadingRef.current) {
      isLoadingRef.current = true
      
      googleMapsLoader = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,places,geometry`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          setIsLoaded(true)
          resolve()
        }
        
        script.onerror = () => {
          const errMsg = 'Failed to load Google Maps'
          setError(errMsg)
          reject(new Error(errMsg))
        }
        
        document.head.appendChild(script)
      })
    }
  }, [apiKey])

  return { isLoaded, error }
}
