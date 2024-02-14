import { ParsedVideostrate } from "../types/parsedVideostrate"
import {
  CustomElement,
  VideoClipElement,
  VideoElement,
} from "../types/videoElement"

export const serializeVideostrate = (parsed: ParsedVideostrate) => {
  console.log(parsed)
  const serializedElements = parsed.all.map((element) => {
    return serializeElement(element)
  })

  const html = serializedElements.join("\n")
  console.log(html)
  return html
}

const serializeElement = (element: VideoElement) => {
  if (element.nodeType === "video") {
    const clip = element as VideoClipElement
    return `<video id="${clip.id}" class="composited" data-start="${clip.start}" data-end="${clip.end}" data-offset="${clip.offset ?? 0}" clip-start="${clip.offset ?? 0}" clip-end="${clip.end - clip.start + clip.offset}"><source src="${clip.source}" /></video>`
  } else {
    const custom = element as CustomElement
    return `<${element.nodeType} id="${element.id}" class="composited" data-start="${element.start}" data-end="${element.end}" data-offset="${element.offset ?? 0}" clip-start="${element.offset ?? 0}" clip-end="${element.end - element.start + element.offset}">${custom.content}</${element.nodeType}>`
  }
}
