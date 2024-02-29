import { useEffect, useRef } from "react"

export const useScrollZoom = (
  zoomIn: () => void,
  zoomOut: () => void,
  elementRef: ReturnType<typeof useRef<HTMLDivElement | null>>
) => {
  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      console.log("scroll zoom", event.deltaY)
      if (elementRef.current && event.ctrlKey) {
        console.log("scroll zoom ctrlKey", event)
        event.preventDefault()
        if (event.deltaY > 0) {
          zoomOut()
        } else if (event.deltaY < 0) {
          zoomIn()
        }
      }
    }
    const currentRef = elementRef.current
    currentRef?.addEventListener("wheel", handleScroll)
    return () => {
      currentRef?.removeEventListener("wheel", handleScroll)
    }
  }, [zoomIn, zoomOut, elementRef])
}
