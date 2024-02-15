import { useEffect, useMemo, useState } from "react"
import { useStore } from "../store"
import { useTimeStamp } from "../hooks/useTimeStamp"
import { useScrollNavigation } from "../hooks/useScrollNavigation"
import { useSeek } from "../hooks/useSeek"
import { useTimelineElements } from "../hooks/useTimelineElements"
import { useTimelineMarkers } from "../hooks/useTimelineMarkers"

const Timeline = () => {
  const { parsedVideostrate, playbackState } = useStore()
  const [viewStart, setViewStart] = useState(0)
  const [viewEnd, setViewEnd] = useState(0)
  const playbackTime = useTimeStamp(playbackState.time)
  const fullTime = useTimeStamp(parsedVideostrate.length)
  const timelineDivRef = useScrollNavigation(
    viewStart,
    viewEnd,
    setViewStart,
    setViewEnd
  )
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

  return (
    <div
      className={`flex flex-col mt-4 relative ${isSeeking ? "cursor-grabbing" : "cursor-pointer"}`}
      onMouseMove={onSeek}
      onMouseDown={onStartSeeking}
      onMouseUp={onStopSeeking}
      onMouseLeave={onStopSeeking}
      ref={timelineDivRef}
    >
      <div className="flex flex-row text-lg">
        <div className="w-1/4 text-left ml-2">{viewStart.toFixed(1)}</div>
        <div className="w-1/2 font-bold">
          Timeline {playbackTime}/{fullTime}
        </div>
        <div className="w-1/4 text-right mr-2">{viewEnd.toFixed(1)}</div>
      </div>
      <div
        className="h-full w-1 bg-black absolute z-10"
        style={{ left: playbackPosition }}
      ></div>
      <div className="flex flex-row mt-4 relative h-8">
        {markers.map((marker, index) => {
          return (
            <div
              key={index}
              className="absolute  h-8 bg-gray-500 rounded-md mx-2 text-white flex justify-center items-center w-6 -translate-x-3"
              style={{ left: `${marker.left}%` }}
            >
              {marker.text.toFixed(0)}
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
                className={`absolute h-8 bg-green-500 rounded-md mx-2 text-white flex justify-start items-center`}
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
                className={`absolute h-16 border-2 border-blue-600 bg-blue-500 rounded-md text-white flex justify-center items-center`}
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
  )
}

export default Timeline