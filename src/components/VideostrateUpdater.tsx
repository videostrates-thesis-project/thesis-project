import { useCallback, useEffect, useRef } from "react"
import { useStore } from "../store"
import { parseVideostrate } from "../services/videostrateParser"

enum UpdaterCommands {
  Load = "load",
  Update = "update",
}

const VideostrateUpdater = (props: { updaterUrl: string }) => {
  const {
    videostrateUrl,
    serializedVideostrate,
    setParsedVideostrate,
    setMetamaxRealm,
  } = useStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const iframeWindow = iframeRef.current?.contentWindow

  const controlVideostrate = useCallback(
    (command: UpdaterCommands, args?: object) => {
      iframeWindow?.postMessage(
        {
          type: "videostrate-control",
          command: command,
          args: args,
        },
        "*"
      )
    },
    [iframeWindow]
  )

  useEffect(() => {
    controlVideostrate(UpdaterCommands.Load, { url: videostrateUrl })
  }, [controlVideostrate, videostrateUrl])

  useEffect(() => {
    controlVideostrate(UpdaterCommands.Update, {
      html: serializedVideostrate.html,
      style: serializedVideostrate.css,
    })
  }, [
    controlVideostrate,
    serializedVideostrate.css,
    serializedVideostrate.html,
  ])

  useEffect(() => {
    const listener = async (event: MessageEvent) => {
      switch (event.data.type) {
        case "loaded":
          controlVideostrate(UpdaterCommands.Load, { url: videostrateUrl })
          break
        case "metamax-realm":
          setMetamaxRealm(event.data.realm)
          break
        case "videostrate-content":
          setParsedVideostrate(parseVideostrate(event.data.html))
          break
      }
    }
    window.addEventListener("message", listener)

    return () => {
      window.removeEventListener("message", listener)
    }
  }, [
    controlVideostrate,
    setMetamaxRealm,
    setParsedVideostrate,
    videostrateUrl,
  ])

  return (
    <iframe ref={iframeRef} className="hidden" src={props.updaterUrl}></iframe>
  )
}

export default VideostrateUpdater
