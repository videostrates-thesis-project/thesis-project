import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import { getClipMetadata } from "../services/metadataLoader"

export const useClipsMetadata = () => {
  const { metamaxRealm, updateClipMetadata, availableClips } = useStore()

  const updateAvailableClips = useCallback(async () => {
    if (metamaxRealm) {
      const metadataPromises = availableClips
        .filter((clip) => clip.status === "UNCACHED")
        .map(async (clip) => {
          const metadata = await getClipMetadata(clip.source, metamaxRealm)
          updateClipMetadata(clip.source, metadata)
        })
      await Promise.all(metadataPromises)
    } else {
      console.log("fetchMetadata; no realm")
    }
  }, [availableClips, metamaxRealm, updateClipMetadata])

  useEffect(() => {
    // Periodically fetch metadata for clips that haven't been fetched yet
    // It's because the metamax API may take a while to cache the metadata
    const interval = setInterval(() => {
      updateAvailableClips()
    }, 1000)
    return () => clearInterval(interval)
  }, [updateAvailableClips])

  useEffect(() => {
    // Update available clips when the list of clips sources changes
    updateAvailableClips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableClips])
}
