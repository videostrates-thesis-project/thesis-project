import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import { getClipsMetadata } from "../services/metadataLoader"

export const useClipsMetadata = () => {
  const { metamaxRealm, clipsSources, setAvailableClips, availableClips } =
    useStore()

  const updateAvailableClips = useCallback(async () => {
    if (metamaxRealm) {
      console.log("fetchMetadata; realm:", metamaxRealm)
      const uncashedSources = clipsSources.filter(
        (source) => !availableClips.some((clip) => clip.source === source)
      )
      console.log("fetchMetadata; uncashedSources:", uncashedSources)
      if (uncashedSources.length) {
        const metadata = await getClipsMetadata(uncashedSources, metamaxRealm)
        console.log("fetchMetadata; metadata:", metadata)
        setAvailableClips([...availableClips, ...metadata])
      }
    } else {
      console.log("fetchMetadata; no realm")
    }
  }, [metamaxRealm, clipsSources, setAvailableClips, availableClips])

  useEffect(() => {
    // Periodically fetch metadata for clips that haven't been fetched yet
    // It's because the metamax API may take a while to cache the metadata
    const interval = setInterval(() => {
      console.log("fetchMetadata; interval")
      updateAvailableClips()
    }, 1000)
    return () => clearInterval(interval)
  }, [updateAvailableClips])

  useEffect(() => {
    // Update available clips when the list of clips sources changes
    updateAvailableClips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipsSources])
}
