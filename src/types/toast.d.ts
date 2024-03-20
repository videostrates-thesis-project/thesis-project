type ToastType = "info" | "success" | "error" | "warning"

interface Toast {
  id: string
  title: string
  description: string
  type: ToastType
}
