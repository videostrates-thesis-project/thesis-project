import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "../store"
import { parseVideostrate } from "../services/videostrateParser"
import PlayerCommands from "../types/playerCommands"
import PlayerControls from "./PlayerControls"
import { serializeVideostrate } from "../services/parser/serializationExecutor"

const VIDEO_WIDTH = 1280
const VIDEO_HEIGHT = 960
const VIDEO_ASPECT_RATIO = VIDEO_WIDTH / VIDEO_HEIGHT

function VideoPlayer(props: { videoPlayerUrl: string }) {
  const {
    videostrateUrl,
    setVideostrateUrl,
    setParsedVideostrate,
    setMetamaxRealm,
    setPlaybackState,
    parsedVideostrate,
    playing,
    setPlaying,
    seek,
  } = useStore()
  const [url, setUrl] = useState(videostrateUrl)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeScale, setIframeScale] = useState(1)
  const [iframeLeft, setIframeLeft] = useState(0)
  const [iframeTop, setIframeTop] = useState(0)
  const [iframeContainerHeight, setIframeContainerHeight] = useState(720)

  // The iframeRef doesn't work when wrapped in a useCallback
  const controlPlayer = (command: PlayerCommands, args?: object) => {
    if (command === PlayerCommands.Play) setPlaying(true)
    else if (command === PlayerCommands.Pause) setPlaying(false)

    const iframeWindow = iframeRef.current?.contentWindow
    iframeWindow?.postMessage(
      {
        type: "player-control",
        command: command.toString(),
        args: args,
      },
      "*"
    )
  }

  const updateIframeSize = useCallback(() => {
    const target = iframeRef.current?.parentNode as HTMLElement
    if (!target) return
    // Calculate the maximum height of the container by subtracting the height of the controls
    const maxContainerHeight =
      (target.parentNode as HTMLElement).clientHeight - 48
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

  useEffect(() => {
    controlPlayer(PlayerCommands.Seek, { time: seek })
    if (playing) {
      controlPlayer(PlayerCommands.Play)
    }
    // Make sure this effect only runs when the seek changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seek])

  useEffect(() => {
    if (playing) {
      controlPlayer(PlayerCommands.Play)
    } else {
      controlPlayer(PlayerCommands.Pause)
    }
    // Make sure this effect only runs when the playing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const loadVideo = useCallback(() => {
    if (!videostrateUrl) return
    setPlaybackState({ frame: 0, time: 0 })
    controlPlayer(PlayerCommands.Load, {
      url: videostrateUrl,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPlaybackState, videostrateUrl])

  useEffect(() => {
    // Listen for messages from the iframe
    const listener = async (event: MessageEvent) => {
      switch (event.data.type) {
        case "player-loaded":
          loadVideo()
          break
        case "metamax-realm":
          setMetamaxRealm(event.data.realm)
          break
        case "player-position":
          setPlaybackState({ frame: event.data.frame, time: event.data.time })
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
  }, [loadVideo, setPlaybackState, setParsedVideostrate, setMetamaxRealm])

  useEffect(() => {
    const { html, style } = serializeVideostrate(parsedVideostrate, "webstrate")
    console.log("Updating videostrate", parsedVideostrate.all)
    controlPlayer(PlayerCommands.UpdateVideo, { html, style: style })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedVideostrate])

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
    controlPlayer(PlayerCommands.Load, {
      url: url,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setVideostrateUrl, url])

  return (
    <div className="flex flex-col gap-2 w-full flex-grow p-2 min-h-0 min-w-0">
      <div className="flex flex-row gap-4 w-full">
        <input
          type="text"
          className="w-full input input-sm input-bordered text-white"
          placeholder="Enter video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn btn-sm btn-accent" onClick={onChangeUrl}>
          Change URL
        </button>
      </div>
      <div className="flex flex-col justify-center items-center w-full h-full min-h-0 min-w-0">
        <div
          className="w-full h-full overflow-hidden min-h-0 min-w-0"
          style={{ height: `${iframeContainerHeight}px` }}
        >
          <iframe
            ref={iframeRef}
            className="relative"
            style={{
              width: `${VIDEO_WIDTH}px`,
              height: `${VIDEO_HEIGHT}px`,
              scale: `${iframeScale}`,
              left: `${iframeLeft}px`,
              top: `${iframeTop}px`,
            }}
            src={props.videoPlayerUrl}
          ></iframe>
        </div>
        <PlayerControls />
      </div>
    </div>
  )
}

export default VideoPlayer
