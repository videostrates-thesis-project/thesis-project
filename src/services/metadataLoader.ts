import ClipMetadata from "../types/videoClip"
import { VideoClipElement } from "../types/videoElement"

export const getClipsMetadata = async (
  clips: VideoClipElement[],
  metaMaxRealm: string
) => {
  console.log("Computing clips metadata", clips, metaMaxRealm)
  const uniqueUrls = Array.from(new Set(clips.map((clip) => clip.source)))
  const clipsMetadataPromises: Promise<ClipMetadata>[] = uniqueUrls.map(
    async (url) => await getClipMetadata(url, metaMaxRealm)
  )
  const clipsMetadata: ClipMetadata[] = await Promise.all(clipsMetadataPromises)
  const clipsMetadataMap = new Map<string, ClipMetadata>()
  clipsMetadata.forEach((metadata) => {
    clipsMetadataMap.set(metadata.source, metadata)
  })
  console.log(clipsMetadataMap)
  return clipsMetadataMap
}

const getClipMetadata = async (clipSource: string, metaMaxRealm: string) => {
  console.log("Computing clip metadata", clipSource, metaMaxRealm)
  const metaMaxApi: string =
    import.meta.env.VITE_META_MAX_API || "https://stream.cavi.au.dk/cache/api/"
  console.log(metaMaxApi, metaMaxRealm)
  const requestUrl = `${metaMaxApi}/${metaMaxRealm}/entity?url=${clipSource}`
  const response = await fetch(requestUrl)
  const data = await response.json()
  console.log(data)
  return new ClipMetadata(clipSource, data)
}
