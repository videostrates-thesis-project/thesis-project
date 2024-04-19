import { useCallback, useState } from "react"

type ContextMenuProps = {
  items: { label: string; action: () => void }[]
  position: { x: number; y: number }
  visible: boolean
  onClose: () => void
  disabled?: boolean
}

const ContextMenu = ({
  items,
  position,
  visible,
  onClose,
  disabled,
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
            className={disabled ? "disabled" : "cursor-pointer"}
            onClick={() => {
              if (disabled) return
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
