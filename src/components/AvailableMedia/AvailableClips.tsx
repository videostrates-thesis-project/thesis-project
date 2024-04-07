import { useStore } from "../../store"
import ClipUploader from "./ClipUploader"
import AvailableClip from "./AvailableClip"

const AvailableClips = () => {
  const { clipsMetadata } = useStore()

  return (
    <div className="w-full flex flex-col gap-3">
      <ClipUploader />
      {clipsMetadata.map((clip) => (
        <AvailableClip key={clip.source} clip={clip} />
      ))}
    </div>
  )
}

export default AvailableClips
