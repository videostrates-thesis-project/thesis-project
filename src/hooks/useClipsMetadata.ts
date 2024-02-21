import { useEffect } from "react"
import { useStore } from "../store"
import { getClipsMetadata } from "../services/metadataLoader"

export const useClipsMetadata = () => {
  const { metamaxRealm, clipsSources, setAvailableClips } = useStore()

  useEffect(() => {
    const fetchMetadata = async () => {
      if (metamaxRealm) {
        console.log("fetchMetadata; realm:", metamaxRealm)
        const metadata = await getClipsMetadata(clipsSources, metamaxRealm)
        setAvailableClips(metadata)
      }
    }
    fetchMetadata()
  }, [metamaxRealm, clipsSources, setAvailableClips])
}
