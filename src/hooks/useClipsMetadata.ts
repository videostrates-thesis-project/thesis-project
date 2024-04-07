import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import { getClipMetadata } from "../services/metadataLoader"
import { indexVideo, getVideoIndexingState } from "../services/api/api"

export const useClipsMetadata = () => {
  const {
    metamaxRealm,
    updateClipMetadata,
    availableClips,
    clipsMetadata,
    updateIndexingState,
  } = useStore()

  const updateAvailableClips = useCallback(async () => {
    if (metamaxRealm) {
      const metadataPromises = clipsMetadata
        .filter((clip) => clip.status === "UNCACHED")
        .map(async (clip) => {
          const metadata = await getClipMetadata(clip.source, metamaxRealm)
          if (!clip.indexingState) {
            updateIndexingState({
              [clip.source]: {
                state: "Processing",
                progress: 0,
                url: clip.source,
              },
            })
            const indexingState = await indexVideo(clip.source, clip.title)
            updateIndexingState({ [clip.source]: indexingState })
          }
          updateClipMetadata(clip.source, metadata)
        })
      await Promise.all(metadataPromises)
    } else {
      console.log("fetchMetadata; no realm")
    }
  }, [clipsMetadata, metamaxRealm, updateClipMetadata, updateIndexingState])

  const updateClipsIndexingState = useCallback(async () => {
    const notIndexedClips = clipsMetadata.filter(
      (clip) => clip.indexingState?.state !== "Processed"
    )
    if (notIndexedClips.length) {
      const indexingState = await getVideoIndexingState(
        notIndexedClips.map((clip) => clip.source)
      )
      updateIndexingState(indexingState)
    }
  }, [clipsMetadata, updateIndexingState])

  useEffect(() => {
    // Periodically fetch metadata for clips that haven't been fetched yet
    // It's because the metamax API may take a while to cache the metadata
    const interval = setInterval(() => {
      updateAvailableClips()
    }, 1000) // 1 second
    return () => clearInterval(interval)
  }, [updateAvailableClips])

  useEffect(() => {
    // Periodically fetch indexing state for clips that haven't been indexed yet
    const interval = setInterval(() => {
      updateClipsIndexingState()
    }, 5000) // 5 seconds
    return () => clearInterval(interval)
  }, [updateClipsIndexingState])

  useEffect(() => {
    // Update available clips when the list of clip sources changes
    updateAvailableClips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableClips])
}
