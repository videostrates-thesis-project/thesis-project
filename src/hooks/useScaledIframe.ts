import { useCallback, useEffect, useRef, useState } from "react"

const VIDEO_WIDTH = 1280
const VIDEO_HEIGHT = 720
const VIDEO_ASPECT_RATIO = VIDEO_WIDTH / VIDEO_HEIGHT

const useScaledIframe = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeScale, setIframeScale] = useState(1)
  const [iframeLeft, setIframeLeft] = useState(0)
  const [iframeTop, setIframeTop] = useState(0)
  const [iframeContainerHeight, setIframeContainerHeight] = useState(720)

  const updateIframeSize = useCallback(() => {
    const target = iframeRef.current?.parentNode as HTMLElement
    if (!target) return
    const maxContainerHeight = (target.parentNode as HTMLElement).clientHeight
    const newContainerHeight = Math.min(
      target.clientWidth / VIDEO_ASPECT_RATIO,
      maxContainerHeight
    )
    const newIframeScale = Math.min(
      target.clientWidth / VIDEO_WIDTH,
      newContainerHeight / VIDEO_HEIGHT
    )
    setIframeScale(newIframeScale)
    setIframeLeft((target.clientWidth - VIDEO_WIDTH) / 2)
    setIframeTop((newContainerHeight - VIDEO_HEIGHT) / 2)
    setIframeContainerHeight(newContainerHeight)
  }, [iframeRef])

  useEffect(() => {
    updateIframeSize()
    const current = iframeRef.current?.parentNode as HTMLElement
    const resizeObserver = new ResizeObserver(updateIframeSize)
    if (current) resizeObserver.observe(current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [updateIframeSize, iframeRef])

  return {
    iframeRef,
    iframeScale,
    iframeLeft,
    iframeTop,
    iframeWidth: VIDEO_WIDTH,
    iframeHeight: VIDEO_HEIGHT,
    iframeContainerHeight,
  }
}

export default useScaledIframe
