import { useCallback, useState } from "react"

const ZOOM_STEP = 0.9

const useZoom = () => {
  const [zoom, setZoom] = useState(1)

  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [setZoom])

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.round((prev / ZOOM_STEP) * 100) / 100)
  }, [setZoom])

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      if (prev * ZOOM_STEP < 0.4) return prev
      return Math.round(prev * ZOOM_STEP * 100) / 100
    })
  }, [setZoom])

  return { zoom, resetZoom, zoomIn, zoomOut }
}

export { ZOOM_STEP, useZoom }
