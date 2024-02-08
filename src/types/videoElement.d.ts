export type VideoElementType = "video" | "subtitle" | "custom"

export interface VideoElement {
  start: number
  end: number
  nodeType: string
  type: VideoElementType
}

export interface VideoClipElement extends VideoElement {
  source: string
}
