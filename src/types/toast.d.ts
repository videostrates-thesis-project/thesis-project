interface Toast {
  id: string
  title: string
  description: string
  type: "info" | "success" | "error" | "warning"
  length: number
}
