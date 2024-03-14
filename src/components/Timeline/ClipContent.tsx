import { ReactElement, useMemo, useRef } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import { useStore } from "../../store"
import clsx from "clsx"

const ClipContent = (props: {
  clip: TimelineElement
  isOldClip?: boolean
  left?: ReactElement | false
  center?: ReactElement | false
  right?: ReactElement | false
}) => {
  const { clip } = props
  const { selectedClipId, setSelectedClipId } = useStore()
  const ref = useRef<HTMLDivElement>(null)

  const backgroundStyle = useMemo(
    () =>
      clip.type === "video"
        ? {
            backgroundImage: `url(${clip.thumbnail})`,
            backgroundSize: "auto 100%",
          }
        : {},
    [clip.thumbnail, clip.type]
  )

  const isSelected = useMemo(
    () => !props.isOldClip && selectedClipId === clip.id,
    [props.isOldClip, selectedClipId, clip.id]
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
        e.stopPropagation()
      }}
      className={clsx(
        "bg-primary rounded-lg text-primary-content border-2 flex items-center w-full h-full cursor-pointer overflow-clip relative transition-all duration-400",
        clipHighlight,
        props.isOldClip
          ? "opacity-30 border-transparent"
          : isSelected
            ? "!border-accent border-x-0"
            : "border-transparent hover:border-gray-300"
      )}
      onClick={() => {
        if (selectedClipId === clip.id) setSelectedClipId(null)
        else setSelectedClipId(clip.id)
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
