import { useStore } from "../../store"
import AvailableCustomElement from "./AvailableCustomElement"

const AvailableCustomElements = () => {
  const { availableCustomElements } = useStore()
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {availableCustomElements.map((element) => (
        <AvailableCustomElement key={element.name} element={element} />
      ))}
    </div>
  )
}

export default AvailableCustomElements
