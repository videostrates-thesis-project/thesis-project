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

  const deleteImage = useCallback(() => {
    setAvailableImages(availableImages.filter((i) => i.url !== props.image.url))
  }, [availableImages, props.image.url, setAvailableImages])

  return (
    <div className="available-media relative flex flex-col w-[calc(50%-0.5rem)] items-end gap-1 rounded-lg overflow-clip bg-base-100">
      <img
        className="flex-shrink "
        key={props.image.url}
        src={props.image.url}
        alt={props.image.title}
      />
      <button
        className="btn btn-sm btn-ghost w-fit mr-1 mb-1"
        onClick={() => addImage(props.image.url)}
      >
        <i className="bi bi-plus-lg text-lg text-accent"></i>
      </button>
      <DeleteMediaButton
        className="btn-neutral"
        disabled={!canBeDeleted}
        onClick={deleteImage}
      />
    </div>
  )
}

export default AvailableImage
