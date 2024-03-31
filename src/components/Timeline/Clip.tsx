import { useCallback, useContext, useEffect, useMemo } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import ClipContent from "./ClipContent"
import { useStore } from "../../store"
import { TimelineContext } from "./Timeline"
import useDraggable from "../../hooks/useDraggable"
import clsx from "clsx"
import { useEditedClipDetails } from "../../store/editedClipDetails"
import useContextMenu from "../../hooks/useContextMenu"
import ContextMenu from "../ContextMenu"
import { useNavigate } from "react-router-dom"
import { CustomElement } from "../../types/videoElement"
import { runCommands } from "../../services/interpreter/run"
import { moveDelta } from "../../services/interpreter/builtin/moveDelta"
import { crop } from "../../services/interpreter/builtin/crop"
import { moveDeltaWithoutEmbedded } from "../../services/interpreter/builtin/moveDeltaWithoutEmbedded"

const MIN_ELEMENT_WIDTH = 16

const Clip = (props: { clip: TimelineElement }) => {
  const { clip } = props
  const timeline = useContext(TimelineContext)
  const {
    selectedClipId,
    setSelectedClipId,
    availableClips,
    pendingChanges,
    addAvailableCustomElement,
  } = useStore()

  const minLeftCrop = useMemo(
    () =>
      clip.type === "video"
        ? Math.max(
            -clip.offset * timeline.widthPerSecond,
            -clip.left + (clip.minLeftPosition || 0)
          )
        : -clip.left + (clip.minLeftPosition || 0),
    [
      clip.left,
      clip.minLeftPosition,
      clip.offset,
      clip.type,
      timeline.widthPerSecond,
    ]
  )

  const {
    onDragStart: onDragLeftStart,
    onDrag: onDragLeft,
    draggedPosition: cropLeft,
    setDraggedPosition: setCropLeft,
  } = useDraggable(0, minLeftCrop, clip.width - MIN_ELEMENT_WIDTH)

  useEffect(() => {
    // Reset cropLeft after the crop is applied
    setCropLeft(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip.left])

  const { onDragStart, onDrag, draggedPosition, setDraggedPosition } =
    useDraggable(
      clip.left + cropLeft,
      clip.minLeftPosition || 0,
      clip.maxRightPosition
    )

  const widthInitial = useMemo(
    () => Math.max(clip.width - cropLeft, MIN_ELEMENT_WIDTH),
    [clip.width, cropLeft]
  )

  const clipMetadata = useMemo(
    () => availableClips.find((c) => c.source === clip.source),
    [availableClips, clip.source]
  )

  const maxRightCrop = useMemo(() => {
    if (clip.type !== "video")
      return (
        clip.maxRightPosition && clip.maxRightPosition + -clip.left + clip.width
      )
    else {
      if (!clipMetadata || !clipMetadata.length)
        return (
          clip.maxRightPosition &&
          clip.maxRightPosition + -clip.left + clip.width
        )
      return Math.min(
        (clipMetadata.length - clip.offset) * timeline.widthPerSecond,
        (clip.maxRightPosition || Infinity) - clip.left + clip.width
      )
    }
  }, [
    clip.left,
    clip.maxRightPosition,
    clip.offset,
    clip.type,
    clip.width,
    clipMetadata,
    timeline.widthPerSecond,
  ])

  const {
    onDragStart: onDragRightStart,
    onDrag: onDragRight,
    draggedPosition: width,
    setDraggedPosition: setWidth,
  } = useDraggable(widthInitial, MIN_ELEMENT_WIDTH, maxRightCrop)

  const { setPosition, setDetails } = useEditedClipDetails()
  const navigate = useNavigate()
  const menuItems = useMemo(() => {
    if (clip.type !== "custom") return []
    return [
      { label: "Edit code", action: () => navigate(`/code/${clip.id}`) },
      {
        label: "Add to the library",
        action: () =>
          addAvailableCustomElement(
            new CustomElement({
              ...clip,
              start: 0,
              end: 0,
              offset: 0,
              content: clip.content!,
            })
          ),
      },
    ]
  }, [addAvailableCustomElement, clip, navigate])
  const { showMenu, hideMenu, menuPosition, isVisible } = useContextMenu(
    menuItems.length
  )

  const onDragMoveEnd = useCallback(
    (e: React.DragEvent) => {
      const clipShift = onDrag(e)
      const clipTimeShift = clipShift / timeline.widthPerSecond
      runCommands(moveDelta(clip.id, clipTimeShift))
      // Reset the dragged position to the original position in case the drag didn't move the clip in which case a rerender wouldn't be triggered
      // SetTimeout is used to ensure the draggedPosition is set after the rerender, so that there is no flickering if the dragging moved the object
      setTimeout(() => setDraggedPosition(clip.left + cropLeft), 0)
    },
    [
      clip.id,
      clip.left,
      cropLeft,
      onDrag,
      setDraggedPosition,
      timeline.widthPerSecond,
    ]
  )

  const onCropRightEnd = useCallback(
    (e: React.DragEvent) => {
      const widthShift = onDragRight(e)
      const widthTimeShift = widthShift / timeline.widthPerSecond
      runCommands(
        crop(
          clip.id,
          clip.offset,
          clip.offset - clip.start + clip.end + widthTimeShift
        )
      )
      // Explanation in onDragMoveEnd
      setTimeout(() => setWidth(widthInitial), 0)
    },
    [
      onDragRight,
      timeline.widthPerSecond,
      clip.id,
      clip.offset,
      clip.start,
      clip.end,
      setWidth,
      widthInitial,
    ]
  )

  const cropCustomElement = useCallback(
    (cropTimeShift: number) => {
      runCommands(
        moveDelta(clip.id, cropTimeShift),
        crop(
          clip.id,
          clip.offset,
          clip.offset - clip.start + clip.end - cropTimeShift
        )
      )
    },
    [clip.id, clip.offset, clip.start, clip.end]
  )

  const cropVideoElement = useCallback(
    (cropTimeShift: number) => {
      const newOffset = clip.offset + cropTimeShift
      runCommands(
        crop(
          clip.id,
          newOffset,
          clip.end + newOffset - clip.start - cropTimeShift
        ),
        moveDeltaWithoutEmbedded(clip.id, cropTimeShift)
      )
    },
    [clip.offset, clip.id, clip.end, clip.start]
  )

  const onCropLeftEnd = useCallback(
    (e: React.DragEvent) => {
      const cropShift = onDragLeft(e)
      const cropTimeShift = cropShift / timeline.widthPerSecond
      if (clip.type !== "video") {
        cropCustomElement(cropTimeShift)
      } else {
        cropVideoElement(cropTimeShift)
      }
      // Explanation in onDragMoveEnd
      setTimeout(() => setCropLeft(0), 0)
    },
    [
      onDragLeft,
      timeline.widthPerSecond,
      clip.type,
      cropCustomElement,
      cropVideoElement,
      setCropLeft,
    ]
  )

  const onMouseOver = useCallback(
    (e: React.MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: window.innerHeight - e.clientY,
      })
    },
    [setPosition]
  )

  const isSelected = useMemo(
    () => selectedClipId === clip.id,
    [selectedClipId, clip.id]
  )

  const handleWidth = useMemo(
    () => (width > 50 ? "w-4 min-w-4" : "w-1 min-w-1"),
    [width]
  )

  const sourceClipLeft = useMemo(
    () => draggedPosition - cropLeft - clip.offset * timeline.widthPerSecond,
    [clip.offset, cropLeft, draggedPosition, timeline.widthPerSecond]
  )

  const sourceClipWidth = useMemo(() => {
    if (!clipMetadata?.length) return 0
    const sourceClipWidth = clipMetadata.length * timeline.widthPerSecond
    if (sourceClipWidth + sourceClipLeft > timeline.width) {
      return timeline.width - sourceClipLeft - 1
    }
    return sourceClipWidth
  }, [
    clipMetadata?.length,
    sourceClipLeft,
    timeline.width,
    timeline.widthPerSecond,
  ])

  return (
    <>
      <div className={clsx("w-full", clip.oldElement ? "h-14" : "h-10")}>
        {clip.oldElement && (
          <div
            className="absolute m-0 top-4 h-10"
            style={{
              width: `${Math.max(clip.oldElement.width, MIN_ELEMENT_WIDTH)}px`,
              left: `${clip.oldElement.left}px`,
            }}
          >
            <ClipContent clip={clip.oldElement} isOldClip={true} />
          </div>
        )}
        {isSelected && !pendingChanges && clipMetadata?.length && (
          <div
            className="absolute m-0 top-0 h-10"
            style={{
              width: `${sourceClipWidth}px`,
              left: `${sourceClipLeft}px`,
            }}
          >
            <div className="w-full h-full rounded-lg bg-slate-500 opacity-10 border-2 border-accent"></div>
          </div>
        )}
        <div
          className="absolute m-0 top-0 h-10 z-10"
          onMouseOver={() => setDetails(clip.edits?.map((e) => e.description))}
          onMouseMove={onMouseOver}
          onMouseLeave={() => {
            setDetails(undefined)
          }}
          onContextMenu={showMenu}
          style={{
            width: `${width}px`,
            left: `${draggedPosition}px`,
          }}
        >
          <ClipContent
            clip={clip}
            left={
              isSelected && (
                <div
                  className={clsx(
                    "cursor-e-resize bg-accent h-full overflow-clip flex items-center justify-center gap-1 transition-opacity",
                    handleWidth
                  )}
                  draggable={true}
                  onDrag={onDragLeft}
                  onDragStart={(e) => {
                    onDragLeftStart(e)
                  }}
                  onDragEnd={onCropLeftEnd}
                >
                  <div className="w-[2px] h-6 rounded bg-secondary-content" />
                  <div className="w-[2px] h-6 rounded bg-secondary-content" />
                </div>
              )
            }
            center={
              <div
                className={clsx(
                  "w-full flex-shrink min-w-0 text-left transition-all px-1 flex items-center"
                )}
                draggable={true}
                onDrag={onDrag}
                onDragStart={(e) => {
                  onDragStart(e)
                  setSelectedClipId(clip.id)
                }}
                onDragEnd={onDragMoveEnd}
              >
                <div className="overflow-hidden  whitespace-nowrap text-ellipsis w-full">
                  {width > 24 && clip.type !== "video" ? `${clip.name}` : ""}
                </div>
              </div>
            }
            right={
              isSelected && (
                <div
                  className={clsx(
                    "cursor-e-resize bg-accent h-full overflow-clip flex items-center justify-center gap-1 transition-opacity",
                    handleWidth
                  )}
                  draggable={true}
                  onDrag={onDragRight}
                  onDragStart={(e) => {
                    onDragRightStart(e)
                  }}
                  onDragEnd={onCropRightEnd}
                >
                  <div className="w-[2px] h-6 rounded bg-secondary-content" />
                  <div className="w-[2px] h-6 rounded bg-secondary-content" />
                </div>
              )
            }
          />
        </div>
        <ContextMenu
          items={menuItems}
          position={menuPosition}
          visible={isVisible}
          onClose={hideMenu}
        />
      </div>
    </>
  )
}

export default Clip
