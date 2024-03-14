import { useCallback, useContext, useEffect, useMemo } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import ClipContent from "./ClipContent"
import { useStore } from "../../store"
import { TimelineContext } from "./Timeline"
import { executeScript } from "../../services/command/executeScript"
import useDraggable from "../../hooks/useDraggable"
import clsx from "clsx"
import { useEditedClipDetails } from "../../store/editedClipDetails"

const MIN_ELEMENT_WIDTH = 16

const Clip = (props: { clip: TimelineElement }) => {
  const { clip } = props
  const timeline = useContext(TimelineContext)
  const { selectedClipId, setSelectedClipId, availableClips } = useStore()

  const minLeftCrop = useMemo(
    () =>
      clip.type === "video"
        ? -clip.offset * timeline.widthPerSecond
        : -clip.left,
    [clip.left, clip.offset, clip.type, timeline.widthPerSecond]
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
  const { onDragStart, onDrag, draggedPosition } = useDraggable(
    clip.left + cropLeft,
    0
  )

  const widthInitial = useMemo(
    () => Math.max(clip.width - cropLeft, MIN_ELEMENT_WIDTH),
    [clip.width, cropLeft]
  )

  const maxRightCrop = useMemo(() => {
    if (clip.type !== "video") return undefined
    else {
      const clipMetadata = availableClips.find((c) => c.source === clip.source)
      if (!clipMetadata || !clipMetadata.length) return undefined
      return (clipMetadata.length - clip.offset) * timeline.widthPerSecond
    }
  }, [
    availableClips,
    clip.offset,
    clip.source,
    clip.type,
    timeline.widthPerSecond,
  ])

  const {
    onDragStart: onDragRightStart,
    onDrag: onDragRight,
    draggedPosition: width,
  } = useDraggable(widthInitial, MIN_ELEMENT_WIDTH, maxRightCrop)

  const { setPosition, setDetails } = useEditedClipDetails()

  const onDragMoveEnd = useCallback(
    (e: React.DragEvent) => {
      const clipShift = onDrag(e)
      const clipTimeShift = clipShift / timeline.widthPerSecond
      executeScript([
        {
          command: "move_delta",
          args: [`"${clip.id}"`, clipTimeShift.toString()],
        },
      ])
    },
    [onDrag, timeline.widthPerSecond, clip.id]
  )

  const onCropRightEnd = useCallback(
    (e: React.DragEvent) => {
      const widthShift = onDragRight(e)
      const widthTimeShift = widthShift / timeline.widthPerSecond
      executeScript([
        {
          command: "crop",
          args: [
            `"${clip.id}"`,
            clip.offset.toString(),
            (clip.offset - clip.start + clip.end + widthTimeShift).toString(),
          ],
        },
      ])
    },
    [
      onDragRight,
      timeline.widthPerSecond,
      clip.id,
      clip.offset,
      clip.start,
      clip.end,
    ]
  )

  const cropCustomElement = useCallback(
    (cropTimeShift: number) => {
      executeScript([
        {
          command: "move_delta",
          args: [`"${clip.id}"`, cropTimeShift.toString()],
        },
        {
          command: "crop",
          args: [
            `"${clip.id}"`,
            clip.offset.toString(),
            (clip.offset - clip.start + clip.end - cropTimeShift).toString(),
          ],
        },
      ])
    },
    [clip.id, clip.offset, clip.start, clip.end]
  )

  const cropVideoElement = useCallback(
    (cropTimeShift: number) => {
      const newOffset = clip.offset + cropTimeShift
      executeScript([
        {
          command: "crop",
          args: [
            `"${clip.id}"`,
            newOffset.toString(),
            (clip.end + newOffset - clip.start - cropTimeShift).toString(),
          ],
        },
        {
          command: "move_delta",
          args: [`"${clip.id}"`, cropTimeShift.toString()],
        },
      ])
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
    },
    [
      onDragLeft,
      timeline.widthPerSecond,
      clip.type,
      cropCustomElement,
      cropVideoElement,
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
        <div
          className="absolute m-0 top-0 h-10 z-10"
          onMouseOver={() => setDetails(clip.edits?.map((e) => e.description))}
          onMouseMove={onMouseOver}
          onMouseLeave={() => {
            setDetails(undefined)
          }}
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
      </div>
    </>
  )
}

export default Clip
