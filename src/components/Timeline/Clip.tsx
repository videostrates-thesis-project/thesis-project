import { useContext, useEffect, useState } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import ClipContent from "./ClipContent"
import { useStore } from "../../store"
import { TimelineContext } from "./Timeline"

const Clip = (props: { clip: TimelineElement }) => {
  const { clip } = props
  const timeline = useContext(TimelineContext)
  const { parsedVideostrate, setParsedVideostrate } = useStore()
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState(clip.left)
  const [draggedPosition, setDraggedPosition] = useState(clip.left)
  const [emptyDragImage, setEmptyDragImage] = useState<HTMLImageElement | null>(
    null
  )

  useEffect(() => {
    setDraggedPosition(clip.left)
  }, [clip.left])

  useEffect(() => {
    const img = document.createElement("img")
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    setEmptyDragImage(img)
    return () => {
      img.remove()
    }
  }, [])

  const onDragStart = (e: React.DragEvent) => {
    console.log("Clip - onDragStart")
    console.log(e)
    e.dataTransfer.setDragImage(emptyDragImage!, 10, 10)
    setIsDragging(true)
    setStartDragPosition(e.clientX - clip.left)
  }

  const onDrag = (e: React.DragEvent) => {
    setDraggedPosition(e.clientX - startDragPosition)
  }

  const onDragEnd = (e: React.DragEvent) => {
    console.log("Clip - onDragEnd")
    console.log(e)
    setIsDragging(false)
    setDraggedPosition(e.clientX - startDragPosition)
    const clipShift = e.clientX - startDragPosition - clip.left
    const clipTimeShift = clipShift / timeline.widthPerSecond
    console.log("clipTimeShift", clipTimeShift)
    parsedVideostrate.moveClipDeltaById(clip.id, clipTimeShift)
    setParsedVideostrate(parsedVideostrate)
    console.log("Parsed Videostrate:", parsedVideostrate.all)
  }

  return (
    <>
      <div
        className="absolute m-0 h-full "
        draggable={true}
        onDrag={onDrag}
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
