export default class VideoClip {
  source: string
  title: string | undefined
  length: number | undefined
  thumbnailUrl: string | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(source: string, rawMetadata: any) {
    this.source = source
    this.title = rawMetadata?.meta?.title
    this.length = rawMetadata?.meta?.duration
    this.thumbnailUrl = rawMetadata?.thumbnail?.small?.url
  }
}
