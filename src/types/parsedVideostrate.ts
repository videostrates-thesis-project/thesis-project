import { VideoClipElement, VideoElement } from "./videoElement"

export class ParsedVideostrate {
  clips: VideoClipElement[] = []
  elements: VideoElement[] = []
  all: VideoElement[] = []

  constructor(clips: VideoClipElement[], elements: VideoElement[]) {
    this.clips = clips
    this.elements = elements
    this.all = elements.concat(clips)
    this.all.sort((a, b) => a.start - b.start)
  }
}
