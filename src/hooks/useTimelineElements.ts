import { useEffect, useMemo, useState } from "react"
import { useStore } from "../store"
import { VideoClipElement, VideoElement } from "../types/videoElement"

export interface TimelineElement extends VideoElement {
  width: number
  left: number
  clipName: string | undefined
  thumbnail: string | undefined
}

export const useTimelineElements = (widthPerSecond: number) => {
  const { parsedVideostrate, availableClips } = useStore()
  const [layers, setLayers] = useState<TimelineElement[][]>([])

  // Precalculate position of the elements
  const elements = useMemo(() => {
    return parsedVideostrate.all.map((clip) => {
      const clipDetails = availableClips.find(
        (c) => c.source === (clip as VideoClipElement).source
      )
      return {
        ...clip,
        width: (clip.end - clip.start) * widthPerSecond,
        left: clip.start * widthPerSecond,
        thumbnail: clip.type === "video" && clipDetails?.thumbnailUrl,
        clipName: clip.type === "video" && clipDetails?.title,
      } as TimelineElement
    })
  }, [availableClips, parsedVideostrate.all, widthPerSecond])

  // Group elements by layer
  useEffect(() => {
    const layersMap = new Map<number, TimelineElement[]>()
    const layersIndexes = new Set<number>()
    elements.forEach((clip) => {
      const layerIndex = clip.layer
      if (!layersMap.has(layerIndex)) {
        layersMap.set(layerIndex, [])
        layersIndexes.add(layerIndex)
      }
      layersMap.get(layerIndex)?.push(clip)
    })
    const newLayers: TimelineElement[][] = []
    // Iterate through layers in ascending order
    Array.from(layersIndexes)
      .sort()
      .forEach((layerIndex) => {
        newLayers.push(layersMap.get(layerIndex) as TimelineElement[])
      })
    console.log("newLayers", newLayers)
    setLayers(newLayers.reverse())
  }, [elements])

  return layers
}
