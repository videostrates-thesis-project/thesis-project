import { useEffect, useRef } from "react"

export const useScrollNavigation = (
  viewStart: number,
  viewEnd: number,
  length: number,
  setViewStart: (value: React.SetStateAction<number>) => void,
  setViewEnd: (value: React.SetStateAction<number>) => void
) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      const pct = 0.005
      if (!ref.current) return
      if (event.deltaY > 0) {
        if (viewEnd - viewStart < 2) {
          return
        }
        setViewStart((prev) => Math.min(prev + pct * length, length))
        setViewEnd((prev) => Math.max(prev - pct * length, 0))
      } else if (event.deltaY < 0) {
        if (viewEnd - viewStart > length) {
          return
        }
        setViewStart((prev) => Math.max(prev - pct * length, 0))
        setViewEnd((prev) => Math.min(prev + pct * length, length))
      }

      if (event.deltaX > 0) {
        if (viewEnd + pct * length > length) {
          return
        }
        setViewStart((prev) => Math.min(prev + pct * length, length))
        setViewEnd((prev) => Math.min(prev + pct * length, length))
      } else if (event.deltaX < 0) {
        if (viewStart - pct * length < 0) {
          return
        }

        setViewStart((prev) => Math.max(prev - pct * length, 0))
        setViewEnd((prev) => Math.max(prev - pct * length, 0))
      }
    }

    ref.current?.addEventListener("wheel", handleScroll)
    const currentRef = ref.current

    return () => {
      currentRef?.removeEventListener("wheel", handleScroll)
    }
  }, [length, ref, setViewEnd, setViewStart, viewEnd, viewStart])

  return ref
}
