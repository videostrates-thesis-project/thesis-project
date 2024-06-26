import { ParsedVideostrate } from "../../types/parsedVideostrate"
import { VideoClipElement, VideoElement } from "../../types/videoElement"

export abstract class SerializationStrategyBase {
  public serializeHtml(parsedVideostrate: ParsedVideostrate): string {
    const serializedElements = parsedVideostrate.all
      .filter((e) => {
        return e.type !== "video" || !(e as VideoClipElement).parentId
      })
      .map((element) => {
        return this.serializeElement(element)
      })
    const html = serializedElements.join("\n")

    const parser = new DOMParser()
    const document = parser.parseFromString(html, "text/html")

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
        return `${style.selector.replaceAll("&gt;", ">").replaceAll("&amp;gt;", "&")} { ${style.style} }`
      })
      .concat(
        parsedVideostrate.animations.map((style) => {
          return `@keyframes ${style.selector.replaceAll("&gt;", ">").replaceAll("&amp;gt;", "&")} { ${style.style} }`
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
