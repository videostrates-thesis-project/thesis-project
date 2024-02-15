import { useCallback, useState } from "react"
import { useStore } from "../store"

export const useSeek = (length: number) => {
  const { setSeek } = useStore()
  const [isSeeking, setIsSeeking] = useState(false)
  const [lastSeekTime, setLastSeekTime] = useState(new Date())

  const onSeek = useCallback(
    (e: React.MouseEvent) => {
      if (!isSeeking) return
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = x / rect.width
      const newSeek = pct * length
      const now = new Date()
      if (now.getTime() - lastSeekTime.getTime() < 100) return

      setSeek(newSeek)
      setLastSeekTime(now)
    },
    [isSeeking, lastSeekTime, length, setSeek]
  )

  const onStartSeeking = useCallback(() => {
    setIsSeeking(true)
  }, [])

  const onStopSeeking = useCallback(() => {
    setIsSeeking(false)
  }, [])

  return { isSeeking, onSeek, onStartSeeking, onStopSeeking }
}
