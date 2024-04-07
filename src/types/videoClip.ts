const precision =
  10 ** ((import.meta.env.VITE_TIME_DECIMALS_PRECISION as number) || 0)

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

export interface IndexingState {
  url: string
  state: "Uploaded" | "Processing" | "Processed"
  progress: number
}

export default class VideoClip {
  source: string
  status: "CACHED" | "UNCACHED"
  title: string = "Loading..."
  length: number | undefined
  thumbnailUrl: string | undefined
  indexingState: IndexingState | undefined

  constructor(source: string, title: string) {
    this.source = source
    this.title = title
    this.status = "UNCACHED"
  }

  updateMetadata(rawMetadata: RawMetadata) {
    const clip = this.copy()
    clip._updateMetadata(rawMetadata)
    return clip
  }

  updateIndexingState(indexingState: IndexingState) {
    const clip = this.copy()
    clip.indexingState = indexingState
    return clip
  }

  copy() {
    const clip = new VideoClip(this.source, this.title)
    clip.status = this.status
    clip.length = this.length
    clip.thumbnailUrl = this.thumbnailUrl
    clip.indexingState = this.indexingState
    return clip
  }

  protected _updateMetadata(rawMetadata: RawMetadata) {
    this.status = rawMetadata.status
    if (rawMetadata.status === "CACHED") {
      this.title = rawMetadata?.meta?.title || this.title
      this.length = rawMetadata?.meta?.duration
      if (this.length)
        this.length = Math.floor(this.length * precision) / precision
      this.thumbnailUrl = rawMetadata?.thumbnail?.small?.url
    }
  }
}
