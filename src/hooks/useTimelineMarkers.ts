import { useMemo } from "react"
import { useStore } from "../store"

export const useTimelineMarkers = (viewStart: number, viewEnd: number) => {
  const { parsedVideostrate } = useStore()

  return useMemo(() => {
    const viewLength = viewEnd - viewStart
    return parsedVideostrate.all
      .map((element) => ({
        left: ((element.start - viewStart) / viewLength) * 100,
        text: element.start,
      }))
      .concat({
        left: ((parsedVideostrate.length - viewStart) / viewLength) * 100,
        text: parsedVideostrate.length,
      })
  }, [parsedVideostrate.all, parsedVideostrate.length, viewEnd, viewStart])
}
