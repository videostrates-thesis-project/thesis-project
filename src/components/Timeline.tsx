import { useEffect, useMemo, useState } from "react"
import { useStore } from "../store"
import { useScrollNavigation } from "../hooks/useScrollNavigation"
import { useSeek } from "../hooks/useSeek"
import { useTimelineElements } from "../hooks/useTimelineElements"
import { useTimelineMarkers } from "../hooks/useTimelineMarkers"
import TimelineControls from "./TimelineControls"
import clsx from "clsx"

const Timeline = () => {
  const { parsedVideostrate, playbackState } = useStore()
  const [viewStart, setViewStart] = useState(0)
  const [viewEnd, setViewEnd] = useState(0)
  const {
    ref: timelineDivRef,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useScrollNavigation(viewStart, viewEnd, setViewStart, setViewEnd)
  const { isSeeking, onSeek, onStartSeeking, onStopSeeking } = useSeek(
    parsedVideostrate.length
  )
  const elements = useTimelineElements(viewStart, viewEnd)
  const markers = useTimelineMarkers(viewStart, viewEnd)

  useEffect(() => {
    setViewEnd(parsedVideostrate.length)
  }, [parsedVideostrate.length])

  const playbackPosition = useMemo(
    () => (playbackState.time / parsedVideostrate.length) * 100 + "%",
    [parsedVideostrate.length, playbackState.time]
  )

  const formatMarker = (marker: number | null) => {
    if (marker === null) return ""
    const minutes = Math.floor(marker / 60)
    const seconds = marker % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col mt-4 relative" ref={timelineDivRef}>
      <TimelineControls {...{ resetZoom, zoomOut, zoomIn }} />
      <div
        className={clsx(
          "relative overflow-clip",
          isSeeking ? "cursor-grabbing" : "cursor-pointer"
        )}
        onMouseMove={onSeek}
        onMouseDown={onStartSeeking}
        onMouseUp={onStopSeeking}
        onMouseLeave={onStopSeeking}
      >
        <div
          className="h-full w-[0.125rem] bg-white absolute z-10"
          style={{ left: playbackPosition }}
        >
          <i className="absolute bi bi-caret-down-fill text-2xl text-white l-1/2 -translate-x-1/2 -top-3"></i>
        </div>
        <div className="flex flex-row relative h-8">
          {markers.map((marker, index) => {
            return (
              <div
                key={index}
                className="absolute bg-base-content w-[1px]"
                style={{
                  left: `${marker.left}%`,
                  height: `${marker.text === null ? "0.5" : "1"}rem`,
                }}
              >
                <span className="relative -top-1 left-2 text-xs">
                  {formatMarker(marker.text)}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex flex-row mt-4 relative h-12">
          {elements
            .filter((e) => e.type !== "video")
            .map((element, index) => {
              return (
                <div
                  key={index}
                  className="absolute h-8 bg-green-500 rounded-md mx-2 text-white flex justify-start items-center"
                  style={{
                    width: `${element.width}%`,
                    left: `${element.left}%`,
                  }}
                >
                  {element.type} {element.nodeType}
                </div>
              )
            })}
        </div>
        <div className="flex flex-row mt-4 relative h-20">
          {elements
            .filter((e) => e.type === "video")
            .map((element, index) => {
              return (
                <div
                  key={index}
                  className="absolute h-16 border-2 border-blue-600 bg-blue-500 rounded-md text-white flex justify-center items-center"
                  style={{
                    width: `${element.width}%`,
                    left: `${element.left}%`,
                  }}
                >
                  {element.clipName}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default Timeline
