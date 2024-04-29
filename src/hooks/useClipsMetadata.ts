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

  const indexClip = useCallback(
    async (clipSource: string, title: string) => {
      updateIndexingState({
        [clipSource]: {
          state: "Processing",
          progress: 0,
          url: clipSource,
        },
      })
      const indexingState = await indexVideo({
        url: clipSource,
        name: title,
      })
      updateIndexingState({ [clipSource]: indexingState })
    },
    [updateIndexingState]
  )

  const updateAvailableClips = useCallback(async () => {
    if (metamaxRealm) {
      const metadataPromises = clipsMetadata
        .filter((clip) => clip.status === "UNCACHED")
        .map(async (clip) => {
          const metadata = await getClipMetadata(clip.source, metamaxRealm)
          updateClipMetadata(clip.source, metadata)
        })
      await Promise.all(metadataPromises)
    } else {
      console.log("fetchMetadata; no realm")
    }
  }, [clipsMetadata, metamaxRealm, updateClipMetadata])

  const updateClipsIndexingState = useCallback(async () => {
    const notIndexedClips = clipsMetadata.filter(
      (clip) => clip.indexingState?.state !== "Processed"
    )
    if (notIndexedClips.length) {
      const indexingState = await getVideoIndexingState({
        urls: notIndexedClips.map((clip) => clip.source),
      })
      updateIndexingState(indexingState)
      // Find clips with no indexing state and index them
      const clipsToIndex = notIndexedClips.filter(
        (clip) => !indexingState[clip.source]
      )
      console.log("Indexing clips", clipsToIndex)
      clipsToIndex.forEach(async (clip) => {
        await indexClip(clip.source, clip.title)
      })
    }
  }, [clipsMetadata, indexClip, updateIndexingState])

  useEffect(() => {
    // Periodically fetch metadata for clips that haven't been fetched yet
    // It's because the metamax API may take a while to cache the metadata
    const interval = setInterval(() => {
      updateAvailableClips()
    }, 3000) // 1 second
    return () => clearInterval(interval)
  }, [updateAvailableClips])

  useEffect(() => {
    // Periodically fetch indexing state for clips that haven't been indexed yet
    const interval = setInterval(() => {
      updateClipsIndexingState()
    }, 10000) // 5 seconds
    return () => clearInterval(interval)
  }, [updateClipsIndexingState])

  useEffect(() => {
    // Update available clips when the list of clip sources changes
    updateAvailableClips()
    updateClipsIndexingState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableClips])
}
