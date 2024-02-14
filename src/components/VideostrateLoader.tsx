import { useEffect, useRef } from "react"
import { useStore } from "../store"
import { parseVideostrate } from "../services/videostrateParser"
import { serializeVideostrate } from "../services/videostrateSerializer"

const VideostrateLoader = () => {
  const { videostrateUrl, setParsedVideostrate, parsedVideostrate } = useStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data.type === "htmlContent") {
        const parsed = parseVideostrate(event.data.html)
        setParsedVideostrate(parsed)
      }
    }
    window.addEventListener("message", listener)

    return () => {
      window.removeEventListener("message", listener)
    }
  }, [setParsedVideostrate])

  useEffect(() => {
    const html = serializeVideostrate(parsedVideostrate)
    const iframeWindow = iframeRef.current?.contentWindow
    iframeWindow?.postMessage(
      {
        type: "videostrate",
        payload: {
          text: html,
        },
      },
      "*"
    )
  }, [parsedVideostrate])

  return <iframe ref={iframeRef} className="hidden" src={videostrateUrl} />
}

export default VideostrateLoader
