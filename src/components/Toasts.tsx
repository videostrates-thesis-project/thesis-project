import clsx from "clsx"
import { useStore } from "../store"

const Toasts = () => {
  const { toasts } = useStore()

  if (toasts.length === 0) return null

  return (
    <div className="toast toast-top toast-start z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx("alert", toast.type === "error" && "alert-error")}
        >
          {toast.type === "error" && <i className="bi bi-x-circle text-lg"></i>}
          <div className="flex flex-col">
            <p className="font-bold">{toast.title}</p>
            <p className="text-sm opacity-75">{toast.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Toasts
