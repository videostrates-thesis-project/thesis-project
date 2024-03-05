import { useCallback, useContext } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import ClipContent from "./ClipContent"
import { useStore } from "../../store"
import { TimelineContext } from "./Timeline"
import { executeScript } from "../../services/command/executeScript"
import useDraggable from "../../hooks/useDraggable"

const Clip = (props: { clip: TimelineElement }) => {
  const { clip } = props
  const timeline = useContext(TimelineContext)
  const { setSelectedClipId } = useStore()
  const { onDragStart, onDrag, draggedPosition } = useDraggable(clip.left)

  const onDragEnd = useCallback(
    (e: React.DragEvent) => {
      const clipShift = onDrag(e)
      const clipTimeShift = clipShift / timeline.widthPerSecond
      console.log("clipTimeShift", clipTimeShift)
      executeScript([
        {
          command: "move_delta",
          args: [`"${clip.id}"`, clipTimeShift.toString()],
        },
      ])
    },
    [onDrag, timeline.widthPerSecond, clip.id]
  )

  return (
    <>
      <div
        className="absolute m-0 h-full "
        draggable={true}
        onDrag={(e) => {
          onDrag(e)
          setSelectedClipId(clip.id)
        }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{ width: `${clip.width}px`, left: `${draggedPosition}px` }}
      >
        <ClipContent clip={clip} />
      </div>
    </>
  )
}

export default Clip
