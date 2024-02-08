import { useCallback, useMemo, useState } from "react"
import { useStore } from "../store"
import { useTimeStamp } from "../hooks/useTimeStamp"

const Timeline = () => {
  const { parsedVideostrate, playbackState, setSeek } = useStore()
  const [isSeeking, setIsSeeking] = useState(false)
  const [lastSeekTime, setLastSeekTime] = useState(new Date())

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

  // Calculate the width of each clip as a percantage of total length
  const clipWidths = useMemo(() => {
    return parsedVideostrate.clips.map((clip) => {
      const start = clip.start
      const end = clip.end
      const width = (end - start) / length
      return width
    })
  }, [parsedVideostrate.clips, length])

  const elementWidths = useMemo(() => {
    return parsedVideostrate.elements.map((element) => {
      const start = element.start
      const end = element.end
      const width = (end - start) / length
      return width
    })
  }, [parsedVideostrate.elements, length])

  const markers = useMemo(() => {
    const startPcts = parsedVideostrate.all.map(
      (element) => element.start / length
    )

    return startPcts
      .filter((startPct, index) => {
        if (index === 0) return true
        return startPct - startPcts[index - 1] > 0.02
      })
      .concat([1])
  }, [length, parsedVideostrate.all])

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
    >
      <div className="flex flex-row text-lg">
        <div className="w-1/4 text-left ml-2">0</div>
        <div className="w-1/2 font-bold">
          Timeline {playbackTime}/{fullTime}
        </div>
        <div className="w-1/4 text-right mr-2">{length}</div>
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
              {Math.round(marker * length)}
            </div>
          )
        })}
      </div>
      <div className="flex flex-row mt-4 relative h-12">
        {parsedVideostrate.elements.map((element, index) => {
          return (
            <div
              key={index}
              className={`absolute h-8 bg-green-500 rounded-md mx-2 text-white flex justify-center items-center`}
              style={{
                width: `${elementWidths[index] * 100}%`,
                left: `${(element.start / length) * 100}%`,
              }}
            >
              {element.type} {element.nodeType}
            </div>
          )
        })}
      </div>
      <div className="flex flex-row mt-4 relative h-20">
        {parsedVideostrate.clips.map((clip, index) => {
          return (
            <div
              key={index}
              className={`absolute h-16 bg-blue-500 rounded-md text-white flex justify-center items-center`}
              style={{
                width: `${clipWidths[index] * 100}%`,
                left: `${(clip.start / length) * 100}%`,
              }}
            >
              {clip.source}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
