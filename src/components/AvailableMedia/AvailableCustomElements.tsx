import { useStore } from "../../store"
import AvailableCustomElement from "./AvailableCustomElement"
import ImageUploader from "./ImageUploader"

const AvailableCustomElements = () => {
  const { availableCustomElements } = useStore()
  return (
    <div className="flex flex-row flex-wrap gap-4">
      <ImageUploader />
      {availableCustomElements.map((element) => (
        <AvailableCustomElement key={element.name} element={element} />
      ))}
    </div>
  )
}

export default AvailableCustomElements
