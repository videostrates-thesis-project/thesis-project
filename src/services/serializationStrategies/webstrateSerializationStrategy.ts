import {
  CustomElement,
  VideoClipElement,
  VideoElement,
} from "../../types/videoElement"
import { SerializationStrategyBase } from "./serializationStrategyBase"

export class WebstrateSerializationStrategy extends SerializationStrategyBase {
  protected addElementToHtml(element: VideoElement, document: Document): void {
    const clip = element as VideoClipElement

    const html = `<div clip-name="${clip.name}" id="${clip.id}" style="z-index: ${clip.layer};" class="${clip.className}">
       <video  class="composited" data-start="${clip.start}" data-end="${clip.end}" data-offset="${clip.offset ?? 0}" data-speed="${isNaN(clip.speed) ? 1 : clip.speed}"><source src="${clip.source}" /></video>
    </div>`

    // Find the parent element
    const parent = document.getElementById(clip.parentId ?? "root")
    if (!parent) throw new Error("Parent with id '" + clip.parentId + "' not found")

    // Add the element
    parent.innerHTML += html
  }

  public serializeElement(element: VideoElement): string {
    // console.log("Serializing element", element)
    if (element.nodeType === "video") {
      const clip = element as VideoClipElement

      return `<div clip-name="${clip.name}" id="${clip.id}" style="z-index: ${clip.layer};" class="composited" data-start="${clip.start}" data-end="${clip.end}">
        <div class="${clip.className?.replace("composited", "") ?? ""}">
         <video class="composited" data-start="${clip.start}" data-end="${clip.end}" data-offset="${clip.offset ?? 0}" data-speed="${isNaN(clip.speed) ? 1 : clip.speed}"><source src="${clip.source}" /></video>
        </div>
      </div>`
    } else {
      if (!element.outerHtml) throw new Error("Missing  outerHtml")

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

      if (!wrapper.classList.contains("composited")) {
        wrapper.classList.add("composited")
      }
      wrapper.setAttribute("id", element.id)
      wrapper.setAttribute("custom-element-name", element.name)
      wrapper.setAttribute("style", `"z-index: ${element.layer};"`)
      wrapper.setAttribute("data-start", element.start.toString())
      wrapper.setAttribute("data-end", element.end.toString())
      wrapper.setAttribute("data-offset", (element.offset ?? 0).toString())
      wrapper.setAttribute("clip-start", (element.offset ?? 0).toString())
      wrapper.setAttribute(
        "clip-end",
        (element.end - element.start + element.offset).toString()
      )
      wrapper.setAttribute(
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
      removeElementsWithClipNameAttribute(wrapper)

      return wrapper.outerHTML
    }
  }
}
