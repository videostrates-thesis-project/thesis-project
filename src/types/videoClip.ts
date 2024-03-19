import getNextClipIndex from "../utils/getNextClipIndex"

export interface RawMetadata {
  status: "CACHED" | "UNCACHED"
  meta?: {
    title?: string
    duration?: number
  }
  thumbnail?: {
    small?: {
      url?: string
    }
  }
}
export default class VideoClip {
  source: string
  status: "CACHED" | "UNCACHED"
  title: string = "Loading..."
  length: number | undefined
  thumbnailUrl: string | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(source: string, rawMetadata: RawMetadata) {
    this.source = source
    this.status = rawMetadata?.status || "UNCACHED"
    if (this.status === "CACHED") {
      this.title = rawMetadata?.meta?.title || `Clip ${getNextClipIndex()}`
    }

    this.length = rawMetadata?.meta?.duration
    this.thumbnailUrl = rawMetadata?.thumbnail?.small?.url
  }
}
