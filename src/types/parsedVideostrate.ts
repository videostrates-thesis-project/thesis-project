import { VideoClipElement, VideoElement } from "./videoElement"
import { v4 as uuid } from "uuid"

export class ParsedVideostrate {
  clips: VideoClipElement[] = []
  elements: VideoElement[] = []
  all: VideoElement[] = []

  constructor(clips: VideoClipElement[], elements: VideoElement[]) {
    this.clips = clips
    this.elements = elements
    this.calculateAll()
  }

  public clone() {
    return new ParsedVideostrate(
      this.clips.map((c) => ({ ...c })),
      this.elements.map((e) => ({ ...e }))
    )
  }

  public moveClipById(clipId: string, start: number) {
    const clip = this.clips.find((c) => c.id === clipId)
    if (!clip) {
      throw new Error(`Clip with id ${clipId} not found`)
    }
    clip.end = start + (clip.end - clip.start)
    clip.start = start
    this.clips = [...this.clips]
    this.calculateAll()
  }

  public moveClipDeltaById(clipId: string, delta: number) {
    const clip = this.clips.find((c) => c.id === clipId)
    if (!clip) {
      throw new Error(`Clip with id ${clipId} not found`)
    }
    clip.start += delta
    clip.end += delta
    this.clips = [...this.clips]
    this.calculateAll()
  }

  public addClip(source: string, start: number, end: number) {
    const newId = uuid()
    this.clips.push({
      id: newId,
      start,
      end,
      nodeType: "video",
      source,
      type: "video",
      offset: 0,
    })
    this.clips = [...this.clips]
    this.calculateAll()

    return newId
  }

  public deleteElementById(elementId: string) {
    this.clips = this.clips.filter((c) => c.id !== elementId)
    this.elements = this.elements.filter((e) => e.id !== elementId)
    this.clips = [...this.clips]
    this.elements = [...this.elements]
    this.calculateAll()
  }

  public cropElementById(elementId: string, from: number, to: number) {
    const element = this.all.find((e) => e.id === elementId)
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`)
    }
    const oldLength = element.end - element.start
    element.offset = from
    element.end = to - from + element.start
    this.calculateAll()

    const newLength = element.end - element.start
    return newLength - oldLength
  }

  private calculateAll() {
    this.all = this.elements.concat(this.clips)
    this.all.sort((a, b) => a.start - b.start)
  }
}
