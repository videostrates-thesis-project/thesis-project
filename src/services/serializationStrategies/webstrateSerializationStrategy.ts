import { VideoClipElement, VideoElement } from "../../types/videoElement"
import { SerializationStrategyBase } from "./serializationStrategyBase"

export class WebstrateSerializationStrategy extends SerializationStrategyBase {
  protected serializeElement(element: VideoElement): string {
    if (element.nodeType === "video") {
      const clip = element as VideoClipElement
      const parser = new DOMParser()
      const document = parser.parseFromString(
        element.outerHtml ?? "",
        "text/html"
      )
      const htmlElement = document.body.firstChild as HTMLElement
      if (!htmlElement.classList.contains("composited")) {
        htmlElement.classList.add("composited")
      }

      return `<video id="${clip.id}" class="${htmlElement.classList.toString()}" data-start="${clip.start}" data-end="${clip.end}" data-offset="${clip.offset ?? 0}" clip-start="${clip.offset ?? 0}" clip-end="${clip.end - clip.start + clip.offset}" data-speed="${isNaN(clip.speed) ? 1 : clip.speed}"><source src="${clip.source}" /></video>`
    } else {
      if (!element.outerHtml) throw new Error("Missing  outerHtml")

      const parser = new DOMParser()
      const document = parser.parseFromString(element.outerHtml, "text/html")
      const htmlElement = document.body.firstChild as HTMLElement
      if (!htmlElement) throw new Error("Invalid outerHtml")

      console.log("Serializing html element", htmlElement)
      if (!htmlElement.classList.contains("composited")) {
        htmlElement.classList.add("composited")
      }
      htmlElement.setAttribute("id", element.id)
      htmlElement.setAttribute("data-start", element.start.toString())
      htmlElement.setAttribute("data-end", element.end.toString())
      htmlElement.setAttribute("data-offset", (element.offset ?? 0).toString())
      htmlElement.setAttribute("clip-start", (element.offset ?? 0).toString())
      htmlElement.setAttribute(
        "clip-end",
        (element.end - element.start + element.offset).toString()
      )
      htmlElement.setAttribute(
        "data-speed",
        (isNaN(element.speed) ? 1 : element.speed).toString()
      )
      return htmlElement.outerHTML
    }
  }
}
