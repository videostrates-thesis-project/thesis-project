import clsx from "clsx"

const DeleteMediaButton = (props: {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  disabled: boolean
}) => {
  return (
    <div
      className={clsx("absolute right-1 top-1 tooltip tooltip-left z-20")}
      data-tip={
        props.disabled ? "In use - cannot be deleted" : "Delete from library"
      }
    >
      <button
        className={clsx(
          "remove-button opacity-0 btn btn-sm btn-neutral transition-opacity",
          props.disabled && "pointer-events-none btn-disabled"
        )}
        onClick={props.onClick}
      >
        <i
          className={clsx(
            "bi bi-trash text-lg text-error",
            props.disabled && "text-slate-500 opacity-70"
          )}
        ></i>
      </button>
    </div>
  )
}

export default DeleteMediaButton
