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

  updateMetadata(rawMetadata: RawMetadata) {
    const clip = new VideoClip(this.source, this.title)
    clip._updateMetadata(rawMetadata)
    return clip
  }

  protected _updateMetadata(rawMetadata: RawMetadata) {
    this.status = rawMetadata.status
    if (rawMetadata.status === "CACHED") {
      this.title = rawMetadata?.meta?.title || this.title
      this.length = rawMetadata?.meta?.duration
      this.thumbnailUrl = rawMetadata?.thumbnail?.small?.url
    }
  }

  constructor(source: string, title: string) {
    this.source = source
    this.title = title
    this.status = "UNCACHED"
  }
}
