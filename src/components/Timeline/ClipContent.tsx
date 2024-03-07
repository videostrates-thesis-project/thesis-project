import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import { useStore } from "../../store"
import clsx from "clsx"

const ClipContent = (props: { clip: TimelineElement; isOldClip?: boolean }) => {
  const { clip } = props
  const { selectedClipId, setSelectedClipId } = useStore()
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const updateWidth = useCallback(() => {
    if (ref.current) {
      setWidth(ref.current.clientWidth)
    }
  }, [ref])

  useEffect(() => {
    const current = ref.current?.parentNode as HTMLElement
    const resizeObserver = new ResizeObserver(updateWidth)
    if (current) resizeObserver.observe(current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, updateWidth])

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
    () => (clip.type === "video" ? "" : `${clip.name}`),
    [clip.type, clip.name]
  )

  const isSelected = useMemo(
    () => !props.isOldClip && selectedClipId === clip.id,
    [props.isOldClip, selectedClipId, clip.id]
  )

  const hideResizeHandle = useMemo(
    () => !isSelected || width < 50,
    [isSelected, width]
  )

  return (
    <div
      ref={ref}
      key={clip.id}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
      className={clsx(
        "bg-primary rounded-lg text-primary-content border-2 flex items-center px-1 w-full h-full cursor-pointer overflow-clip relative transition-all duration-400",
        props.isOldClip
          ? "opacity-30 border-transparent"
          : isSelected
            ? "border-accent"
            : "border-transparent hover:border-gray-300",
        clip.edits && "highlight-clip"
      )}
      onClick={() => setSelectedClipId(clip.id)}
      style={{
        ...backgroundStyle,
      }}
    >
      <div
        className={clsx(
          "bg-accent w-4 h-full absolute left-0 flex items-center justify-center gap-1 transition-opacity",
          hideResizeHandle ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="w-[2px] h-6 rounded bg-secondary-content" />
        <div className="w-[2px] h-6 rounded bg-secondary-content" />
      </div>
      <span
        className={clsx(
          "overflow-hidden whitespace-nowrap text-ellipsis w-full text-left transition-all",
          !hideResizeHandle && "mx-4"
        )}
      >
        {title}
      </span>
      <div
        className={clsx(
          "bg-accent w-4 h-full absolute right-0 flex items-center justify-center gap-1 transition-opacity",
          hideResizeHandle ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="w-[2px] h-6 rounded bg-secondary-content" />
        <div className="w-[2px] h-6 rounded bg-secondary-content" />
      </div>
    </div>
  )
}

export default ClipContent
