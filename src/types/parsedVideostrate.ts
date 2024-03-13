import updateLayers from "../utils/updateLayers"
import {
  VideoClipElement,
  VideoElement,
  VideoElementType,
} from "./videoElement"
import { v4 as uuid } from "uuid"

export interface VideostrateStyle {
  selector: string
  style: string
}

export class ParsedVideostrate {
  clips: VideoClipElement[] = []
  elements: VideoElement[] = []
  // Using # doesn't work with the Zustand store
  _all: VideoElement[] = []
  _length = 0
  style: VideostrateStyle[] = []
  animations: VideostrateStyle[] = []

  constructor(
    allElements: VideoElement[],
    style: VideostrateStyle[] = [],
    animations: VideostrateStyle[] = []
  ) {
    this.all = allElements
    this.style = style
    this.animations = animations
  }

  public get length() {
    return this._length
  }

  public get all() {
    return this._all
  }

  private set all(elements: VideoElement[]) {
    this._all = elements
    this.updateLayers()
    this.updateComputedProperties()
  }

  public clone() {
    return new ParsedVideostrate(
      this.all.map((c) => ({ ...c })),
      this.style.map((s) => ({ ...s })),
      this.animations.map((a) => ({ ...a }))
    )
  }

  public moveClipById(clipId: string, start: number) {
    const clip = this.all.find((c) => c.id === clipId)
    if (!clip) {
      throw new Error(`Clip with id ${clipId} not found`)
    }
    clip.end = start + (clip.end - clip.start)
    clip.start = start
    this.all = [...this.all]
  }

  public moveClipDeltaById(clipId: string, delta: number) {
    const clip = this.all.find((c) => c.id === clipId)
    if (!clip) {
      throw new Error(`Clip with id ${clipId} not found`)
    }
    clip.start += delta
    clip.end += delta
    this.all = [...this.all]
  }

  public addClip(source: string, start: number, end: number) {
    const newId = uuid()
    this.all.push({
      id: newId,
      name: "",
      start,
      end,
      nodeType: "video",
      source,
      type: "video",
      offset: 0,
      speed: 1,
      layer: 0,
    } as VideoClipElement)
    this.all = [...this.all]

    return newId
  }

  public addClipToElement(
    elementId: string,
    source: string,
    start: number,
    end: number
  ) {
    const newId = uuid()
    this.all.push({
      id: newId,
      name: "",
      start,
      end,
      nodeType: "video",
      source,
      type: "video",
      offset: 0,
      speed: 1,
      layer: 0,
      parentId: elementId,
    } as VideoClipElement)
    this.all = [...this.all]

    return newId
  }

  public deleteElementById(elementId: string) {
    this.all = this.all.filter((c) => c.id !== elementId)
  }

  public cropElementById(elementId: string, from: number, to: number) {
    const element = this.all.find((e) => e.id === elementId)
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`)
    }
    const oldLength = element.end - element.start
    element.offset = from
    element.end = to - from + element.start

    const newLength = element.end - element.start
    this.all = [...this.all]
    return newLength - oldLength
  }

  public addCustomElement(
    name: string,
    outerHtml: string,
    start: number,
    end: number,
    type: VideoElementType = "custom",
    nodeType = "div"
  ) {
    const newId = uuid()
    this.all.push({
      id: newId,
      name,
      start,
      end,
      nodeType,
      type,
      offset: 0,
      outerHtml,
      layer: 0,
      speed: 1,
    })
    this.all = [...this.all]

    return newId
  }

  public addStyle(selector: string, style: string) {
    const existing = this.style.find((s) => s.selector === selector)
    if (existing) {
      existing.style = style
    } else {
      this.style.push({ selector, style })
    }
  }

  public removeStyle(selector: string) {
    this.style = this.style.filter((s) => s.selector !== selector)
  }

  public assignClass(elementIds: string[], className: string) {
    console.log("assignClass", elementIds, className)
    this.all = this.all.map((e) => {
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

  public addAnimation(name: string, body: string) {
    const existing = this.animations.find((s) => s.selector === name)
    if (existing) {
      existing.style = body
    } else {
      this.animations.push({ selector: name, style: body })
    }
  }

  public removeAnimation(name: string) {
    this.animations = this.animations.filter((s) => s.selector !== name)
  }

  public setSpeed(elementId: string, speed: number) {
    const element = this.all.find((e) => e.id === elementId)
    if (element) {
      element.speed = speed
    } else {
      throw new Error(`Element with id ${elementId} not found`)
    }
    this.all = [...this.all]
  }

  public renameElement(elementId: string, newName: string) {
    const element = this.all.find((e) => e.id === elementId)
    if (element) {
      element.name = newName
    } else {
      throw new Error(`Element with id ${elementId} not found`)
    }
    this.all = [...this.all]
  }

  public changeLayer(elementId: string, layer: number) {
    const element = this.all.find((e) => e.id === elementId)
    if (element) {
      element.layer = layer
    } else {
      throw new Error(`Element with id ${elementId} not found`)
    }
    this.all = [...this.all]
  }

  private updateLayers() {
    this._all = updateLayers(this._all) as VideoElement[]
  }

  private updateComputedProperties() {
    // Calculate clips, elements and length
    this.clips = this._all.filter(
      (e) => e.type === "video"
    ) as VideoClipElement[]
    this.elements = this._all.filter(
      (e) => e.type !== "video"
    ) as VideoElement[]

    if (this._all.length === 0) {
      this._length = 0
    } else {
      this._length = Math.max(...this._all.map((e) => e.end))
    }
  }
}
