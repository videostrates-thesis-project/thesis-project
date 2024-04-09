import { useEffect, useState } from "react"
import { searchVideos } from "../services/api/api"
import { SearchVideosResponse } from "../services/api/apiTypes"
import { useStore } from "../store"

const useClipsSearch = () => {
  const { clipsMetadata } = useStore()

  const [search, setSearch] = useState("")
  const [results, setResults] = useState<SearchVideosResponse | null>(null)

  useEffect(() => {
    const searchClips = async () => {
      const response = await searchVideos(
        search,
        clipsMetadata.map((clip) => ({
          url: clip.source,
          start: 0,
          end: clip.length ?? 10000000,
        }))
      )
      setResults(response)
    }
    let timeout: NodeJS.Timeout
    if (search.length > 2) {
      timeout = setTimeout(searchClips, 300)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [search, clipsMetadata])

  return {
    search,
    setSearch,
    results,
  }
}
export default useClipsSearch
