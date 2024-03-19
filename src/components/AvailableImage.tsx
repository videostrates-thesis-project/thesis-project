import { useCallback, useMemo } from "react"
import { useStore } from "../store"
import { executeScript } from "../services/command/executeScript"
import DeleteMediaButton from "./DeleteMediaButton"
import { Image } from "../types/image"

const AvailableImage = (props: { image: Image }) => {
  const { parsedVideostrate, seek, availableImages, setAvailableImages } =
    useStore()

  const canBeDeleted = useMemo(() => {
    return !parsedVideostrate.images.some((i) => i.url === props.image.url)
  }, [parsedVideostrate.images, props.image])

  const addImage = useCallback(() => {
    executeScript([
      {
        command: "add_custom_element",
        args: [
          '"Image"',
          `"<img src="${props.image.url}" alt="${props.image.title}" />"`,
          seek.toString(),
          (seek + 20).toString(),
        ],
      },
    ])
  }, [props.image.title, props.image.url, seek])

  const deleteImage = useCallback(() => {
    setAvailableImages(availableImages.filter((i) => i.url !== props.image.url))
  }, [availableImages, props.image.url, setAvailableImages])

  return (
    <div className="available-media relative flex flex-col w-[calc(50%-0.5rem)] rounded-lg overflow-clip bg-base-100">
      <img
        className="flex-shrink aspect-square object-cover"
        key={props.image.url}
        src={props.image.url}
        alt={props.image.title}
      />
      <div className="flex flex-row justify-between items-center m-1">
        <span className="overflow-hidden whitespace-nowrap text-ellipsis pl-1">
          {props.image.title}
        </span>

        <button className="btn btn-sm btn-ghost w-fit" onClick={addImage}>
          <i className="bi bi-plus-lg text-lg text-accent"></i>
        </button>
      </div>
      <DeleteMediaButton
        className="btn-neutral"
        disabled={!canBeDeleted}
        onClick={deleteImage}
      />
    </div>
  )
}

export default AvailableImage
