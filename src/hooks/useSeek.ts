import { useCallback, useState } from "react"
import { useStore } from "../store"

const TIME_BETWEEN_SEEKS = 50

const shouldSeekAgain = (lastSeekTime: Date) => {
  const now = new Date()
  return now.getTime() - lastSeekTime.getTime() >= TIME_BETWEEN_SEEKS
}

export const useSeek = (widthPerSecond: number) => {
  const { playbackState, setSeek, playing, setPlaying } = useStore()
  const [isSeeking, setIsSeeking] = useState(false)
  const [lastPos, setLastPos] = useState(0)
  const [startPlaybackTime, setStartPlaybackTime] = useState(0)
  const [shouldPlayAfterSeek, setShouldPlayAfterSeek] = useState(false)
  const [lastSeekTime, setLastSeekTime] = useState(new Date())
  const [seekTimeout, setSeekTimeout] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)

  const updateSeek = useCallback(() => {
    console.log("update seek", lastPos)
    setLastSeekTime(new Date())
    const startPos = startPlaybackTime * widthPerSecond
    const shiftWidth = lastPos - startPos
    const shiftDuration = shiftWidth / widthPerSecond
    setSeek(startPlaybackTime + shiftDuration)
  }, [setSeek, startPlaybackTime, lastPos, widthPerSecond])

  const onSeek = useCallback(
    (e: React.MouseEvent) => {
      if (isSeeking) {
        const target = e.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        console.log("seek rect", rect.left)
        const posX = e.clientX + target.scrollLeft - rect.left
        setLastPos(posX)
        clearTimeout(seekTimeout)
        if (shouldSeekAgain(lastSeekTime)) {
          updateSeek()
          console.log("on seek", posX)
        } else {
          const newTimeout = setTimeout(updateSeek, 100)
          setSeekTimeout(newTimeout)
        }
      }
    },
    [isSeeking, lastSeekTime, seekTimeout, updateSeek]
  )

  const onStartSeeking = useCallback(() => {
    setStartPlaybackTime(playbackState.time)
    setIsSeeking(true)
    if (playing) {
      setShouldPlayAfterSeek(true)
      setPlaying(false)
    }
  }, [playbackState.time, playing, setPlaying])

  const onStopSeeking = useCallback(() => {
    if (isSeeking) {
      setIsSeeking(false)
      console.log("onStop seek", lastPos)
      clearTimeout(seekTimeout)
      updateSeek()
      if (shouldPlayAfterSeek) {
        setPlaying(true)
        setShouldPlayAfterSeek(false)
      }
    }
  }, [
    isSeeking,
    lastPos,
    seekTimeout,
    setPlaying,
    shouldPlayAfterSeek,
    updateSeek,
  ])

  return { isSeeking, onSeek, onStartSeeking, onStopSeeking }
}
