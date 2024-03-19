import { ParsedVideostrate } from "../types/parsedVideostrate"
import {
  CustomElement,
  VideoClipElement,
  VideoElement,
  VideoElementType,
} from "../types/videoElement"
import { v4 as uuid } from "uuid"
import { parseStyle } from "./parser/parseStyle"
import { useStore } from "../store"
import VideoClip from "../types/videoClip"
import { Image } from "../types/image"
import getNextImageIndex from "../utils/getNextImageIndex"

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

  const images = collectImages(html)
  setAvailableImages(images)
  setAvailableClips(allElements)

  const parsed: ParsedVideostrate = new ParsedVideostrate(
    allElements,
    images,
    style,
    animations
  )
  return parsed
}

const collectImages = (html: Document) => {
  const images = html.body.getElementsByTagName("img")
  return Array.from(images).map((img) => ({ url: img.src, title: img.alt }))
}

const setAvailableImages = (images: Image[]) => {
  let imageIndex = getNextImageIndex()
  const oldImages: [string, Image][] = useStore
    .getState()
    .availableImages.map((i) => [i.url, i])

  const allImages = new Map<string, Image>([
    ...images.map((i) => {
      if (i.title === "") {
        i.title = `Image ${imageIndex}`
        imageIndex++
      }
      return [i.url, i]
    }),
    ...oldImages,
  ] as [string, Image][])

  useStore.getState().setAvailableImages(Array.from(allImages.values()))
}

const setAvailableClips = (elements: VideoElement[]) => {
  const sources = elements
    .filter((element) => {
      return (
        element.type === "video" &&
        !useStore
          .getState()
          .availableClips.some(
            (clip) => clip.source === (element as VideoClipElement).source
          )
      )
    })
    .map((element) => (element as VideoClipElement).source)
  const uniqueSources = Array.from(new Set(sources))
  const clips = uniqueSources.map((source) => {
    return new VideoClip(source, { status: "UNCACHED" })
  })

  useStore
    .getState()
    .setAvailableClips([...useStore.getState().availableClips, ...clips])
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
      const clip: VideoClipElement = {
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
      }

      allElements.push(clip)
      return
    }
    // Is this attached to a custom element?
    else if (htmlElement.parentElement?.hasAttribute("clip-name")) {
      const clip: VideoClipElement = {
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
        parentId: htmlElement.parentElement?.parentElement?.id ?? "",
      }

      allElements.push(clip)
      return
    }

    // Legacy
    const clip: VideoClipElement = {
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
    }
    allElements.push(clip)
  } else {
    console.log(htmlElement.innerHTML)
    const videoElement: CustomElement = {
      name: htmlElement.getAttribute("custom-element-name") ?? "",
      start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
      end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
      type: determineType(htmlElement),
      nodeType: htmlElement.nodeName.toLowerCase(),
      id: htmlElement.id.length > 0 ? htmlElement.id : uuid(),
      content: htmlElement.innerHTML,
      offset: parseFloat(htmlElement.getAttribute("data-offset") ?? "0"),
      outerHtml: htmlElement.outerHTML,
      layer: parseInt(htmlElement.style.zIndex || "0"),
      speed: parseFloat(htmlElement.getAttribute("data-speed") ?? "1"),
    }
    allElements.push(videoElement)
  }
}

const determineType = (element: HTMLElement): VideoElementType => {
  if (element.classList.contains("subtitle")) return "subtitle"

  return "custom"
}
