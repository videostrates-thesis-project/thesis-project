import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TimelineElement } from "../../hooks/useTimelineElements"
import { useStore } from "../../store"
import clsx from "clsx"

const ClipContent = (props: { clip: TimelineElement }) => {
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
    () => (clip.type === "video" ? "" : `${clip.type} ${clip.nodeType}`),
    [clip.type, clip.nodeType]
  )

  const hideResizeHandle = useMemo(
    () => selectedClipId !== clip.id || width < 50,
    [selectedClipId, clip.id, width]
  )

  return (
    <div
      ref={ref}
      key={clip.id}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
      className={clsx(
        "bg-primary rounded-lg text-primary-content border-2 flex items-center px-1 w-full h-full cursor-pointer overflow-clip relative transition-colors duration-400",
        selectedClipId === clip.id
          ? "border-accent"
          : "border-transparent hover:border-gray-300"
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
        <div className="w-[2px] h-6 rounded bg-primary" />
        <div className="w-[2px] h-6 rounded bg-primary" />
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
        <div className="w-[2px] h-6 rounded bg-primary" />
        <div className="w-[2px] h-6 rounded bg-primary" />
      </div>
    </div>
  )
}

export default ClipContent
