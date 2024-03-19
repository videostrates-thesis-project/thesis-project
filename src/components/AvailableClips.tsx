import { useStore } from "../store"
import ClipUploader from "./ClipUploader"
import AvailableClip from "./AvailableClip"

const AvailableClips = () => {
  const { availableClips } = useStore()

  return (
    <div className="w-full flex flex-col gap-3">
      <ClipUploader />
      {availableClips.map((clip) => (
        <AvailableClip key={clip.source} clip={clip} />
      ))}
    </div>
  )
}

export default AvailableClips
