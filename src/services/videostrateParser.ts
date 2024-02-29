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

  allElements.sort((a, b) => a.layer - b.layer)
  let layerShift = 0
  allElements.forEach((element, index) => {
    let proposedLayer = element.layer + layerShift
    if (index > 0) {
      const prevElement = allElements[index - 1]
      if (
        prevElement.layer === proposedLayer &&
        prevElement.end > element.start
      ) {
        proposedLayer += 1
        layerShift += 1
      }
    }
    element.layer = proposedLayer
  })

  const styleString = html.getElementById("videostrate-style")?.innerHTML ?? ""
  const { style, animations } = parseStyle(styleString)

  const parsed: ParsedVideostrate = new ParsedVideostrate(
    allElements.filter((e) => e.type === "video") as VideoClipElement[],
    allElements.filter((e) => e.type !== "video") as VideoElement[],
    style,
    animations
  )
  return parsed
}

const parseElement = (element: ChildNode) => {
  if (element.nodeValue === "\n") return
  const htmlElement = element as HTMLElement

  if (htmlElement?.childNodes) {
    htmlElement.childNodes.forEach((childNode) => parseElement(childNode))
  }

  if (!htmlElement?.classList || !htmlElement.classList.contains("composited"))
    return

  if (htmlElement.nodeName.toLowerCase() === "video") {
    const clip: VideoClipElement = {
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
    }
    allElements.push(clip)
  } else {
    console.log(htmlElement.innerHTML)
    const videoElement: CustomElement = {
      start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
      end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
      type: determineType(htmlElement),
      nodeType: htmlElement.nodeName.toLowerCase(),
      id: htmlElement.id.length > 0 ? htmlElement.id : uuid(),
      content: htmlElement.innerHTML,
      offset: parseFloat(htmlElement.getAttribute("data-offset") ?? "0"),
      outerHtml: htmlElement.outerHTML,
      layer: parseInt(htmlElement.style.zIndex || "0"),
    }
    allElements.push(videoElement)
  }
}

const determineType = (element: HTMLElement): VideoElementType => {
  if (element.classList.contains("subtitle")) return "subtitle"

  return "custom"
}
