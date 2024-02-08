import { ParsedVideostrate } from "../types/parsedVideostrate"
import {
  VideoClipElement,
  VideoElement,
  VideoElementType,
} from "../types/videoElement"

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
    }
    clips.push(clip)
  } else {
    const videoElement: VideoElement = {
      start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
      end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
      type: determineType(htmlElement),
      nodeType: htmlElement.nodeName.toLowerCase(),
    }
    elements.push(videoElement)
  }
}

const determineType = (element: HTMLElement): VideoElementType => {
  if (element.classList.contains("subtitle")) return "subtitle"

  return "custom"
}
