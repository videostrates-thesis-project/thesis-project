import { RawMetadata } from "../types/videoClip"

export const getClipMetadata = async (
  clipSource: string,
  metamaxRealm: string
) => {
  let data = await fetchMetamaxMetadata(clipSource, metamaxRealm, "GET")
  if (data?.status === "UNCACHED") {
    data = await fetchMetamaxMetadata(clipSource, metamaxRealm, "PUT")
  }
  return data as RawMetadata
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
