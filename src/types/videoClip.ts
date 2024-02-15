export default class ClipMetadata {
  source: string
  title: string | undefined
  duration: number | undefined
  thumbnail: string | undefined

  constructor(source: string, rawMetadata: any) {
    this.source = source
    this.title = rawMetadata?.meta?.title
    this.duration = rawMetadata?.meta?.duration
    this.thumbnail = rawMetadata?.thumbnail?.small?.url
  }
}
