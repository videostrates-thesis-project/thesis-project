import {
  CustomElement,
  VideoClipElement,
  VideoElement,
} from "../../types/videoElement"
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

      return `<video id="${clip.id}" clip-name="${clip.name}" class="${htmlElement.classList.toString()}" data-start="${clip.start}" data-end="${clip.end}" data-offset="${clip.offset ?? 0}" clip-start="${clip.offset ?? 0}" clip-end="${clip.end - clip.start + clip.offset}"><source src="${clip.source}" /></video>`
    } else {
      if (element.outerHtml) {
        const parser = new DOMParser()
        const document = parser.parseFromString(element.outerHtml, "text/html")
        const htmlElement = document.body.firstChild as HTMLElement

        if (htmlElement) {
          console.log("Serializing html element", htmlElement)
          if (!htmlElement.classList.contains("composited")) {
            htmlElement.classList.add("composited")
          }
          htmlElement.setAttribute("id", element.id)
          htmlElement.setAttribute("custom-element-name", element.name)
          htmlElement.setAttribute("data-start", element.start.toString())
          htmlElement.setAttribute("data-end", element.end.toString())
          htmlElement.setAttribute(
            "data-offset",
            (element.offset ?? 0).toString()
          )
          htmlElement.setAttribute(
            "clip-start",
            (element.offset ?? 0).toString()
          )
          htmlElement.setAttribute(
            "clip-end",
            (element.end - element.start + element.offset).toString()
          )
          return htmlElement.outerHTML
        }
      }

      console.log("Serializing custom element", element)
      const custom = element as CustomElement
      return `<${element.nodeType} id="${element.id}" class="composited" data-start="${element.start}" data-end="${element.end}" data-offset="${element.offset ?? 0}" clip-start="${element.offset ?? 0}" clip-end="${element.end - element.start + element.offset}">${custom.content}</${element.nodeType}>`
    }
  }
}
