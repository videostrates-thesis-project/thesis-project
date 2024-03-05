import { useEffect, useState } from "react"

const useDraggable = (initPosX: number, initPosY: number) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: initPosX, y: initPosY })

  useEffect(() => {
    setDragStartPos({ x: initPosX, y: initPosY })
    console.log("useDraggable useEffect", initPosX, initPosY)
  }, [initPosX, initPosY])

  const updatePosition = (e: React.MouseEvent) => {
    const x = e.clientX - dragStartPos.x
    const y = e.clientY - dragStartPos.y
    console.log(
      "useDraggable updatePosition",
      dragStartPos.x,
      dragStartPos.y,
      e.clientX,
      e.clientY,
      x,
      y
    )
    setPosition({ x, y })
    return { x, y }
  }

  const OnDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    console.log("useDraggable onMouseDown", e.clientX, e.clientY)
    setDragStartPos({ x: e.clientX - initPosX, y: e.clientY - initPosY })
  }

  const OnDragStop = (e: React.MouseEvent) => {
    setIsDragging(false)
    updatePosition(e)
  }

  const OnDrag = (e: React.MouseEvent) => {
    if (isDragging) {
      updatePosition(e)
    }
  }

  return {
    onMouseDown: OnDragStart,
    onMouseUp: OnDragStop,
    onMouseMove: OnDrag,
    posX: position.x,
    posY: position.y,
  }
}

export default useDraggable
