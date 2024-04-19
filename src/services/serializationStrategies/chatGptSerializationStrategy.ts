import { useStore } from "../../store"
import { VideoClipElement, VideoElement } from "../../types/videoElement"
import { SerializationStrategyBase } from "./serializationStrategyBase"
import { CustomElement } from "../../types/videoElement"

export class ChatGptSerializationStrategy extends SerializationStrategyBase {
  protected addElementToHtml(element: VideoElement, document: Document): void {
    const clip = element as VideoClipElement

    const availableClip = useStore
      .getState()
      .clipsMetadata.find((c) => c.source === clip.source)
    const html = `<div id="${clip.id}" element-type="embedded-clip" clip-name="${availableClip?.title}" class="${clip.className?.replace("composited", "") ?? ""}" layer="${clip.layer}" absolute-start="${clip.start}" absolute-end="${clip.end}" relative-start="${clip.offset ?? 0}" relative-end="${clip.end - clip.start + clip.offset}"  playback-speed="${isNaN(clip.speed) ? 1 : clip.speed}" src="${clip.source}"></div>`

    // Find the parent element
    const parent = document.querySelector(
      `[embedded-clip-container="${clip.parentId ?? "root"}"]`
    )
    if (!parent) {
      console.error("Parent with id '" + clip.parentId + "' not found")
      return
    }

    // Add the element
    parent.innerHTML += html
  }

  public serializeElement(element: VideoElement): string {
    if (element.type === "video") {
      const clip = element as VideoClipElement

      const availableClip = useStore
        .getState()
        .clipsMetadata.find((c) => c.source === clip.source)
      return `<div id="${clip.id}" element-type="clip" clip-name="${availableClip?.title}" class="${clip.className?.replace("composited", "") ?? ""}" layer="${clip.layer}" absolute-start="${clip.start}" absolute-end="${clip.end}" relative-start="${clip.offset ?? 0}" relative-end="${clip.end - clip.start + clip.offset}"  playback-speed="${isNaN(clip.speed) ? 1 : clip.speed}" src="${clip.source}"></div>`
    } else {
      if (!(element as CustomElement).content)
        throw new Error("Missing content")

      const parser = new DOMParser()
      const document = parser.parseFromString(
        (element as CustomElement).content,
        "text/html"
      )
      const htmlElement = document.body.firstChild as HTMLElement
      if (!htmlElement) throw new Error("Invalid outerHtml")

      console.log("Serializing html element", htmlElement)

      const parent = htmlElement.parentNode
      const wrapper = document.createElement("div")
      parent?.replaceChild(wrapper, htmlElement)
      wrapper.appendChild(htmlElement)

      if (wrapper.classList.contains("composited")) {
        wrapper.classList.remove("composited")
      }

      wrapper.setAttribute("id", element.id)
      wrapper.setAttribute("element-type", "custom-element")
      wrapper.setAttribute("custom-element-name", element.name)
      wrapper.setAttribute("absolute-start", element.start.toString())
      wrapper.setAttribute("absolute-end", element.end.toString())
      wrapper.setAttribute("layer", element.layer.toString())

      SerializationStrategyBase.removeElementsWithClipNameAttribute(wrapper)

      return wrapper.outerHTML
    }
  }
}
