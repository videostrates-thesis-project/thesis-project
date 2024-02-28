export type VideoElementType = "video" | "subtitle" | "custom"

export interface VideoElement {
  id: string
  start: number
  end: number
  nodeType: string
  offset: number
  type: VideoElementType
  outerHtml?: string
  speed: number
}

export interface CustomElement extends VideoElement {
  content: string
}

export interface VideoClipElement extends VideoElement {
  source: string
}
