import { useTimeStamp } from "../hooks/useTimeStamp"
import { useStore } from "../store"

const TimelineControls = (props: {
  zoom: number
  setZoom: (zoom: number) => void
}) => {
  const { parsedVideostrate, playbackState } = useStore()
  const playbackTime = useTimeStamp(playbackState.time)
  const fullTime = useTimeStamp(parsedVideostrate.length)
  return (
    <div className="flex flex-row text-lg bg-base-300 border-t border-neutral p-2">
      <div className="w-1/3 text-left">0</div>
      <div className="w-1/3">
        {playbackTime} / {fullTime}
      </div>
      <div className="w-1/3 text-right">
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => props.setZoom(Math.floor(props.zoom * 0.9))}
        >
          <i className="bi bi-zoom-out text-lg"></i>
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => props.setZoom(Math.floor(props.zoom / 0.9))}
        >
          <i className="bi bi-zoom-in text-lg"></i>
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => props.setZoom(100)}
        >
          <i className="bi bi-arrows-angle-contract text-lg"></i>
        </button>
      </div>
    </div>
  )
}

export default TimelineControls
