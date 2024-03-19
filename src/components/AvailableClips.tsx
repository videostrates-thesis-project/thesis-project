import { useStore } from "../store"
import Uploader from "./Uploader"
import AvailableClip from "./AvailableClip"

const AvailableClips = () => {
  const { availableClips } = useStore()

  return (
    <div className="w-full flex flex-col gap-3">
      <Uploader />
      {availableClips.map((clip) => (
        <AvailableClip key={clip.source} clip={clip} />
      ))}
    </div>
  )
}

export default AvailableClips
