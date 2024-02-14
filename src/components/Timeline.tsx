import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useStore } from "../store"
import { useTimeStamp } from "../hooks/useTimeStamp"

const Timeline = () => {
  const { parsedVideostrate, playbackState, setSeek } = useStore()
  const [isSeeking, setIsSeeking] = useState(false)
  const [lastSeekTime, setLastSeekTime] = useState(new Date())
  const [viewStart, setViewStart] = useState(0)
  const [viewEnd, setViewEnd] = useState(0)
  const timelineDiv = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

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

  useEffect(() => {
    setViewEnd(length)
  }, [length])

  // Calculate the width of each clip as a percantage of total length
  const clipWidths = useMemo(() => {
    const viewLength = viewEnd - viewStart
    return parsedVideostrate.clips.map((clip) => {
      const start = clip.start
      const end = clip.end
      const width = (end - start) / viewLength
      return width
    })
  }, [viewEnd, viewStart, parsedVideostrate.clips])

  const elementWidths = useMemo(() => {
    const viewLength = viewEnd - viewStart
    return parsedVideostrate.elements.map((element) => {
      const start = element.start
      const end = element.end
      const width = (end - start) / viewLength
      return width
    })
  }, [viewEnd, viewStart, parsedVideostrate.elements])

  const markers = useMemo(() => {
    const viewLength = viewEnd - viewStart
    const startPcts = parsedVideostrate.all.map(
      (element) => element.start / length - viewStart / length
    )

    return startPcts
      .filter((startPct, index) => {
        if (index === 0) return true
        return startPct - startPcts[index - 1] > 0.02
      })
      .concat([1])
  }, [length, parsedVideostrate.all, viewEnd, viewStart])

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

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      const pct = 0.005
      if (!timelineDiv.current) return
      if (event.deltaY > 0) {
        console.log(
          "Scroll up:",
          event.deltaY,
          viewStart + pct * length,
          "-",
          viewEnd - pct * length
        )
        if (viewEnd - viewStart < 2) {
          console.log("Not scrolling")
          return
        }
        setViewStart((prev) => Math.min(prev + pct * length, length))
        setViewEnd((prev) => Math.max(prev - pct * length, 0))
      } else if (event.deltaY < 0) {
        console.log(
          "Scroll down:",
          event.deltaY,
          viewStart - pct * length,
          "-",
          viewEnd + pct * length
        )
        if (viewEnd - viewStart > length) {
          console.log("Not scrolling")
          return
        }
        setViewStart((prev) => Math.max(prev - pct * length, 0))
        setViewEnd((prev) => Math.min(prev + pct * length, length))
      }

      if (event.deltaX > 0) {
        console.log(
          "Scroll right:",
          viewStart + pct * length,
          "-",
          viewEnd + pct * length
        )
        if (viewEnd + pct * length > length) {
          console.log("Not scrolling")
          return
        }
        setViewStart((prev) => Math.min(prev + pct * length, length))
        setViewEnd((prev) => Math.min(prev + pct * length, length))
      } else if (event.deltaX < 0) {
        console.log(
          "Scroll left:",
          viewStart - pct * length,
          "-",
          viewEnd - pct * length
        )
        if (viewStart - pct * length < 0) {
          console.log("Not scrolling")
          return
        }

        setViewStart((prev) => Math.max(prev - pct * length, 0))
        setViewEnd((prev) => Math.max(prev - pct * length, 0))
      }
    }

    timelineDiv.current?.addEventListener("wheel", handleScroll)

    return () => {
      timelineDiv.current?.removeEventListener("wheel", handleScroll)
    }
  }, [length, scale, viewEnd, viewStart])

  return (
    <div
      className={`flex flex-col mt-4 relative ${isSeeking ? "cursor-grabbing" : "cursor-pointer"}`}
      onMouseMove={onSeek}
      onMouseDown={onStartSeeking}
      onMouseUp={onStopSeeking}
      onMouseLeave={onStopSeeking}
      ref={timelineDiv}
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
        {parsedVideostrate.elements.map((element, index) => {
          return (
            <div
              key={index}
              className={`absolute h-8 bg-green-500 rounded-md mx-2 text-white flex justify-start items-center`}
              style={{
                width: `${elementWidths[index] * 100}%`,
                left: `${(element.start / (viewEnd - viewStart) - viewStart / (viewEnd - viewStart)) * 100}%`,
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
              className={`absolute h-16 border-2 border-blue-600 bg-blue-500 rounded-md text-white flex justify-start items-center`}
              style={{
                width: `${clipWidths[index] * 100}%`,
                // Set left according to viewStart
                left: `${(clip.start / (viewEnd - viewStart) - viewStart / (viewEnd - viewStart)) * 100}%`,
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
