import { useContext } from "react"
import { useStore } from "../../../store"
import { TimelineContext } from "../../Timeline"
import clsx from "clsx"

const Playhead = (props: {
  onMouseDown: (e: React.MouseEvent) => void
  isSeeking: boolean
}) => {
  const { playbackState } = useStore()
  const timeline = useContext(TimelineContext)
  return (
    <div
      className={clsx(
        "h-full w-[0.125rem] bg-white absolute z-10",
        props.isSeeking ? "cursor-grabbing" : "cursor-pointer"
      )}
      style={{ left: playbackState.time * timeline.widthPerSecond }}
      onMouseDown={props.onMouseDown}
    >
      <i className="absolute bi bi-caret-down-fill text-3xl text-white l-1/2 -translate-x-1/2 -top-3"></i>
    </div>
  )
}

export default Playhead
