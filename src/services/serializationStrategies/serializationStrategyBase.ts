import { ParsedVideostrate } from "../../types/parsedVideostrate"
import { VideoClipElement, VideoElement } from "../../types/videoElement"

export abstract class SerializationStrategyBase {
  public serializeHtml(parsedVideostrate: ParsedVideostrate): string {
    const serializedElements = parsedVideostrate.all
      .filter((e) => {
        return e.type !== "video" || !(e as VideoClipElement).parentId
      })
      .filter((e) => e.type !== "subtitle")
      .map((element) => {
        return this.serializeElement(element)
      })
    const html = serializedElements.join("\n")

    const parser = new DOMParser()
    const document = parser.parseFromString(html, "text/html")

    // Create a new div for the subtitle elements
    const subtitles = document.createElement("div")
    subtitles.classList.add("composited", "subtitles")
    document.body.appendChild(subtitles)

    // Iterate through all subtitles and add it as a child of that div
    parsedVideostrate.all
      .filter((e) => e.type === "subtitle")
      .forEach((element) => {
        const html = this.serializeElement(element)
        subtitles.innerHTML += html
      })

    parsedVideostrate.all
      .filter((e) => e.type === "video" && (e as VideoClipElement).parentId)
      .forEach((element) => {
        this.addElementToHtml(element, document)
      })

    return document.body.innerHTML
  }

  public serializeStyle(parsedVideostrate: ParsedVideostrate): string {
    return parsedVideostrate.style
      .map((style) => {
        return `${style.selector} { ${style.style} }`
      })
      .concat(
        parsedVideostrate.animations.map((style) => {
          return `@keyframes ${style.selector} { ${style.style} }`
        })
      )
      .join("\n")
  }

  protected static removeElementsWithClipNameAttribute = (doc: HTMLElement) => {
    const elementsToRemove = doc.querySelectorAll("[clip-name]")
    elementsToRemove.forEach((element) => {
      element.remove()
    })

    // Recursively process child nodes
    doc.childNodes.forEach((childNode) => {
      if (childNode.nodeType === Node.ELEMENT_NODE) {
        this.removeElementsWithClipNameAttribute(childNode as HTMLElement)
      }
    })
  }

  abstract serializeElement(element: VideoElement): string

  protected abstract addElementToHtml(
    element: VideoElement,
    document: Document
  ): void
}
