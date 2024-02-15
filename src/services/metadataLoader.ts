import ClipMetadata from "../types/videoClip"
import { VideoClipElement } from "../types/videoElement"

export const getClipsMetadata = async (
  clips: VideoClipElement[],
  metamaxRealm: string
) => {
  const uniqueUrls = Array.from(new Set(clips.map((clip) => clip.source)))
  const clipsMetadataPromises: Promise<ClipMetadata>[] = uniqueUrls.map(
    async (url) => await getClipMetadata(url, metamaxRealm)
  )
  const clipsMetadata: ClipMetadata[] = await Promise.all(clipsMetadataPromises)
  const clipsMetadataMap = new Map<string, ClipMetadata>()
  clipsMetadata.forEach((metadata) => {
    clipsMetadataMap.set(metadata.source, metadata)
  })
  return clipsMetadataMap
}

const getClipMetadata = async (clipSource: string, metamaxRealm: string) => {
  const metamaxApi: string =
    import.meta.env.VITE_META_MAX_API || "https://stream.cavi.au.dk/cache/api/"
  const requestUrl = `${metamaxApi}/${metamaxRealm}/entity?url=${clipSource}`
  const response = await fetch(requestUrl)
  const data = await response.json()
  console.log(data)
  return new ClipMetadata(clipSource, data)
}
