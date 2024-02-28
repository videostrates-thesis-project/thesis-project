import { useCallback, useEffect, useRef } from "react"
import { useStore } from "../store"

const ZOOM_STEP = 0.005

export const useScrollNavigation = (
  viewStart: number,
  viewEnd: number,
  setViewStart: (value: React.SetStateAction<number>) => void,
  setViewEnd: (value: React.SetStateAction<number>) => void
) => {
  const ref = useRef<HTMLDivElement>(null)
  const { parsedVideostrate } = useStore()

  const zoomIn = useCallback(
    (step: number = ZOOM_STEP) => {
      const newViewStart = Math.max(
        viewStart + step * parsedVideostrate.length,
        0
      )
      const newViewEnd = Math.min(
        viewEnd - step * parsedVideostrate.length,
        parsedVideostrate.length + (viewEnd - parsedVideostrate.length) / 2
      )
      if (newViewEnd - newViewStart < 4) return

      setViewStart(newViewStart)
      setViewEnd(newViewEnd)
    },
    [parsedVideostrate.length, setViewEnd, setViewStart, viewEnd, viewStart]
  )

  const zoomOut = useCallback(
    (step: number = ZOOM_STEP) => {
      const newViewStart = Math.max(
        viewStart - step * parsedVideostrate.length,
        0
      )
      const newViewEnd = viewEnd + step * parsedVideostrate.length
      const visibleClipLength =
        Math.min(newViewEnd, parsedVideostrate.length) - newViewStart
      if (visibleClipLength * 2 <= newViewEnd - newViewStart) return

      setViewStart(newViewStart)
      setViewEnd(newViewEnd)
    },
    [parsedVideostrate.length, setViewEnd, setViewStart, viewEnd, viewStart]
  )

  const resetZoom = useCallback(() => {
    setViewStart(0)
    setViewEnd(parsedVideostrate.length)
  }, [parsedVideostrate.length, setViewEnd, setViewStart])

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      const pct = 0.005
      if (!ref.current) return
      if (event.deltaY > 0) {
        zoomIn()
        console.log("zoom in")
      } else if (event.deltaY < 0) {
        zoomOut()
      }

      if (event.deltaX > 0) {
        if (
          viewEnd + pct * parsedVideostrate.length >
          parsedVideostrate.length
        ) {
          return
        }
        setViewStart((prev) =>
          Math.min(
            prev + pct * parsedVideostrate.length,
            parsedVideostrate.length
          )
        )
        setViewEnd((prev) =>
          Math.min(
            prev + pct * parsedVideostrate.length,
            parsedVideostrate.length
          )
        )
      } else if (event.deltaX < 0) {
        if (viewStart - pct * parsedVideostrate.length < 0) {
          return
        }

        setViewStart((prev) =>
          Math.max(prev - pct * parsedVideostrate.length, 0)
        )
        setViewEnd((prev) => Math.max(prev - pct * parsedVideostrate.length, 0))
      }
    }

    ref.current?.addEventListener("wheel", handleScroll)
    const currentRef = ref.current

    return () => {
      currentRef?.removeEventListener("wheel", handleScroll)
    }
  }, [
    parsedVideostrate.length,
    ref,
    setViewEnd,
    setViewStart,
    viewEnd,
    viewStart,
    zoomIn,
    zoomOut,
  ])

  return { ref, zoomIn, zoomOut, resetZoom }
}
