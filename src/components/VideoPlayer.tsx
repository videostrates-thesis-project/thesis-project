import { useCallback, useEffect, useState } from "react"
import { useStore } from "../store"
import { parseVideostrate } from "../services/videostrateParser"
import PlayerCommands from "../types/playerCommands"
import PlayerControls from "./PlayerControls"
import useScaledIframe from "../hooks/useScaledIframe"

function VideoPlayer(props: { videoPlayerUrl: string }) {
  const {
    videostrateUrl,
    setVideostrateUrl,
    setParsedVideostrate,
    setMetamaxRealm,
    setPlaybackState,
    serializedVideostrate,
    playing,
    setPlaying,
    seek,
  } = useStore()
  const [url, setUrl] = useState(videostrateUrl)

  const {
    iframeRef,
    iframeScale,
    iframeLeft,
    iframeTop,
    iframeWidth,
    iframeHeight,
    iframeContainerHeight,
  } = useScaledIframe()

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
      width: iframeWidth,
      height: iframeHeight,
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
    controlPlayer(PlayerCommands.UpdateVideo, {
      html: serializedVideostrate.html,
      style: serializedVideostrate.css,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedVideostrate.css, serializedVideostrate.html])

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
    controlPlayer(PlayerCommands.Load, {
      url: url,
      width: iframeWidth,
      height: iframeHeight,
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
          // Add 48px to the height to account for the controls
          style={{ height: `${iframeContainerHeight + 48}px` }}
        >
          <iframe
            ref={iframeRef}
            className="relative"
            style={{
              width: `${iframeWidth}px`,
              height: `${iframeHeight}px`,
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
