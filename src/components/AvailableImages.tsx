import { useCallback } from "react"
import { useStore } from "../store"
import { executeScript } from "../services/command/executeScript"

const AvailableImages = () => {
  const { availableImages, seek } = useStore()

  const addImage = useCallback(
    (image: string) => {
      executeScript([
        {
          command: "add_custom_element",
          args: [
            '"Image"',
            `"<img src="${image}" />"`,
            seek.toString(),
            (seek + 20).toString(),
          ],
        },
      ])
    },
    [seek]
  )

  return (
    <div className="flex flex-row flex-wrap gap-4">
      {availableImages.map((image) => (
        <div
          key={image}
          className="flex flex-col w-[calc(50%-0.5rem)] items-end gap-1 rounded-lg overflow-clip bg-base-100"
        >
          <img className="flex-shrink " key={image} src={image} alt={image} />
          <button
            className="btn btn-sm btn-ghost w-fit mr-1 mb-1"
            onClick={() => addImage(image)}
          >
            <i className="bi bi-plus-lg text-lg text-accent"></i>
          </button>
        </div>
      ))}
    </div>
  )
}

export default AvailableImages
