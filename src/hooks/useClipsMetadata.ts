import { useEffect } from "react"
import { useStore } from "../store"
import { getClipsMetadata } from "../services/metadataLoader"

export const useClipsMetadata = () => {
  const { metamaxRealm, parsedVideostrate, setClipsMetadata } = useStore()

  useEffect(() => {
    const fetchMetadata = async () => {
      if (metamaxRealm) {
        console.log("fetchMetadata; realm:", metamaxRealm)
        const metadata = await getClipsMetadata(
          parsedVideostrate.clips,
          metamaxRealm
        )
        setClipsMetadata(metadata)
      }
    }
    fetchMetadata()
  }, [metamaxRealm, parsedVideostrate.clips, setClipsMetadata])
}
