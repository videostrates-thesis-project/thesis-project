import { useState, useCallback } from "react"

const useContextMenu = (itemCount: number) => {
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  const showMenu = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>
    ) => {
      if (itemCount === 0) return
      event.preventDefault()
      setIsVisible(true)

      const clickX = event.pageX + 5
      const clickY = event.pageY + 5
      const screenW = window.innerWidth
      const screenH = window.innerHeight
      const rootW = 200 // Approx width of the context menu
      const rootH = 16 + 36 * itemCount // Approx height of the context menu

      const right = screenW - clickX > rootW
      const bottom = screenH - clickY > rootH

      const posX = right ? clickX : clickX - rootW
      const posY = bottom ? clickY : clickY - rootH

      setMenuPosition({ x: posX, y: posY })
      event.stopPropagation() // Prevent event bubbling
    },
    [itemCount]
  )

  const hideMenu = useCallback(() => {
    setIsVisible(false)
  }, [])

  return { showMenu, hideMenu, menuPosition, isVisible }
}

export default useContextMenu
