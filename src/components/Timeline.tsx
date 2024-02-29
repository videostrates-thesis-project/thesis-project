import { createContext, useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "../store"
import TimelineControls from "./TimelineControls"
import clsx from "clsx"
import { useZoom } from "../hooks/useZoom"
import Markers from "./Views/Timeline/Markers"
import Clips from "./Views/Timeline/Clips"
import Playhead from "./Views/Timeline/Playhead"
import { useSeek } from "../hooks/useSeek"

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
  const { parsedVideostrate } = useStore()
  const { zoom, resetZoom, zoomIn, zoomOut } = useZoom()
  const [timelineWidth, setTimelineWidth] = useState(1)
  const [widthPerSecond, setWidthPerSecond] = useState(1)
  const { onSeek, onStartSeeking, onStopSeeking, isSeeking } =
    useSeek(widthPerSecond)

  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const updateTimelineWidth = useCallback(() => {
    console.log("updateTimelineWidth")
    const target = timelineContainerRef.current?.parentNode as HTMLElement
    if (!target) return
    setTimelineWidth(
      // Always leave half a screen width of empty space on the right
      Math.max(target.clientWidth * (zoom + 0.5), target.clientWidth)
    )
    setWidthPerSecond((target.clientWidth * zoom) / parsedVideostrate.length)
    console.log("updateTimelineWidth", target.clientWidth)
  }, [parsedVideostrate.length, zoom])

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
    <TimelineContext.Provider
      value={{
        zoom,
        widthPerSecond,
        width: timelineWidth,
      }}
    >
      <TimelineControls {...{ zoomToFit, zoomOut, zoomIn }} />
      <div
        className={clsx(
          "w-full overflow-auto flex-grow select-none max-h-[40%]",
          isSeeking && "cursor-grabbing"
        )}
        ref={timelineContainerRef}
        onMouseMove={onSeek}
        onMouseUp={onStopSeeking}
        onMouseLeave={onStopSeeking}
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
  )
}

export { TimelineContext }
export default Timeline
