import { useStore } from "../../store"
import ClipUploader from "./ClipUploader"
import AvailableClip from "./AvailableClip"
import ClipsSearch from "./ClipsSearch"
import { useState } from "react"

const AvailableClips = () => {
  const { clipsMetadata } = useStore()
  const [searchActive, setSearchActive] = useState(false)

  return (
    <div className="w-full flex flex-col gap-3">
      <ClipUploader />
      <ClipsSearch
        searchActive={searchActive}
        setSearchActive={setSearchActive}
      />
      {!searchActive &&
        clipsMetadata.map((clip) => (
          <AvailableClip key={clip.source} clip={clip} />
        ))}
    </div>
  )
}

export default AvailableClips
