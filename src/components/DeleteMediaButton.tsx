import clsx from "clsx"

const DeleteMediaButton = (props: {
  onClick: () => void
  disabled: boolean
  className?: string
}) => {
  return (
    <button
      className={clsx(
        props.className,
        "remove-button opacity-0 absolute right-1 top-1 btn btn-sm transition-opacity",
        props.disabled && "pointer-events-none btn-disabled"
      )}
      onClick={props.onClick}
    >
      <i
        className={clsx(
          "bi bi-trash text-lg text-error",
          props.disabled && "text-slate-600 opacity-50"
        )}
      ></i>
    </button>
  )
}

export default DeleteMediaButton
