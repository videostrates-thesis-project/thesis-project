export interface ParsedVideostrate {
  clips: VideoClipElement[]
  elements: VideoElement[]
}

export type VideoElementType = "video" | "subtitle" | "custom"

export interface VideoElement {
  start: number
  end: number
  type: VideoElementType
}

export interface VideoClipElement extends VideoElement {
  source: string
}
