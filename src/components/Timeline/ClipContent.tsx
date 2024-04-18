import { ReactElement, useMemo, useRef } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import { useStore } from "../../store"
import clsx from "clsx"
import { VideoClipElement } from "../../types/videoElement"

const ClipContent = (props: {
  clip: TimelineElement
  isOldClip?: boolean
  left?: ReactElement | false
  center?: ReactElement | false
  right?: ReactElement | false
}) => {
  const { clip } = props
  const { selectedClip, setSelectedClip, isUiFrozen } = useStore()
  const ref = useRef<HTMLDivElement>(null)

  const isSelected = useMemo(
    () =>
      (!props.isOldClip && selectedClip?.id === clip.id) ||
      (clip.type == "video" &&
        (clip as VideoClipElement).containerElementId &&
        (clip as VideoClipElement).containerElementId === selectedClip?.id),
    [props.isOldClip, selectedClip, clip]
  )

  const backgroundStyle = useMemo(
    () =>
      clip.type === "video"
        ? {
            backgroundImage: `url(${clip.thumbnail})`,
            backgroundSize: "auto 100%",
            backgroundPosition: `${isSelected ? "2" : "0"}px 0px`,
          }
        : {},
    [clip.thumbnail, clip.type, isSelected]
  )

  const clipHighlight = useMemo(() => {
    if (clip.edits) {
      if (clip.edits.some((edit) => edit.changeType === "Removed")) {
        return "highlight-clip-removed"
      } else if (clip.edits.some((edit) => edit.changeType === "New")) {
        return "highlight-clip-new"
      } else {
        return "highlight-clip"
      }
    }
    return ""
  }, [clip.edits])

  return (
    <div
      ref={ref}
      key={clip.id}
      onMouseDown={(e) => {
        if (!props.isOldClip) e.stopPropagation()
      }}
      className={clsx(
        "bg-primary rounded-lg text-primary-content border-2 flex flex-row justify-between w-full h-full overflow-clip relative duration-400",
        clipHighlight,
        props.isOldClip
          ? "opacity-30 border-transparent"
          : isSelected
            ? "!border-accent border-x-0 cursor-pointer"
            : "border-base-100 cursor-pointer hover:border-gray-300",
        isUiFrozen && "cursor-not-allowed"
      )}
      onClick={() => {
        if (selectedClip?.id === clip.id) setSelectedClip(null)
        else setSelectedClip(clip)
      }}
      style={{
        ...backgroundStyle,
      }}
    >
      {props.left}
      {props.center}
      {props.right}
    </div>
  )
}

export default ClipContent
