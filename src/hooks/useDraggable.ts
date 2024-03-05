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
    setDraggedPosition(e.clientX - startDragPosition)
    // Returns the shift in position
    return e.clientX - startDragPosition - initPosX
  }

  return {
    onDragStart,
    onDrag,
    draggedPosition,
  }
}

export default useDraggable
