import { useStore } from "../../store"
import {
  CustomElement,
  VideoClipElement,
  VideoElement,
} from "../../types/videoElement"
import { SerializationStrategyBase } from "./serializationStrategyBase"

export class ChatGptSerializationStrategy extends SerializationStrategyBase {
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

      const availableClip = useStore
        .getState()
        .availableClips.find((c) => c.source === clip.source)
      return `<video id="${clip.id}" clip-name="${clip.name}" class="${htmlElement.classList.toString()}" absolute-start="${clip.start}" absolute-end="${clip.end}" relative-start="${clip.offset ?? 0}" relative-end="${clip.end - clip.start + clip.offset}" clip-name="${availableClip?.title}"><source src="${clip.source}" /></video>`
    } else {
      if (element.outerHtml) {
        const parser = new DOMParser()
        const document = parser.parseFromString(element.outerHtml, "text/html")
        const htmlElement = document.body.firstChild as HTMLElement
        if (htmlElement) {
          if (!htmlElement.classList.contains("composited")) {
            htmlElement.classList.add("composited")
          }
          htmlElement.setAttribute("id", element.id)
          htmlElement.setAttribute("custom-element-name", element.name)
          htmlElement.setAttribute("absolute-start", element.start.toString())
          htmlElement.setAttribute("absolute-end", element.end.toString())
          htmlElement.setAttribute(
            "relative-start",
            (element.offset ?? 0).toString()
          )
          htmlElement.setAttribute(
            "clip-end",
            (element.end - element.start + element.offset).toString()
          )
          return htmlElement.outerHTML
        }
      }

      const custom = element as CustomElement
      return `<${element.nodeType} id="${element.id}" class="composited" absolute-start="${element.start}" absolute-end="${element.end}" relative-start="${element.offset ?? 0}" clip-end="${element.end - element.start + element.offset}">${custom.content}</${element.nodeType}>`
    }
  }
}
