import { useMemo } from "react"
import formatTime from "../../utils/formatTime"
import { useStore } from "../../store"
import clsx from "clsx"

const AddElementButton = (props: {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  time: number
}) => {
  const { seek, isUiFrozen } = useStore()
  const formattedSeekTime = useMemo(() => {
    return formatTime(seek)
  }, [seek])
  return (
    <button
      className={clsx(
        "btn btn-sm btn-ghost add-element-button relative right-0",
        isUiFrozen && "pointer-events-none btn-disabled"
      )}
      onClick={props.onClick}
    >
      <div className="button-content text-xs">
        <span className="w-full text-nowrap">Add at {formattedSeekTime}</span>
      </div>
      <i className="bi bi-plus-lg text-lg text-accent"></i>
    </button>
  )
}

export default AddElementButton
