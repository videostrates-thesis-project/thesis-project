import { useEffect, useState } from "react"

const useDraggable = (initPosX: number) => {
  const [startDragPosition, setStartDragPosition] = useState(0)
  const [draggedPosition, setDraggedPosition] = useState(initPosX)
  const [emptyDragImage, setEmptyDragImage] = useState<HTMLImageElement | null>(
    null
  )
  useEffect(() => {
    setDraggedPosition(initPosX)
  }, [initPosX])

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
    e.dataTransfer.setDragImage(emptyDragImage!, 10, 10)
    setStartDragPosition(e.clientX - initPosX)
  }

  const onDrag = (e: React.DragEvent) => {
    // Sometimes the clientX is 0 for unknown reasons - it causes a jump in the dragged position.
    //It can ignored since the user has no possibility to drag the element to the left edge of the screen.
    if (e.clientX === 0) return 0
    setDraggedPosition(e.clientX - startDragPosition)
    if (initPosX === 0)
      console.log(
        "setDraggedPosition",
        e.clientX - startDragPosition,
        e.clientX,
        startDragPosition
      )
    // Returns the shift in position
    return e.clientX - startDragPosition - initPosX
  }

  return {
    onDragStart,
    onDrag,
    draggedPosition,
    setDraggedPosition,
  }
}

export default useDraggable
