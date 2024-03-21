import { useEffect, useRef, useState } from "react"

type BrowserProps = {
  html: string
  highlight: (element: HTMLElement) => void
  isHighlighting: boolean
}

const styleElementId = "gpterraform-highlight-style"

const Browser = ({ html, highlight, isHighlighting }: BrowserProps) => {
  const [cursor, setCursor] = useState("default")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument?.head) return

    const highlightListener = (event: MouseEvent) => {
      highlight(event?.target as HTMLElement)
    }

    const handleLoad = () => {
      let styleElement = iframe?.contentDocument?.getElementById(styleElementId)

      if (!styleElement) {
        styleElement = iframe.contentDocument?.createElement(
          "style"
        ) as HTMLStyleElement
        ;(styleElement as HTMLStyleElement).type = "text/css"
        styleElement.id = styleElementId
        iframe.contentDocument?.head.appendChild(styleElement)
      }

      styleElement.innerHTML = isHighlighting
        ? `*:hover { outline: 2px solid orange; }`
        : ""

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
  }, [highlight, isHighlighting])

  useEffect(() => {
    setCursor(isHighlighting ? "crosshair" : "default")
  }, [isHighlighting])

  return (
    <iframe
      className="relative w-full h-full border-none"
      ref={iframeRef}
      srcDoc={html}
      onClick={(e) => isHighlighting && highlight(e.target as HTMLElement)}
      style={{ cursor }}
    ></iframe>
  )
}

export default Browser
