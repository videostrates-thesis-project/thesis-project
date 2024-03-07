import { useCallback, useContext } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import ClipContent from "./ClipContent"
import { useStore } from "../../store"
import { TimelineContext } from "./Timeline"
import { executeScript } from "../../services/command/executeScript"
import useDraggable from "../../hooks/useDraggable"
import clsx from "clsx"
import { useEditedClipDetails } from "../../store/editedClipDetails"

const Clip = (props: { clip: TimelineElement }) => {
  const { clip } = props
  const timeline = useContext(TimelineContext)
  const { setSelectedClipId } = useStore()
  const { onDragStart, onDrag, draggedPosition } = useDraggable(clip.left)
  const { setPosition, setDetails } = useEditedClipDetails()

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

  const onMouseOver = useCallback(
    (e: React.MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: window.innerHeight - e.clientY,
      })
    },
    [setPosition]
  )

  return (
    <>
      <div className={clsx("w-full", clip.oldElement ? "h-14" : "h-10")}>
        {clip.oldElement && (
          <div
            className="absolute m-0 top-4 h-10"
            draggable={true}
            onDrag={onDrag}
            onDragStart={(e) => {
              onDragStart(e)
              setSelectedClipId(clip.id)
            }}
            onDragEnd={onDragEnd}
            style={{
              width: `${clip.oldElement.width}px`,
              left: `${clip.oldElement.left}px`,
            }}
          >
            <ClipContent clip={clip.oldElement} isOldClip={true} />
          </div>
        )}
        <div
          className="absolute m-0 top-0 h-10 z-10"
          onMouseOver={() => setDetails(clip.edits)}
          onMouseMove={onMouseOver}
          onMouseLeave={() => {
            setDetails(undefined)
            console.log("mouse leave")
          }}
          draggable={true}
          onDrag={onDrag}
          onDragStart={(e) => {
            onDragStart(e)
            setSelectedClipId(clip.id)
          }}
          onDragEnd={onDragEnd}
          style={{ width: `${clip.width}px`, left: `${draggedPosition}px` }}
        >
          <ClipContent clip={clip} />
        </div>
      </div>
    </>
  )
}

export default Clip
