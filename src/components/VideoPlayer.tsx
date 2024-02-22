import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "../store"
import { parseVideostrate } from "../services/videostrateParser"
import { WebstrateSerializationStrategy } from "../services/serializationStrategies/webstrateSerializationStrategy"
import PlayerCommands from "../types/playerCommands"
import PlayerControls from "./PlayerControls"

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

  const updateIframeSize = useCallback(() => {
    const target = iframeRef.current?.parentNode as HTMLElement
    const newContainerHeight = target.clientWidth * (9 / 16)
    setIframeScale(target.clientWidth / 1280)
    setIframeLeft((target.clientWidth - 1280) / 2)
    setIframeTop((newContainerHeight - 720) / 2)
    setIframeContainerHeight(newContainerHeight)
  }, [setIframeScale])

  useEffect(() => {
    window.addEventListener("resize", updateIframeSize)
    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", updateIframeSize)
    }
  }, [updateIframeSize])

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
      width: 1280,
      height: 720,
    })
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
    const html = new WebstrateSerializationStrategy().serialize(
      parsedVideostrate
    )
    controlPlayer(PlayerCommands.UpdateVideo, { content: html })
  }, [parsedVideostrate])

  function controlPlayer(command: PlayerCommands, args?: object) {
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

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
    controlPlayer(PlayerCommands.Load, {
      url: url,
      width: 1280,
      height: 720,
    })
  }, [setVideostrateUrl, url])

  return (
    <div className="flex flex-col gap-1 w-full h-full p-4 min-h-0 min-w-0">
      <div className="flex flex-row gap-4 w-full">
        <input
          type="text"
          className="w-full input input-sm input-primary text-white"
          placeholder="Enter video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn btn-sm btn-primary" onClick={onChangeUrl}>
          Change URL
        </button>
      </div>
      <div
        className="w-full h-full overflow-hidden min-h-0 min-w-0"
        style={{ height: `${iframeContainerHeight}px` }}
        onLoad={() => updateIframeSize()}
      >
        <iframe
          ref={iframeRef}
          className="w-[1280px] h-[720px] relative"
          style={{
            scale: `${iframeScale}`,
            left: `${iframeLeft}px`,
            top: `${iframeTop}px`,
          }}
          src={props.videoPlayerUrl}
        ></iframe>
      </div>
      <PlayerControls />
    </div>
  )
}

export default VideoPlayer
