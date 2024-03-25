import { useStore } from "../store"
import updateLayers from "../utils/updateLayers"
import { Image } from "./image"
import {
  CustomElement,
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
  images: Image[] = []
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
    this.updateImages()
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

  public getElementById(id: string) {
    return this.all.find((e) => e.id === id)
  }

  public clone() {
    return new ParsedVideostrate(
      this.all.map((c) => c.clone()),
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

  public repositionClipById(clipId: string, start: number, end: number) {
    const clip = this.all.find((c) => c.id === clipId)
    if (!clip) {
      throw new Error(`Clip with id ${clipId} not found`)
    }
    clip.start = start
    clip.end = end
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

  public moveEmbeddedClips(elementId: string, delta: number) {
    const clips = this.all.filter((c) => 
      c.type === "video" && 
      (c as VideoClipElement).containerElementId === elementId
    ) as VideoClipElement[]

    clips.forEach((c) => {
      c.start += delta
      c.end += delta
    })

    this.all = [...this.all]
  }

  /**
   * Move the clip with the given id by the given delta, and also move all the embedded clips with it.
   * @param clipId Id of the clip to move
   * @param delta Time delta to move the clip by in seconds
   */
  public moveClipWithEmbeddedDeltaById(clipId: string, delta: number) {
    const clip = this.all.find((c) => c.id === clipId)
    if (!clip) {
      throw new Error(`Clip with id ${clipId} not found`)
    }
    clip.start += delta
    clip.end += delta

    if (clip.type === "custom") {
      this.moveEmbeddedClips(clipId, delta)
    }

    this.all = [...this.all]
  }

  public addClip(source: string, start: number, end: number) {
    const newId = uuid()
    const layer =
      Math.max(
        ...this.all.filter((e) => e.type === "video").map((e) => e.layer)
      ) + 1
    this.all.push(
      new VideoClipElement({
        id: newId,
        name: "",
        start,
        end,
        nodeType: "video",
        source,
        type: "video",
        offset: 0,
        speed: 1,
        layer,
      })
    )
    this.all = [...this.all]

    return newId
  }

  public findContainerElement(elementId: string | undefined) {
    if (!elementId) {
      return undefined
    }

    const containerElement = this.all.find((e) => {
      if (e.type !== "custom") {
        return false
      }
      const customElement = e as CustomElement
      const parser = new DOMParser()
      const document = parser.parseFromString(customElement.content, "text/html")
      const htmlElement = document.body.firstChild as HTMLElement
      if (!htmlElement) {
        return false
      }
      return htmlElement.querySelector(`#${elementId}`)
    }) as CustomElement

    return containerElement.id
  }

  public addClipToElement(
    elementId: string,
    source: string,
    start: number,
    end: number
  ) {
    const newId = uuid()

    const containerElementId = this.findContainerElement(elementId)

    this.all.push(
      new VideoClipElement({
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
        containerElementId: containerElementId,
      })
    )
    this.all = [...this.all]

    return newId
  }

  public deleteElementById(elementId: string) {
    if (useStore.getState().selectedClipId === elementId) {
      useStore.getState().setSelectedClipId(null)
    }
    this.all = this.all.filter((c) => c.id !== elementId && (c as VideoClipElement).containerElementId !== elementId)
    this.updateImages()
  }

  public cropElementById(elementId: string, from: number, to: number) {
    const element = this.all.find((e) => e.id === elementId)
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`)
    }
    console.log(
      "Old start ",
      element.start,
      " Old offset ",
      element.offset,
      "Old end ",
      element.end
    )
    const oldLength = element.end - element.start
    element.offset = from
    element.end = to - from + element.start

    if (element.type === "custom") {
      if (element.offset != 0) {
        element.start += element.offset
        element.end += element.offset
        element.offset = 0
      }
    }

    const newLength = element.end - element.start
    this.all = [...this.all]
    return newLength - oldLength
  }

  public addCustomElement(
    name: string,
    content: string,
    start: number,
    end: number,
    type: VideoElementType = "custom",
    nodeType = "div"
  ) {
    const newId = uuid()
    const layer = Math.max(...this.all.map((e) => e.layer)) + 1
    this.all.push(
      new CustomElement({
        id: newId,
        name,
        start,
        end,
        nodeType,
        type,
        offset: 0,
        content,
        outerHtml: content,
        layer,
        speed: 1,
      })
    )
    this.all = [...this.all]
    this.updateImages()
    return newId
  }

  public updateCustomElement(id: string, content: string) {
    const element = this.all.find((e) => e.id === id)
    if (element) {
      const customElement = element as CustomElement
      customElement.content = content
    } else {
      throw new Error(`Element with id ${id} not found`)
    }
    this.all = [...this.all]

    return id
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
        const htmlElement = document.body.firstChild?.firstChild as HTMLElement
        if (htmlElement) {
          htmlElement.classList.add(className)
          e.outerHtml = htmlElement.parentElement?.outerHTML
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
      let length = (element.end - element.start)
      let relativeSpeed = speed / element.speed
      element.end = element.start + length / relativeSpeed

      if (element.type === "video") {
        element.speed = speed
      } else {
        element.speed = 1
      }
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
    console.log("updateLayers", this._all)
    this._all = updateLayers(this._all)
  }

  private updateComputedProperties() {
    // Calculate clips, elements and length
    this.clips = this._all.filter(
      (e): e is VideoClipElement => e.type === "video"
    )
    this.elements = this._all.filter((e) => e.type !== "video")

    if (this._all.length === 0) {
      this._length = 0
    } else {
      this._length = Math.max(...this._all.map((e) => e.end))
    }
  }

  private updateImages() {
    this.images = this.all
      .filter((e) => e.type !== "video")
      .map((e) => {
        const parser = new DOMParser()
        const document = parser.parseFromString(e.outerHtml ?? "", "text/html")
        const htmlElement = document.body.firstChild as HTMLElement
        if (htmlElement) {
          const images = htmlElement.querySelectorAll("img")
          return Array.from(images).map((img) => ({
            url: img.src,
            title: img.alt,
          }))
        }
      })
      .reduce((acc: Image[], val) => (val ? acc.concat(val) : acc), [])
  }
}
