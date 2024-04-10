import { useEffect, useRef, useState } from "react"
import useScaledIframe from "../../hooks/useScaledIframe"

type BrowserProps = {
  html: string
  highlight: (element: HTMLElement | null) => void
  isHighlighting: boolean
  highlightedElement?: HTMLElement | null
}

const styleElementId = "videostrates-highlight-style"

const Browser = ({
  html,
  highlight,
  isHighlighting,
  highlightedElement,
}: BrowserProps) => {
  const [cursor, setCursor] = useState("default")
  const {
    iframeRef,
    iframeScale,
    iframeLeft,
    iframeTop,
    iframeWidth,
    iframeHeight,
    iframeContainerHeight,
  } = useScaledIframe()
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const currentHighlighted = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current

    if (!iframeLoaded) return
    if (!iframe?.contentDocument?.head) return

    const highlightListener = (event: MouseEvent) => {
      if (
        currentHighlighted.current !== null &&
        currentHighlighted.current === event.target
      ) {
        highlight(null)
        currentHighlighted.current.style.outline = ""
        currentHighlighted.current = null
        return
      }

      highlight(event?.target as HTMLElement)
      if (currentHighlighted.current !== null) {
        currentHighlighted.current.style.outline = ""
        currentHighlighted.current = null
      }

      currentHighlighted.current = event.target as HTMLElement
      currentHighlighted.current.style.outline = "2px solid orange"
    }

    const handleLoad = () => {
      let styleElement = iframe?.contentDocument?.getElementById(styleElementId)
      console.log("Browser", styleElement)

      if (!styleElement) {
        styleElement = iframe.contentDocument?.createElement(
          "style"
        ) as HTMLStyleElement
        ;(styleElement as HTMLStyleElement).type = "text/css"
        styleElement.id = styleElementId
        iframe.contentDocument?.head.appendChild(styleElement)
        console.log("Browser", styleElement)
      }

      styleElement.innerHTML = isHighlighting
        ? `*:hover { outline: 2px solid orange; } * { cursor: crosshair; }`
        : ""

      console.log("Browser", styleElement.innerHTML)

      iframe.contentWindow?.document.body.removeEventListener(
        "click",
        highlightListener
      )

      iframe.contentWindow?.document.body.addEventListener(
        "click",
        highlightListener
      )
    }

    handleLoad()

    iframe.addEventListener("load", handleLoad)

    return () => {
      iframe.removeEventListener("load", handleLoad)
    }
  }, [highlight, isHighlighting, iframeLoaded, iframeRef])

  useEffect(() => {
    if (currentHighlighted.current !== null && !highlightedElement) {
      highlight(null)
      const highlighted = currentHighlighted.current as HTMLElement
      highlighted.style.outline = ""
      currentHighlighted.current = null
      return
    }
  }, [highlight, highlightedElement])

  useEffect(() => {
    setCursor(isHighlighting ? "crosshair" : "default")
  }, [isHighlighting])

  return (
    <div
      className="w-full h-full overflow-hidden min-h-0 min-w-0 shrink-0"
      style={{ height: iframeContainerHeight }}
    >
      <iframe
        className="relative w-full h-full border-none"
        ref={iframeRef}
        srcDoc={html}
        onClick={(e) => isHighlighting && highlight(e.target as HTMLElement)}
        style={{
          cursor,
          width: `${iframeWidth}px`,
          height: `${iframeHeight}px`,
          scale: `${iframeScale}`,
          left: `${iframeLeft}px`,
          top: `${iframeTop}px`,
        }}
        onLoad={() => setIframeLoaded(true)}
      ></iframe>
    </div>
  )
}

export default Browser
