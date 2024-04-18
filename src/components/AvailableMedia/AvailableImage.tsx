import { useCallback, useMemo } from "react"
import { useStore } from "../../store"
import DeleteMediaButton from "./DeleteMediaButton"
import { Image } from "../../types/image"
import clsx from "clsx"
import { runCommands } from "../../services/interpreter/run"
import { addCustomElement } from "../../services/interpreter/builtin/addCustomElement"
import Sparkle from "../Sparkle"
import AddElementButton from "./AddElementButton"
import ChatContextTooltip from "./ChatContextTooltip"

const AvailableImage = (props: { image: Image }) => {
  const { parsedVideostrate, seek, deleteAvailableImage, isUiFrozen } =
    useStore()
  const { selectedImportableImage, setSelectedImportableImage } = useStore()

  const isSelected = useMemo(
    () => selectedImportableImage?.title === props.image.title,
    [selectedImportableImage, props.image.title]
  )

  const canBeDeleted = useMemo(() => {
    return !parsedVideostrate.images.some((i) => i.url === props.image.url)
  }, [parsedVideostrate.images, props.image])

  const addImage = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation()
      runCommands(
        addCustomElement(
          props.image.title,
          `<img src="${props.image.url}" alt="${props.image.title}" />`,
          seek,
          seek + 20
        )
      )
    },
    [props.image.title, props.image.url, seek]
  )

  const deleteImage = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation()
      deleteAvailableImage(props.image.url)
    },
    [deleteAvailableImage, props.image.url]
  )

  return (
    <ChatContextTooltip className="w-full" selected={isSelected}>
      <div
        className={clsx(
          "available-media relative flex flex-col  rounded-lg overflow-clip bg-base-100 border-2 cursor-pointer",
          isSelected
            ? "!border-accent"
            : "border-base-100 hover:border-gray-300"
        )}
        onClick={() => {
          if (isSelected) setSelectedImportableImage(null)
          else setSelectedImportableImage(props.image)
        }}
      >
        {isSelected && <Sparkle />}
        <img
          className="flex-shrink aspect-video object-cover"
          key={props.image.url}
          src={props.image.url}
          alt={props.image.title}
        />
        <div className="flex flex-row justify-between items-center m-1">
          <span className="overflow-hidden whitespace-nowrap text-ellipsis pl-1">
            {props.image.title}
          </span>
          <AddElementButton onClick={addImage} time={seek} />
        </div>
        <DeleteMediaButton
          disabled={!canBeDeleted || isUiFrozen}
          onClick={deleteImage}
        />
      </div>
    </ChatContextTooltip>
  )
}

export default AvailableImage
