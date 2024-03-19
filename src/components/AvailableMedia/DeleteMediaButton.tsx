import clsx from "clsx"

const DeleteMediaButton = (props: {
  onClick: () => void
  disabled: boolean
}) => {
  return (
    <button
      className={clsx(
        "remove-button opacity-0 absolute right-1 top-1 btn btn-sm btn-neutral transition-opacity",
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
  )
}

export default DeleteMediaButton
