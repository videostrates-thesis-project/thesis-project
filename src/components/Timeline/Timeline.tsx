import { createContext, useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "../../store"
import TimelineControls from "./TimelineControls"
import clsx from "clsx"
import { useZoom } from "../../hooks/useZoom"
import Markers from "./Markers"
import Clips from "./Clips"
import Playhead from "./Playhead"
import { useSeek } from "../../hooks/useSeek"
import { useScrollZoom } from "../../hooks/useScrollZoom"
import { useLatestChanges } from "../../hooks/useLatestChanges"
import HoveredClipDetails from "./HoveredClipDetails"

const TIMELINE_MIN_LENGTH = 10

interface TimelineContextProps {
  zoom: number
  widthPerSecond: number
  width: number
}

const TimelineContext = createContext<TimelineContextProps>({
  zoom: 1,
  widthPerSecond: 1,
  width: 1,
})

const Timeline = () => {
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const { parsedVideostrate } = useStore()
  const { zoom, resetZoom, zoomIn, zoomOut } = useZoom()
  useScrollZoom(zoomIn, zoomOut, timelineContainerRef)
  const [timelineWidth, setTimelineWidth] = useState(1)
  const [widthPerSecond, setWidthPerSecond] = useState(1)
  const { onSeek, onStartSeeking, onStopSeeking, isSeeking } =
    useSeek(widthPerSecond)
  const { previousVideostrate } = useLatestChanges()

  const updateTimelineWidth = useCallback(() => {
    console.log("updateTimelineWidth")
    const target = timelineContainerRef.current?.parentNode as HTMLElement
    if (!target) return
    setTimelineWidth(
      // Always leave half a screen width of empty space on the right
      Math.max(target.clientWidth * (zoom + 0.5), target.clientWidth)
    )
    const length = Math.max(
      previousVideostrate?.length || TIMELINE_MIN_LENGTH,
      parsedVideostrate.length
    )
    setWidthPerSecond((target.clientWidth * zoom) / length)
    console.log("updateTimelineWidth", target.clientWidth)
  }, [parsedVideostrate.length, previousVideostrate?.length, zoom])

  useEffect(() => {
    updateTimelineWidth()
    window.addEventListener("resize", updateTimelineWidth)
    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", updateTimelineWidth)
    }
  }, [updateTimelineWidth])

  const zoomToFit = useCallback(() => {
    resetZoom()
    const target = timelineContainerRef.current
    if (!target) return
    target.scrollTo({
      left: 0,
      behavior: "smooth",
    })
  }, [resetZoom])

  return (
    <div className="h-2/5 flex flex-col">
      <TimelineContext.Provider
        value={{
          zoom,
          widthPerSecond,
          width: timelineWidth,
        }}
      >
        <HoveredClipDetails />
        <TimelineControls {...{ zoomToFit, zoomOut, zoomIn }} />
        <div
          className={clsx(
            "w-full overflow-x-auto overflow-y-hidden flex-grow select-none",
            isSeeking && "cursor-grabbing"
          )}
          ref={timelineContainerRef}
          onMouseMove={onSeek}
          onMouseUp={onStopSeeking}
          onMouseLeave={onStopSeeking}
          onMouseDown={onStartSeeking}
        >
          <div
            className="flex flex-col relative h-full"
            style={{ width: timelineWidth }}
            ref={timelineRef}
          >
            <Markers />
            <Clips />
            <Playhead onMouseDown={onStartSeeking} isSeeking={isSeeking} />
          </div>
        </div>
      </TimelineContext.Provider>
    </div>
  )
}

export { TimelineContext }
export default Timeline
