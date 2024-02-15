import { useEffect, useRef } from "react"
import { useStore } from "../store"

export const useScrollNavigation = (
  viewStart: number,
  viewEnd: number,
  setViewStart: (value: React.SetStateAction<number>) => void,
  setViewEnd: (value: React.SetStateAction<number>) => void
) => {
  const ref = useRef<HTMLDivElement>(null)
  const { parsedVideostrate } = useStore()

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      const pct = 0.005
      if (!ref.current) return
      if (event.deltaY > 0) {
        if (viewEnd - viewStart < 2) {
          return
        }
        setViewStart((prev) =>
          Math.min(
            prev + pct * parsedVideostrate.length,
            parsedVideostrate.length
          )
        )
        setViewEnd((prev) => Math.max(prev - pct * parsedVideostrate.length, 0))
      } else if (event.deltaY < 0) {
        if (viewEnd - viewStart > parsedVideostrate.length) {
          return
        }
        setViewStart((prev) =>
          Math.max(prev - pct * parsedVideostrate.length, 0)
        )
        setViewEnd((prev) =>
          Math.min(
            prev + pct * parsedVideostrate.length,
            parsedVideostrate.length
          )
        )
      }

      if (event.deltaX > 0) {
        if (
          viewEnd + pct * parsedVideostrate.length >
          parsedVideostrate.length
        ) {
          return
        }
        setViewStart((prev) =>
          Math.min(
            prev + pct * parsedVideostrate.length,
            parsedVideostrate.length
          )
        )
        setViewEnd((prev) =>
          Math.min(
            prev + pct * parsedVideostrate.length,
            parsedVideostrate.length
          )
        )
      } else if (event.deltaX < 0) {
        if (viewStart - pct * parsedVideostrate.length < 0) {
          return
        }

        setViewStart((prev) =>
          Math.max(prev - pct * parsedVideostrate.length, 0)
        )
        setViewEnd((prev) => Math.max(prev - pct * parsedVideostrate.length, 0))
      }
    }

    ref.current?.addEventListener("wheel", handleScroll)
    const currentRef = ref.current

    return () => {
      currentRef?.removeEventListener("wheel", handleScroll)
    }
  }, [
    parsedVideostrate.length,
    ref,
    setViewEnd,
    setViewStart,
    viewEnd,
    viewStart,
  ])

  return ref
}
