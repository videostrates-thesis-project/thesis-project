import { useMemo } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import { useStore } from "../../store"
import clsx from "clsx"

const ClipContent = (props: { clip: TimelineElement }) => {
  const { clip } = props
  const { selectedClipId, setSelectedClipId } = useStore()

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

  const title = useMemo(
    () => (clip.type === "video" ? "" : `${clip.type} ${clip.nodeType}`),
    [clip.type, clip.nodeType]
  )

  return (
    <div
      key={clip.id}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
      className={clsx(
        "bg-primary rounded-lg text-primary-content border-2 flex items-center px-1 w-full h-full",
        selectedClipId === clip.id ? "border-accent" : "border-transparent"
      )}
      onClick={() => setSelectedClipId(clip.id)}
      style={{
        ...backgroundStyle,
      }}
    >
      <span className="overflow-hidden whitespace-nowrap text-ellipsis w-full text-left">
        {title}
      </span>
    </div>
  )
}

export default ClipContent
