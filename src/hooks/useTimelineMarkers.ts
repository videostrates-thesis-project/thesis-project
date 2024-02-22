import { useMemo } from "react"

const MAX_MARKERS = 10

export const useTimelineMarkers = (viewStart: number, viewEnd: number) => {
  return useMemo(() => {
    const viewLength = viewEnd - viewStart
    const markers = []
    const step = Math.max(Math.floor(viewLength / MAX_MARKERS), 1)
    for (let i = Math.ceil(viewStart); i < viewEnd; i += step) {
      markers.push({
        left: ((i - viewStart) / viewLength) * 100,
        text: markers.length % 2 === 0 ? i : null,
      })
    }
    return markers
  }, [viewEnd, viewStart])
}
