import { useCallback, useEffect, useMemo, useState } from "react"
import { useStore } from "../store"
import { useTimeStamp } from "../hooks/useTimeStamp"
import { VideoClipElement, VideoElement } from "../types/videoElement"
import { useScrollNavigation } from "../hooks/useScrollNavigation"

interface TimelineElement extends VideoElement {
  width: number
  left: number
  clipName: string | undefined
}

const Timeline = () => {
  const { parsedVideostrate, playbackState, setSeek, availableClips } =
    useStore()
  const [isSeeking, setIsSeeking] = useState(false)
  const [lastSeekTime, setLastSeekTime] = useState(new Date())
  const [viewStart, setViewStart] = useState(0)
  const [viewEnd, setViewEnd] = useState(0)
  const length = useMemo(
    () =>
      Math.max(
        parsedVideostrate.clips.at(-1)?.end ?? 0,
        parsedVideostrate.elements.at(-1)?.end ?? 0
      ),
    [parsedVideostrate.clips, parsedVideostrate.elements]
  )
  const playbackTime = useTimeStamp(playbackState.time)
  const fullTime = useTimeStamp(length)
  const timelineDivRef = useScrollNavigation(
    viewStart,
    viewEnd,
    length,
    setViewStart,
    setViewEnd
  )

  useEffect(() => {
    setViewEnd(length)
  }, [length])

  const elements = useMemo(() => {
    const viewLength = viewEnd - viewStart
    return parsedVideostrate.all.map((clip) => {
      return {
        ...clip,
        width: ((clip.end - clip.start) / viewLength) * 100,
        left: ((clip.start - viewStart) / viewLength) * 100,
        clipName:
          clip.type === "video" &&
          availableClips.find(
            (c) => c.source === (clip as VideoClipElement).source
          )?.name,
      } as TimelineElement
    })
  }, [availableClips, parsedVideostrate.all, viewEnd, viewStart])

  const markers = useMemo(() => {
    const startPcts = parsedVideostrate.all.map(
      (element) => element.start / length - viewStart / length
    )

    return startPcts
      .filter((startPct, index) => {
        if (index === 0) return true
        return startPct - startPcts[index - 1] > 0.02
      })
      .concat([1])
  }, [length, parsedVideostrate.all, viewStart])

  const playbackPosition = useMemo(
    () => (playbackState.time / length) * 100 + "%",
    [length, playbackState.time]
  )

  const onSeek = useCallback(
    (e: React.MouseEvent) => {
      if (!isSeeking) return
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = x / rect.width
      const newSeek = pct * length
      const now = new Date()
      if (now.getTime() - lastSeekTime.getTime() < 100) return

      setSeek(newSeek)
      setLastSeekTime(now)
    },
    [isSeeking, lastSeekTime, length, setSeek]
  )

  const onStartSeeking = useCallback(() => {
    setIsSeeking(true)
  }, [])

  const onStopSeeking = useCallback(() => {
    setIsSeeking(false)
  }, [])

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
              style={{ left: `${marker * 100}%` }}
            >
              {Math.round(marker * (viewEnd - viewStart))}
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
