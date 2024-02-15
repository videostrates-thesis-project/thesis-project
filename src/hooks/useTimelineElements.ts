import { useMemo } from "react"
import { useStore } from "../store"
import { VideoClipElement, VideoElement } from "../types/videoElement"

export interface TimelineElement extends VideoElement {
  width: number
  left: number
  clipName: string | undefined
}

export const useTimelineElements = (viewStart: number, viewEnd: number) => {
  const { parsedVideostrate, availableClips } = useStore()

  const elements = useMemo(() => {
    const viewLength = viewEnd - viewStart
    return parsedVideostrate.all.map((clip) => {
      return {
        ...clip,
        width: ((clip.end - clip.start) / viewLength) * 100,
        left: ((clip.start - viewStart) / viewLength) * 100,
        clipName:
          clip.type === "video" &&
          availableClips.find(
            (c) => c.source === (clip as VideoClipElement).source
          )?.name,
      } as TimelineElement
    })
  }, [availableClips, parsedVideostrate.all, viewEnd, viewStart])

  return elements
}
