import { useTimeStamp } from "../../hooks/useTimeStamp"
import { useStore } from "../../store"

const TimelineControls = (props: {
  zoomIn: (step: number) => void
  zoomOut: (step: number) => void
  zoomToFit: () => void
}) => {
  const { parsedVideostrate, playbackState } = useStore()
  const playbackTime = useTimeStamp(playbackState.time)
  const fullTime = useTimeStamp(parsedVideostrate.length)
  return (
    <div className="flex flex-row text-lg bg-base-300 border-y border-neutral p-2 ">
      <div className="w-1/3 text-left"></div>
      <div className="w-1/3">
        {playbackTime} / {fullTime}
      </div>
      <div className="w-1/3 text-right">
        <div className="tooltip" data-tip="Zoom out">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => props.zoomOut(0.1)}
          >
            <i className="bi bi-zoom-out text-lg"></i>
          </button>
        </div>
        <div className="tooltip" data-tip="Zoom in">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => props.zoomIn(0.1)}
          >
            <i className="bi bi-zoom-in text-lg"></i>
          </button>
        </div>
        <div className="tooltip" data-tip="Zoom to fit">
          <button className="btn btn-sm btn-ghost" onClick={props.zoomToFit}>
            <i className="bi bi-arrows-angle-contract text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimelineControls
