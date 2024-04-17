import { RawMetadata } from "../types/videoClip"
import { META_MAX_API } from "../envVariables"

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
  const requestUrl = `${META_MAX_API}/${metamaxRealm}/entity?url=${clipSource}`
  const response = await fetch(requestUrl, { method: method })
  return await response.json()
}
