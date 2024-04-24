import DeleteMediaButton from "./DeleteMediaButton"
import useScaledIframe from "../../hooks/useScaledIframe"
import { useCallback, useEffect, useMemo } from "react"
import { useStore } from "../../store"
import { WebstrateSerializationStrategy } from "../../services/serializationStrategies/webstrateSerializationStrategy"
import { CustomElement } from "../../types/videoElement"
import { runCommands } from "../../services/interpreter/run"
import { addCustomElement } from "../../services/interpreter/builtin/addCustomElement"
import clsx from "clsx"
import Sparkle from "../Sparkle"
import AddElementButton from "./AddElementButton"
import ChatContextTooltip from "./ChatContextTooltip"

const AvailableCustomElement = (props: { element: CustomElement }) => {
  const {
    iframeRef,
    iframeScale,
    iframeLeft,
    iframeTop,
    iframeWidth,
    iframeHeight,
    iframeContainerHeight,
  } = useScaledIframe()
  const {
    serializedVideostrate,
    deleteAvailableCustomElement,
    seek,
    isUiFrozen,
  } = useStore()
  const {
    selectedImportableCustomElement,
    setSelectedImportableCustomElement,
  } = useStore()

  const isSelected = useMemo(
    () => selectedImportableCustomElement?.id === props.element.id,
    [selectedImportableCustomElement, props.element.id]
  )

  const elementHtml = useMemo(() => {
    const serializer = new WebstrateSerializationStrategy()
    const serializedElement = serializer.serializeElement(props.element)
    console.log("serializedElement", serializedElement)
    return `<body style="width=${iframeWidth}px;height=${iframeHeight}px;overflow:hidden;margin:0;">${serializedElement}</bod>`
  }, [iframeHeight, iframeWidth, props.element])

  useEffect(() => {
    const updateStyle = () => {
      if (iframeRef.current?.contentWindow?.document) {
        const style =
          iframeRef.current.contentWindow.document.createElement("style")
        if (style) {
          console.log("setting style", serializedVideostrate.css)
          style.innerHTML = serializedVideostrate.css
          iframeRef.current.contentWindow.document.head.appendChild(style)
        }
      }
    }
    if (iframeRef.current) {
      iframeRef.current.onload = updateStyle
    }
  }, [iframeRef, serializedVideostrate.css])

  const addToTimeline = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation()
      runCommands(
        addCustomElement(
          props.element.name,
          props.element.content,
          seek,
          seek + 10
        )
      )
    },
    [props.element.name, props.element.content, seek]
  )

  const deleteElement = useCallback(() => {
    deleteAvailableCustomElement(props.element.id)
  }, [deleteAvailableCustomElement, props.element.id])

  return (
    <ChatContextTooltip className="w-full h-60" selected={isSelected}>
      <div
        className={clsx(
          "available-media relative flex flex-col rounded-lg overflow-clip bg-base-100 border-2 cursor-pointer",
          isSelected
            ? "!border-accent"
            : "border-base-100 hover:border-gray-300"
        )}
        onClick={() => {
          console.log("clicked")
          if (isSelected) setSelectedImportableCustomElement(null)
          else setSelectedImportableCustomElement(props.element)
        }}
      >
        {isSelected && <Sparkle />}
        <div
          className="w-full h-full overflow-hidden min-h-0 min-w-0"
          style={{
            height: `${iframeContainerHeight}px`,
            minHeight: `${iframeContainerHeight}px`,
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={elementHtml}
            className="relative"
            style={{
              width: `${iframeWidth}px`,
              height: `${iframeHeight}px`,
              scale: `${iframeScale}`,
              left: `${iframeLeft}px`,
              top: `${iframeTop}px`,
            }}
          ></iframe>
        </div>
        <div className="flex flex-row justify-between items-center m-1">
          <span className="overflow-hidden whitespace-nowrap text-ellipsis pl-1">
            {props.element.name}
          </span>

          <AddElementButton onClick={addToTimeline} time={seek} />
        </div>
        <DeleteMediaButton disabled={isUiFrozen} onClick={deleteElement} />
      </div>
    </ChatContextTooltip>
  )
}

export default AvailableCustomElement
