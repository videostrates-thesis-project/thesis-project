import { useStore } from "../../store"
import ClipUploader from "./ClipUploader"
import AvailableClip from "./AvailableClip"
import ClipsSearch from "./ClipsSearch"
import useClipsSearch from "../../hooks/useClipsSearch"

const AvailableClips = () => {
  const { clipsMetadata } = useStore()
  const { search, setSearch, results } = useClipsSearch()

  return (
    <div className="w-full flex flex-col gap-3">
      <ClipUploader />
      <ClipsSearch search={search} setSearch={setSearch} results={results} />
      {!search &&
        clipsMetadata.map((clip) => (
          <AvailableClip key={clip.source} clip={clip} />
        ))}
    </div>
  )
}

export default AvailableClips
