import { ParsedVideostrate } from "../types/parsedVideostrate"
import {
  CustomElement,
  VideoClipElement,
  VideoElement,
  VideoElementType,
} from "../types/videoElement"
import { v4 as uuid } from "uuid"

let clips: VideoClipElement[] = []
let elements: VideoElement[] = []

export const parseVideostrate = (text: string) => {
  if (!text) return new ParsedVideostrate([], [])

  clips = []
  elements = []

  const parser = new DOMParser()
  const html = parser.parseFromString(text, "text/html")

  html.body.childNodes.forEach((element) => {
    parseElement(element)
  })

  const parsed: ParsedVideostrate = new ParsedVideostrate(
    clips.sort((a, b) => a.start - b.start),
    elements.sort((a, b) => a.start - b.start)
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
    }
    clips.push(clip)
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
    }
    elements.push(videoElement)
  }
}

const determineType = (element: HTMLElement): VideoElementType => {
  if (element.classList.contains("subtitle")) return "subtitle"

  return "custom"
}