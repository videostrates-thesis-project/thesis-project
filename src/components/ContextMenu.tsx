import { useCallback, useState } from "react"

type ContextMenuProps = {
  items: { label: string; action: () => void }[]
  position: { x: number; y: number }
  visible: boolean
  onClose: () => void
}

const ContextMenu = ({
  items,
  position,
  visible,
  onClose,
}: ContextMenuProps) => {
  const [mouseLeaveTimeout, setMouseLeaveTimeout] = useState<NodeJS.Timeout>()

  const onMouseLeave = useCallback(() => {
    clearTimeout(mouseLeaveTimeout)
    const timeout = setTimeout(() => {
      onClose()
    }, 1000)
    setMouseLeaveTimeout(timeout)
  }, [mouseLeaveTimeout, onClose])

  const onMouseEnter = useCallback(() => {
    clearTimeout(mouseLeaveTimeout)
  }, [mouseLeaveTimeout])

  if (!visible) return null

  return (
    <div
      className="fixed shadow-md z-50"
      style={{ top: position.y, left: position.x }}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <ul className="menu bg-base-200 rounded-box">
        {items.map((item, index) => (
          <li
            key={index}
            className="cursor-pointer"
            onClick={() => {
              item.action()
              onClose()
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <a>{item.label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ContextMenu
