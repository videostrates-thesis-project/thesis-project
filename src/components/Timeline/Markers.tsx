import { useContext, useEffect, useState } from "react"
import { TimelineContext } from "./Timeline"
import formatTime from "../../utils/formatTime"
import clsx from "clsx"

const TARGET_STEP_WIDTH = 65
const MIN_STEP_WIDTH = 50

interface Marker {
  position: number
  label: string | null
}

const Markers = () => {
  const timeline = useContext(TimelineContext)
  const [markers, setMarkers] = useState<Marker[]>([])

  useEffect(() => {
    let stepLength = Math.max(
      1,
      Math.round(TARGET_STEP_WIDTH / timeline.widthPerSecond)
    )
    if (stepLength !== 1 && stepLength % 2 === 1) stepLength++
    if (stepLength * timeline.widthPerSecond < MIN_STEP_WIDTH) stepLength += 2

    const stepWidth = stepLength * timeline.widthPerSecond
    const newMarkers: Marker[] = []
    for (let i = 0; i < timeline.width - 30; i += stepWidth) {
      newMarkers.push({
        position: i,
        label:
          newMarkers.length % 2 == 0
            ? formatTime(i / timeline.widthPerSecond)
            : null,
      })
    }
    setMarkers(newMarkers)
  }, [timeline.width, timeline.widthPerSecond])

  return (
    <div className="flex flex-row relative h-6 min-h-6 mb-1">
      {markers.map((marker) => {
        return (
          <div
            key={`${marker.label}-${marker.position}`}
            className={clsx(
              "absolute bg-base-content w-[1px] h-2",
              marker.label && "h-4"
            )}
            style={{
              left: `${marker.position}px`,
            }}
          >
            <span className="relative -top-1 left-2 text-xs">
              {marker.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default Markers
