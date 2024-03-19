import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import { getClipsMetadata } from "../services/metadataLoader"
import VideoClip from "../types/videoClip"

export const useClipsMetadata = () => {
  const { metamaxRealm, setAvailableClips, availableClips } = useStore()

  const updateAvailableClips = useCallback(async () => {
    if (metamaxRealm) {
      const cashedClips: VideoClip[] = []
      const uncashedSources: string[] = []
      availableClips.forEach((clip) => {
        if (clip.status === "CACHED") cashedClips.push(clip)
        else uncashedSources.push(clip.source)
      })

      if (uncashedSources.length) {
        console.log("fetchMetadata; uncashedSources:", uncashedSources)
        const metadata = await getClipsMetadata(uncashedSources, metamaxRealm)
        console.log("fetchMetadata; metadata:", metadata)
        setAvailableClips([...cashedClips, ...metadata])
      }
    } else {
      console.log("fetchMetadata; no realm")
    }
  }, [metamaxRealm, setAvailableClips, availableClips])

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
