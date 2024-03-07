import { useCallback, useEffect, useMemo, useState } from "react"
import { useStore } from "../store"
import { VideoClipElement, VideoElement } from "../types/videoElement"
import { usePreviousVideostrate } from "./usePreviousVideostrate"

export interface TimelineElement extends VideoElement {
  width: number
  left: number
  clipName: string | undefined
  thumbnail: string | undefined
  oldElement: TimelineElement | undefined
}

export const useTimelineElements = (widthPerSecond: number) => {
  const { parsedVideostrate, availableClips } = useStore()
  const [layers, setLayers] = useState<TimelineElement[][]>([])
  const { previousVideostrate } = usePreviousVideostrate()

  const getElementDetails = useCallback(
    (element: VideoElement) => {
      const clipMetadata = availableClips.find(
        (c) => c.source === (element as VideoClipElement).source
      )
      return {
        ...element,
        width: (element.end - element.start) * widthPerSecond,
        left: element.start * widthPerSecond,
        thumbnail: element.type === "video" && clipMetadata?.thumbnailUrl,
        clipName: element.type === "video" && clipMetadata?.title,
      } as TimelineElement
    },
    [availableClips, widthPerSecond]
  )

  // Precalculate position of the elements
  const elements = useMemo(() => {
    return parsedVideostrate.all.map((element) => {
      const elementDetails = getElementDetails(element)
      const oldElement = previousVideostrate?.all.find(
        (e) => e.id === element.id
      )
      const oldElementDetails = oldElement
        ? getElementDetails(oldElement)
        : undefined

      const isChanged =
        oldElement &&
        (oldElementDetails?.left !== elementDetails.left ||
          oldElementDetails?.width !== elementDetails.width)
      return {
        ...getElementDetails(element),
        oldElement: isChanged ? oldElementDetails : undefined,
      } as TimelineElement
    })
  }, [getElementDetails, parsedVideostrate.all, previousVideostrate?.all])

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
