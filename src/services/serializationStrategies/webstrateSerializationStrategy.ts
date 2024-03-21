import { VideoClipElement, VideoElement } from "../../types/videoElement"
import { SerializationStrategyBase } from "./serializationStrategyBase"

export class WebstrateSerializationStrategy extends SerializationStrategyBase {
  protected addElementToHtml(element: VideoElement, document: Document): void {
    const clip = element as VideoClipElement

    const html = `<div clip-name="${clip.name}" id="${clip.id}" style="z-index: ${clip.layer};" class="${clip.className}">
       <video  class="composited" data-start="${clip.start}" data-end="${clip.end}" data-offset="${clip.offset ?? 0}" data-speed="${isNaN(clip.speed) ? 1 : clip.speed}"><source src="${clip.source}" /></video>
    </div>`

    // Find the parent element
    const parent = document.getElementById(clip.parentId ?? "root")
    if (!parent) throw new Error("Parent not found")

    // Add the element
    parent.innerHTML += html
  }

  protected serializeElement(element: VideoElement): string {
    // console.log("Serializing element", element)
    if (element.type === "video") {
      const clip = element as VideoClipElement

      return `<div clip-name="${clip.name}" id="${clip.id}" style="z-index: ${clip.layer};" class="composited" data-start="${clip.start}" data-end="${clip.end}">
        <div class="${clip.className?.replace("composited", "") ?? ""}">
         <video class="composited" data-start="${clip.start}" data-end="${clip.end}" data-offset="${clip.offset ?? 0}" data-speed="${isNaN(clip.speed) ? 1 : clip.speed}"><source src="${clip.source}" /></video>
        </div>
      </div>`
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
      htmlElement.setAttribute("custom-element-name", element.name)
      htmlElement.setAttribute("style", `z-index: ${element.layer};`)
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
      const removeElementsWithClipNameAttribute = (doc: HTMLElement) => {
        const elementsToRemove = doc.querySelectorAll("[clip-name]")
        elementsToRemove.forEach((element) => {
          element.remove()
        })

        // Recursively process child nodes
        doc.childNodes.forEach((childNode) => {
          if (childNode.nodeType === Node.ELEMENT_NODE) {
            removeElementsWithClipNameAttribute(childNode as HTMLElement)
          }
        })
      }
      removeElementsWithClipNameAttribute(htmlElement)

      return htmlElement.outerHTML
    }
  }
}
