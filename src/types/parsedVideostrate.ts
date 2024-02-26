import { VideoClipElement, VideoElement } from "./videoElement"
import { v4 as uuid } from "uuid"

export interface VideostrateStyle {
  selector: string
  style: string
}

export class ParsedVideostrate {
  clips: VideoClipElement[] = []
  elements: VideoElement[] = []
  all: VideoElement[] = []
  length = 0
  style: VideostrateStyle[] = []

  constructor(
    clips: VideoClipElement[],
    elements: VideoElement[],
    style: VideostrateStyle[] = []
  ) {
    this.clips = clips
    this.elements = elements
    this.style = style

    this.calculateAll()
  }

  public clone() {
    return new ParsedVideostrate(
      this.clips.map((c) => ({ ...c })),
      this.elements.map((e) => ({ ...e })),
      this.style
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

  public addCustomElement(outerHtml: string, start: number, end: number) {
    const newId = uuid()
    this.elements.push({
      id: newId,
      start,
      end,
      nodeType: "div",
      type: "custom",
      offset: 0,
      outerHtml,
    })
    this.elements = [...this.elements]
    this.calculateAll()

    return newId
  }

  public addStyle(selector: string, style: string) {
    const existing = this.style.find((s) => s.selector === selector)
    if (existing) {
      existing.style += style
    } else {
      this.style.push({ selector, style })
    }
  }

  public removeStyle(selector: string) {
    this.style = this.style.filter((s) => s.selector !== selector)
  }

  public assignClass(elementIds: string[], className: string) {
    console.log("assignClass", elementIds, className)
    this.elements = this.assignClassToElements(
      this.elements,
      elementIds,
      className
    )
    this.clips = this.assignClassToElements(this.clips, elementIds, className)

    this.calculateAll()
  }

  private assignClassToElements<T extends VideoElement>(
    elements: T[],
    elementIds: string[],
    className: string
  ) {
    return elements.map((e) => {
      if (elementIds.includes(e.id)) {
        const parser = new DOMParser()
        const document = parser.parseFromString(e.outerHtml ?? "", "text/html")
        const htmlElement = document.body.firstChild as HTMLElement
        if (htmlElement) {
          htmlElement.classList.add(className)
          e.outerHtml = htmlElement.outerHTML
        }
      }
      return e
    })
  }

  private calculateAll() {
    this.all = this.elements.concat(this.clips)
    this.all.sort((a, b) => a.start - b.start)
    this.length = Math.max(...this.all.map((e) => e.end))
  }
}
