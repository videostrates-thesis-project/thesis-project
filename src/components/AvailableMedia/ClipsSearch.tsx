import { useStore } from "../../store"
import { SearchVideosResponse } from "../../services/api/apiTypes"
import { useCallback, useState } from "react"
import { searchVideos } from "../../services/api/api"
import SearchClipsResults from "./SearchClipsResults"

const ClipsSearch = (props: {
  searchActive: boolean
  setSearchActive: (active: boolean) => void
}) => {
  const { clipsMetadata } = useStore()

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchVideosResponse | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const searchClips = useCallback(async () => {
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
  }, [clipsMetadata, search])

  const onSearch = useCallback(() => {
    if (search.length < 1) {
      props.setSearchActive(false)
      return
    }
    props.setSearchActive(true)
    // Require at least 3 characters to search
    if (search.length < 3) {
      setValidationError("Type at least 3 characters")
    } else {
      searchClips()
      setValidationError(null)
    }
  }, [props, search.length, searchClips])

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
      if (e.target.value.length === 0) {
        props.setSearchActive(false)
        setValidationError(null)
      }
    },
    [props]
  )

  return (
    <>
      <div className="join w-full relative">
        <input
          value={search}
          onChange={onSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch()
          }}
          className="input input-sm join-item input-bordered w-full"
          placeholder="Search in transcript..."
        />
        {search && (
          <button
            className="btn btn-sm btn-ghost text-error absolute right-10"
            onClick={() => {
              onSearchChange({
                target: { value: "" },
              } as React.ChangeEvent<HTMLInputElement>)
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        )}
        <button className="btn btn-sm btn-neutral join-item" onClick={onSearch}>
          <i className="bi bi-search"></i>
        </button>
      </div>
      {validationError && <div className="opacity-50">{validationError}</div>}
      {props.searchActive && loading && <div>Loading...</div>}
      {props.searchActive &&
        !loading &&
        results &&
        !validationError &&
        !Object.keys(results).length && <div>No results</div>}
      {props.searchActive && !loading && !validationError && (
        <SearchClipsResults results={results} />
      )}
    </>
  )
}

export default ClipsSearch
