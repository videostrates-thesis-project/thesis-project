import { useStore } from "../../store"
import { VideoClipElement, VideoElement } from "../../types/videoElement"
import { SerializationStrategyBase } from "./serializationStrategyBase"

export class ChatGptSerializationStrategy extends SerializationStrategyBase {
  protected addElementToHtml(element: VideoElement, document: Document): void {
    const clip = element as VideoClipElement

    const availableClip = useStore
      .getState()
      .availableClips.find((c) => c.source === clip.source)
    const html = `<video id="${clip.id}" clip-name="${availableClip?.title}" class="${clip.className?.replace("composited", "") ?? ""}" layer="${clip.layer}" absolute-start="${clip.start}" absolute-end="${clip.end}" relative-start="${clip.offset ?? 0}" relative-end="${clip.end - clip.start + clip.offset}"  playback-speed="${isNaN(clip.speed) ? 1 : clip.speed}"><source src="${clip.source}" /></video>`

    // Find the parent element
    const parent = document.getElementById(clip.parentId ?? "root")
    if (!parent) throw new Error("Parent not found")

    // Add the element
    parent.innerHTML += html
  }

  public serializeElement(element: VideoElement): string {
    if (element.type === "video") {
      const clip = element as VideoClipElement

      const availableClip = useStore
        .getState()
        .availableClips.find((c) => c.source === clip.source)
      return `<video id="${clip.id}" clip-name="${availableClip?.title}" class="${clip.className?.replace("composited", "") ?? ""}" layer="${clip.layer}" absolute-start="${clip.start}" absolute-end="${clip.end}" relative-start="${clip.offset ?? 0}" relative-end="${clip.end - clip.start + clip.offset}"  playback-speed="${isNaN(clip.speed) ? 1 : clip.speed}"><source src="${clip.source}" /></video>`
    } else {
      if (!element.outerHtml) throw new Error("Missing outerHtml")

      const parser = new DOMParser()
      const document = parser.parseFromString(element.outerHtml, "text/html")
      const htmlElement = document.body.firstChild as HTMLElement
      if (!htmlElement) throw new Error("Invalid outerHtml")

      if (htmlElement.classList.contains("composited")) {
        htmlElement.classList.remove("composited")
      }

      let attributesToRemove = ["data-offset", "data-speed", "data-start", "data-end", "style", "relative-start", "relative-end"]
      attributesToRemove.forEach((attr) => {
        htmlElement.removeAttribute(attr)
      })

      htmlElement.setAttribute("id", element.id)
      htmlElement.setAttribute("custom-element-name", element.name)
      htmlElement.setAttribute("absolute-start", element.start.toString())
      htmlElement.setAttribute("absolute-end", element.end.toString())
      htmlElement.setAttribute(
        "relative-start",
        "0"
      )
      htmlElement.setAttribute(
        "relative-end",
        (element.end - element.start).toString()
      )
      htmlElement.setAttribute("layer", element.layer.toString())
      // htmlElement.setAttribute(
      //   "data-speed",
      //   (isNaN(element.speed) ? 1 : element.speed).toString()
      // )

      SerializationStrategyBase.removeElementsWithClipNameAttribute(htmlElement)

      return htmlElement.outerHTML
    }
  }
}
