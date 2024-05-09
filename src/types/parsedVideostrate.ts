import updateLayers from "../utils/updateLayers"
import { Image } from "./image"
import VideoClip from "./videoClip"
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

  public equals(other: ParsedVideostrate) {
    if (this.all.length !== other.all.length) {
      return false
    }

    for (let i = 0; i < this.all.length; i++) {
      if (!this.all[i].equals(other.all[i])) {
        return false
      }
    }

    return true
  }

  public static generateElementId() {
    let id = uuid()
    id = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + id.slice(1)
    return id
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
    const clips = this.all.filter(
      (c) =>
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

  public addClip(clip: VideoClip, start: number, end: number) {
    const newId = ParsedVideostrate.generateElementId()
    const layer = Math.max(...this.all.map((e) => e.layer)) + 1
    this.all.push(
      new VideoClipElement({
        id: newId,
        name: clip.title,
        start,
        end,
        nodeType: "video",
        source: clip.source,
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
      const document = parser.parseFromString(
        customElement.content,
        "text/html"
      )

      return document.body.querySelector(
        `[embedded-clip-container="${elementId}"]`
      )
    }) as CustomElement

    if (!containerElement) {
      throw new Error(`Container element with id ${elementId} not found`)
    }

    return containerElement.id
  }

  public addClipToElement(
    elementId: string,
    clip: VideoClip,
    start: number,
    end: number
  ) {
    const newId = ParsedVideostrate.generateElementId()

    const containerElementId = this.findContainerElement(elementId)

    this.all.push(
      new VideoClipElement({
        id: newId,
        name: clip.title,
        start,
        end,
        nodeType: "video",
        source: clip.source,
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
    this.all = this.all.filter(
      (c) =>
        c.id !== elementId &&
        (c as VideoClipElement).containerElementId !== elementId
    )
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

  private static cleanTree = (element: HTMLElement) => {
    if (!element) return element
    if (element?.childNodes) {
      element.childNodes.forEach(
        (childNode) => (childNode = this.cleanTree(childNode as HTMLElement))
      )
    }

    if (
      element.className &&
      element.className.startsWith('\\"') &&
      element.className.endsWith('\\"')
    ) {
      element.className = element.className.slice(2, -2)
    }

    return element
  }

  private parseCustomElementContent(content: string): HTMLElement {
    const parser = new DOMParser()
    const document = parser.parseFromString(content, "text/html")

    // if the content is not a valid html or has multiple root elements, wrap it in a div
    if (document.body.children.length !== 1) {
      const wrapper = document.createElement("div")
      wrapper.innerHTML = content
      return wrapper
    }

    let htmlElement = document.body.firstChild as HTMLElement
    htmlElement = ParsedVideostrate.cleanTree(htmlElement)
    return htmlElement
  }

  public addCustomElement(
    name: string,
    content: string,
    start: number,
    end: number,
    type: VideoElementType = "custom",
    nodeType = "div"
  ) {
    const htmlElement = this.parseCustomElementContent(content)
    const parent = htmlElement?.parentNode
    const wrapper = document.createElement("div")
    parent?.replaceChild(wrapper, htmlElement)
    if (htmlElement) wrapper.appendChild(htmlElement)

    const newId = ParsedVideostrate.generateElementId()
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
        content: htmlElement.outerHTML,
        outerHtml: wrapper.outerHTML,
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
      const htmlElement = this.parseCustomElementContent(content)
      customElement.content = htmlElement.outerHTML
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

  public parseStyle(style: string): Record<string, string> {
    const styleArray = style
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    return styleArray.reduce(
      (acc, val) => {
        const [key, value] = val.split(":").map((s) => s.trim())
        acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )
  }

  public updateStyle(selector: string, style: string) {
    const existing = this.style.find((s) => s.selector === selector)
    if (existing) {
      const existingStyleMap = this.parseStyle(existing.style)
      const newStyleMap = this.parseStyle(style)
      const mergedStyle = { ...existingStyleMap, ...newStyleMap }

      let mergedStyleString = Object.entries(mergedStyle)
        .map(([key, value]) => `${key}:${value}`)
        .join(";")

      if (mergedStyleString.length !== 0) {
        mergedStyleString += ";"
      }

      existing.style = mergedStyleString
    } else {
      this.style.push({ selector, style })
    }
  }

  public removeStyle(selector: string) {
    this.style = this.style.filter((s) => s.selector !== selector)
  }

  private assignClassToElement(element: CustomElement, className: string) {
    const parser = new DOMParser()
    const document = parser.parseFromString(element.content ?? "", "text/html")
    const htmlElement = document.body.firstChild as HTMLElement
    if (htmlElement) {
      htmlElement.classList.add(className)
      element.content = htmlElement.outerHTML
    }
  }

  private assignClassToClip(clip: VideoClipElement, className: string) {
    clip.className = clip.className
      ? `${clip.className} ${className}`
      : className
  }

  public assignClass(elementIds: string[], className: string) {
    this.all = this.all.map((e) => {
      if (elementIds.includes(e.id)) {
        if (e.type === "video") {
          this.assignClassToClip(e as VideoClipElement, className)
        } else if (e.type === "custom") {
          this.assignClassToElement(e as CustomElement, className)
        } else {
          throw new Error(`Element with id ${e.id} has an invalid type`)
        }
      }
      return e
    })

    this.all = [...this.all]
  }

  private removeClassFromElement(element: CustomElement, className: string) {
    const parser = new DOMParser()
    const document = parser.parseFromString(element.content ?? "", "text/html")
    const htmlElement = document.body.firstChild as HTMLElement
    if (htmlElement) {
      htmlElement.classList.remove(className)
      element.content = htmlElement.outerHTML
    }
  }

  private removeClassFromClip(clip: VideoClipElement, className: string) {
    clip.className = clip.className?.replace(className, "")
  }

  public removeClass(elementIds: string[], className: string) {
    this.all = this.all.map((e) => {
      if (elementIds.includes(e.id)) {
        if (e.type === "video") {
          this.removeClassFromClip(e as VideoClipElement, className)
        } else if (e.type === "custom") {
          this.removeClassFromElement(e as CustomElement, className)
        } else {
          throw new Error(`Element with id ${e.id} has an invalid type`)
        }
      }
      return e
    })

    this.all = [...this.all]
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
      const length = element.end - element.start
      const relativeSpeed = speed / element.speed
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

  private isColliding(elementId: string, layer: number) {
    const element = this.getElementById(elementId)
    const timeStart = element!.start
    const timeEnd = element!.end
    const elements = this.all.filter((element) => element.layer === layer)
    for (const element of elements) {
      if (element.start < timeEnd && element.end > timeStart) {
        return true
      }
    }
    return false
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

  public moveLayerUp(elementId: string) {
    const element = this.getElementById(elementId)
    if (!element) return
    const currentLayer = element.layer
    const targetLayer = currentLayer + 1
    // Return if it's alone on the highest layer
    if (!this.all.some((e) => e.layer >= currentLayer && e.id !== elementId))
      return
    const collision = this.isColliding(elementId, targetLayer)
    if (collision) {
      // Move everything from a target layer to a lower layer
      this.all
        .filter((e) => e.layer === targetLayer)
        .forEach((e) => (e.layer = e.layer - 1))
      // Move other elements from the current and lower layers to a lower layer, to make the space for elements moved down
      this.all
        .filter((e) => e.layer <= currentLayer)
        .forEach((e) => (e.layer = e.layer - 1))
    }

    element.layer = targetLayer
    this.all = [...this._all]
  }

  public moveLayerDown(elementId: string) {
    const element = this.getElementById(elementId)
    if (!element) return
    const currentLayer = element.layer
    const targetLayer = currentLayer - 1
    // Return if it's alone on the lowest layer
    if (!this.all.some((e) => e.layer <= currentLayer && e.id !== elementId))
      return
    const collision = this.isColliding(elementId, targetLayer)
    if (collision) {
      // Move everything from a target layer to a higher layer
      this.all
        .filter((e) => e.layer === targetLayer)
        .forEach((e) => (e.layer = e.layer + 1))
      // Move other elements from the current and higher layers to a higher layer, to make the space for elements moved u
      this.all
        .filter((e) => e.layer >= currentLayer)
        .forEach((e) => (e.layer = e.layer + 1))
    }
    element.layer = targetLayer
    this.all = [...this._all]
  }

  private updateComputedProperties() {
    // Calculate clips, elements and length
    this.clips = this._all.filter(
      (e): e is VideoClipElement => e.type === "video"
    )
    this.elements = this._all.filter((e) => e.type !== "video")

    this._all = updateLayers(this._all)

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
