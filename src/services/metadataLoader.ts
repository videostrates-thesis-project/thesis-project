import VideoClip from "../types/videoClip"

export const getClipsMetadata = async (
  clips: string[],
  metamaxRealm: string
) => {
  const clipsMetadataPromises: Promise<VideoClip>[] = clips.map(
    async (url) => await getClipMetadata(url, metamaxRealm)
  )
  let clipsMetadata: VideoClip[] = await Promise.all(clipsMetadataPromises)
  clipsMetadata = clipsMetadata.map((metadata, index) => {
    if (!metadata.title) {
      metadata.title = `Clip ${index + 1}`
    }
    return metadata
  })
  return clipsMetadata
}

export const getClipMetadata = async (
  clipSource: string,
  metamaxRealm: string
) => {
  let data = await fetchMetamaxMetadata(clipSource, metamaxRealm, "GET")
  if (data?.status === "UNCACHED") {
    data = await fetchMetamaxMetadata(clipSource, metamaxRealm, "PUT")
  }
  return new VideoClip(clipSource, data)
}

const fetchMetamaxMetadata = async (
  clipSource: string,
  metamaxRealm: string,
  method: "GET" | "PUT"
) => {
  const metamaxApi: string =
    import.meta.env.VITE_META_MAX_API || "https://stream.cavi.au.dk/cache/api/"
  const requestUrl = `${metamaxApi}/${metamaxRealm}/entity?url=${clipSource}`
  const response = await fetch(requestUrl, { method: method })
  return await response.json()
}
