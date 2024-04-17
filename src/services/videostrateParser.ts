import { ParsedVideostrate } from "../types/parsedVideostrate"
import {
  CustomElement,
  VideoClipElement,
  VideoElement,
  VideoElementType,
} from "../types/videoElement"
import { v4 as uuid } from "uuid"
import { parseStyle } from "./parser/parseStyle"

let allElements: VideoElement[] = []

export const parseVideostrate = (text: string) => {
  if (!text) return new ParsedVideostrate([], [])

  allElements = []

  const parser = new DOMParser()
  const html = parser.parseFromString(text, "text/html")

  html.body.childNodes.forEach((element) => {
    parseElement(element)
  })

  const styleString = html.getElementById("videostrate-style")?.innerHTML ?? ""
  const { style, animations } = parseStyle(styleString)

  const parsed: ParsedVideostrate = new ParsedVideostrate(
    allElements,
    style,
    animations
  )
  return parsed
}

export const findContainerElement = (htmlElement: HTMLElement) => {
  // Walk up the tree until a container element with costum-element-name attribute is found
  let parent: HTMLElement | null = htmlElement
  while (parent) {
    if (parent.hasAttribute("custom-element-name")) {
      return parent.id
    }
    parent = parent.parentElement
  }

  return undefined
}

const parseElement = (element: ChildNode) => {
  if (element.nodeValue === "\n") return
  const htmlElement = element as HTMLElement

  if (htmlElement?.childNodes) {
    htmlElement.childNodes.forEach((childNode) => parseElement(childNode))
  }

  const isRootVideoContainer =
    htmlElement.classList?.contains("composited") &&
    htmlElement.hasAttribute?.("clip-name") &&
    Array.from(
      Array.from(htmlElement.childNodes ?? []).find((n) => n.nodeName === "DIV")
        ?.childNodes ?? []
    ).find((n) => n.nodeName === "VIDEO")
  const isCustomVideoContainer =
    htmlElement.classList?.contains("composited") &&
    htmlElement.hasAttribute?.("clip-name") &&
    Array.from(htmlElement.childNodes ?? []).find((n) => n.nodeName === "VIDEO")

  console.log(
    "[Parser]",
    htmlElement,
    htmlElement.nodeName,
    htmlElement.hasAttribute?.("clip-name"),
    isCustomVideoContainer,
    isRootVideoContainer
  )

  if (
    !htmlElement?.classList ||
    !htmlElement.classList.contains("composited") ||
    isRootVideoContainer ||
    isCustomVideoContainer ||
    htmlElement.classList.contains("subtitles")
  )
    return

  if (htmlElement.nodeName.toLowerCase() === "video") {
    // Is this in the root?
    if (htmlElement.parentElement?.parentElement?.hasAttribute("clip-name")) {
      const grandParent = htmlElement.parentElement.parentElement
      const clip = new VideoClipElement({
        name: grandParent.getAttribute("clip-name") ?? "",
        id: grandParent.id,
        layer: parseInt(grandParent.style.zIndex || "0"),
        start: parseFloat(grandParent.getAttribute("data-start") ?? "0"),
        end: parseFloat(grandParent.getAttribute("data-end") ?? "0"),
        outerHtml: grandParent.outerHTML,
        source:
          (htmlElement.children.item(0) as HTMLElement).getAttribute("src") ??
          "",
        type: "video",
        nodeType: "video",
        offset: parseFloat(htmlElement.getAttribute("data-offset") ?? "0"),
        speed: parseFloat(htmlElement.getAttribute("data-speed") ?? "1"),
        className: htmlElement.parentElement?.className ?? "",
      })

      allElements.push(clip)
      return
    }
    // Is this attached to a custom element?
    else if (htmlElement.parentElement?.hasAttribute("clip-name")) {
      const clip = new VideoClipElement({
        name: htmlElement.parentElement.getAttribute("clip-name") ?? "",
        id: htmlElement.parentElement.id,
        layer: parseInt(htmlElement.parentElement.style.zIndex || "0"),
        start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
        end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
        outerHtml: htmlElement.parentElement.outerHTML,
        source:
          (htmlElement.children.item(0) as HTMLElement).getAttribute("src") ??
          "",
        type: "video",
        nodeType: "video",
        offset: parseFloat(htmlElement.getAttribute("data-offset") ?? "0"),
        speed: parseFloat(htmlElement.getAttribute("data-speed") ?? "1"),
        className: htmlElement.parentElement?.className ?? "",
        parentId:
          htmlElement.parentElement?.parentElement?.getAttribute(
            "embedded-clip-container"
          ) ?? "",
        containerElementId: findContainerElement(htmlElement) ?? "",
      })

      allElements.push(clip)
      return
    }

    // Legacy
    const clip = new VideoClipElement({
      name: htmlElement.getAttribute("clip-name") ?? "",
      start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
      end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
      source:
        (htmlElement.children.item(0) as HTMLElement).getAttribute("src") ?? "",
      type: "video",
      nodeType: "video",
      id: htmlElement.id.length > 0 ? htmlElement.id : uuid(),
      offset: parseFloat(htmlElement.getAttribute("data-offset") ?? "0"),
      outerHtml: htmlElement.outerHTML,
      layer: parseInt(htmlElement.style.zIndex || "0"),
      speed: parseFloat(htmlElement.getAttribute("data-speed") ?? "1"),
      className: htmlElement.className,
    })
    allElements.push(clip)
  } else {
    const htmlCopy = htmlElement.cloneNode(true) as HTMLElement

    htmlCopy
      .querySelectorAll("[embedded-clip-container]")
      .forEach((element) => {
        element.innerHTML = ""
      })

    const content = htmlCopy.innerHTML

    const videoElement = new CustomElement({
      name: htmlElement.getAttribute("custom-element-name") ?? "",
      start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
      end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
      type: determineType(htmlElement),
      nodeType: htmlElement.nodeName.toLowerCase(),
      id: htmlElement.id.length > 0 ? htmlElement.id : uuid(),
      content: content,
      offset: parseFloat(htmlElement.getAttribute("data-offset") ?? "0"),
      outerHtml: htmlElement.outerHTML,
      layer: parseInt(htmlElement.style.zIndex || "0"),
      speed: parseFloat(htmlElement.getAttribute("data-speed") ?? "1"),
    })
    allElements.push(videoElement)
  }
}

const determineType = (element: HTMLElement): VideoElementType => {
  if (element.classList.contains("subtitle")) return "subtitle"

  return "custom"
}
