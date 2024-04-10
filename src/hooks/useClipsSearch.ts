import { useEffect, useState } from "react"
import { searchVideos } from "../services/api/api"
import { SearchVideosResponse } from "../services/api/apiTypes"
import { useStore } from "../store"

const useClipsSearch = () => {
  const { clipsMetadata } = useStore()

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchVideosResponse | null>(null)

  useEffect(() => {
    const searchClips = async () => {
      setLoading(true)
      const response = await searchVideos({
        query: search,
        videos: clipsMetadata.map((clip) => ({
          url: clip.source,
          start: 0,
          end: clip.length ?? 10000000,
        })),
      })
      setLoading(false)
      setResults(response)
    }
    searchClips()
  }, [search, clipsMetadata])

  return {
    search,
    setSearch,
    results,
    loading,
  }
}
export default useClipsSearch
