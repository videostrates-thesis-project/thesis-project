import { useMemo } from "react"

export const useTimeStamp = (seconds: number) => {
  return useMemo(() => {
    // Seconds to minutes and seconds
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }, [seconds])
}
