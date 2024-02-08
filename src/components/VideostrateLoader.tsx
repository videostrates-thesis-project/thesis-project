import { useEffect } from "react"
import { useStore } from "../store"
import { parseVideostrate } from "../services/videostrateParser"

const VideostrateLoader = () => {
  const { videostrateUrl, setParsedVideostrate } = useStore()

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

  return <iframe className="hidden" src={videostrateUrl} />
}

export default VideostrateLoader
