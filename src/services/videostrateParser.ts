import { ParsedVideostrate, VideostrateStyle } from "../types/parsedVideostrate"
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

  const styleString = html.getElementById("videostrate-style")?.innerHTML ?? ""
  const style = parseStyle(styleString)

  const parsed: ParsedVideostrate = new ParsedVideostrate(
    clips.sort((a, b) => a.start - b.start),
    elements.sort((a, b) => a.start - b.start),
    style
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
      outerHtml: htmlElement.outerHTML,
    }
    elements.push(videoElement)
  }
}

const determineType = (element: HTMLElement): VideoElementType => {
  if (element.classList.contains("subtitle")) return "subtitle"

  return "custom"
}

function parseStyle(cssString: string): VideostrateStyle[] {
  // Remove comments and unnecessary whitespace
  cssString = cssString.replace(/\/\*[\s\S]*?\*\//g, "").trim()

  // Split the CSS string by the closing brace to get each block of code
  const blocks = cssString
    .split("}")
    .map((block) => block.trim())
    .filter((block) => block.length)

  // Map each block to an object containing the selector and content
  const parsedCSS = blocks.map((block) => {
    const [selector, style] = block.split("{").map((part) => part.trim())
    return { selector, style }
  })

  return parsedCSS
}
