import { useCallback, useEffect, useMemo, useState } from "react"
import { useStore } from "../store"
import {
  VideoClipElement,
  VideoElement,
  VideoElementProps,
} from "../types/videoElement"
import { ClipChange, useLatestChanges } from "./useLatestChanges"
import updateLayers from "../utils/updateLayers"

interface TimelineElementProps extends VideoElementProps {
  width: number
  left: number
  minLeftPosition?: number
  maxRightPosition?: number
  source?: string
  clipName?: string
  thumbnail?: string
  edits?: ClipChange[]
  oldElement?: TimelineElement
  content?: string
  containerElementId?: string
}
export class TimelineElement extends VideoElement {
  width: number
  left: number
  minLeftPosition?: number
  maxRightPosition?: number
  source?: string
  clipName?: string
  thumbnail?: string
  edits?: ClipChange[]
  oldElement?: TimelineElement
  // The custom element content
  content?: string
  containerElementId?: string

  constructor(props: TimelineElementProps) {
    super(props)
    this.name = props.name
    this.width = props.width
    this.left = props.left
    this.minLeftPosition = props.minLeftPosition
    this.maxRightPosition = props.maxRightPosition
    this.source = props.source
    this.clipName = props.clipName
    this.thumbnail = props.thumbnail
    this.edits = props.edits
    this.oldElement = props.oldElement
    this.content = props.content
    this.containerElementId = props.containerElementId
  }
  clone() {
    return new TimelineElement({
      id: this.id,
      name: this.name,
      start: this.start,
      end: this.end,
      nodeType: this.nodeType,
      offset: this.offset,
      type: this.type,
      outerHtml: this.outerHtml,
      layer: this.layer,
      speed: this.speed,
      width: this.width,
      left: this.left,
      minLeftPosition: this.minLeftPosition,
      maxRightPosition: this.maxRightPosition,
      source: this.source,
      clipName: this.clipName,
      thumbnail: this.thumbnail,
      edits: this.edits,
      oldElement: this.oldElement,
      content: this.content,
      containerElementId: this.containerElementId,
    })
  }
}

export const useTimelineElements = (widthPerSecond: number) => {
  const { parsedVideostrate, clipsMetadata: clipsMetadata } = useStore()
  const [layers, setLayers] = useState<TimelineElement[][]>([])
  const {
    previousVideostrate,
    movedElements,
    editedElements,
    removedElements,
  } = useLatestChanges()

  const getElementDetails = useCallback(
    (element: VideoElement) => {
      const clipMetadata = clipsMetadata.find(
        (c) => c.source === (element as VideoClipElement).source
      )
      return new TimelineElement({
        ...element,
        start: element.start,
        end: element.end,
        offset: (element as VideoClipElement).offset,
        width: (element.end - element.start) * widthPerSecond,
        left: element.start * widthPerSecond,
        thumbnail:
          element.type === "video" ? clipMetadata?.thumbnailUrl : undefined,
        clipName: element.type === "video" ? clipMetadata?.title : undefined,
        containerElementId: (element as VideoClipElement).containerElementId,
      })
    },
    [clipsMetadata, widthPerSecond]
  )

  // Precalculate position of the elements
  const elements = useMemo(() => {
    let elements =
      parsedVideostrate.all
        ?.map((element) => {
          const elementDetails = getElementDetails(element)
          elementDetails.edits = editedElements.get(element.id)
          if (movedElements.includes(element.id)) {
            const oldElement = previousVideostrate?.all.find(
              (e) => e.id === element.id
            )
            const oldElementDetails = oldElement
              ? getElementDetails(oldElement)
              : undefined

            elementDetails.oldElement = oldElementDetails
          }
          return elementDetails
        })
        .sort((a, b) => a.layer - b.layer || a.start - b.start) ?? []

    let prevElement: TimelineElement | null = null
    elements.forEach((element) => {
      if (prevElement?.layer === element.layer) {
        element.minLeftPosition = prevElement.left + prevElement.width
        prevElement.maxRightPosition = element.left - prevElement.width
      }
      prevElement = element
    })

    elements.push(
      ...removedElements.map((element) => {
        const elementDetails = getElementDetails(element)
        elementDetails.edits = editedElements.get(element.id)
        return elementDetails
      })
    )
    elements = updateLayers(elements) as TimelineElement[]
    return elements
  }, [
    editedElements,
    getElementDetails,
    movedElements,
    parsedVideostrate.all,
    previousVideostrate?.all,
    removedElements,
  ])

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
      .sort((a, b) => b - a)
      .forEach((layerIndex) => {
        newLayers.push(layersMap.get(layerIndex) as TimelineElement[])
      })
    setLayers(newLayers)
  }, [elements])

  return layers
}
