import { useStore } from "../store"
import AvailableImage from "./AvailableImage"
import ImageUploader from "./ImageUploader"

const AvailableImages = () => {
  const { availableImages } = useStore()
  return (
    <div className="flex flex-row flex-wrap gap-4">
      <ImageUploader />
      {availableImages.map((image) => (
        <AvailableImage key={image.url} image={image} />
      ))}
    </div>
  )
}

export default AvailableImages
