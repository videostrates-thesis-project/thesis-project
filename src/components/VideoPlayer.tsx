import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import PlayerCommands from "../types/playerCommands"
import PlayerControls from "./PlayerControls"
import useScaledIframe from "../hooks/useScaledIframe"

function VideoPlayer(props: { videoPlayerUrl: string }) {
  const {
    videostrateUrl,
    setParsedVideostrate,
    setPlaybackState,
    playing,
    setPlaying,
    seek,
  } = useStore()

  const {
    iframeRef,
    iframeScale,
    iframeLeft,
    iframeTop,
    iframeWidth,
    iframeHeight,
    iframeContainerHeight,
  } = useScaledIframe()

  const iframeWindow = iframeRef.current?.contentWindow

  const controlPlayer = useCallback(
    (command: PlayerCommands, args?: object) => {
      if (command === PlayerCommands.Play) setPlaying(true)
      else if (command === PlayerCommands.Pause) setPlaying(false)

      iframeWindow?.postMessage(
        {
          type: "player-control",
          command: command.toString(),
          args: args,
        },
        "*"
      )
    },
    [iframeWindow, setPlaying]
  )

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
  }, [
    controlPlayer,
    iframeHeight,
    iframeWidth,
    setPlaybackState,
    videostrateUrl,
  ])

  useEffect(() => {
    // Listen for messages from the iframe
    const listener = async (event: MessageEvent) => {
      switch (event.data.type) {
        case "player-loaded":
          loadVideo()
          break
        case "player-position":
          setPlaybackState({ frame: event.data.frame, time: event.data.time })
          break
      }
    }
    window.addEventListener("message", listener)

    return () => {
      window.removeEventListener("message", listener)
    }
  }, [loadVideo, setPlaybackState, setParsedVideostrate])

  useEffect(() => {
    controlPlayer(PlayerCommands.Load, {
      url: videostrateUrl,
      width: iframeWidth,
      height: iframeHeight,
    })
  }, [controlPlayer, iframeHeight, iframeWidth, videostrateUrl])

  return (
    <div className="flex flex-col gap-2 w-full flex-grow p-2 min-h-0 min-w-0">
      <div className="flex flex-col justify-center items-center w-full h-full min-h-0 min-w-0">
        <div
          className="w-full h-full overflow-hidden min-h-0 min-w-0"
          // Add 48px to the height to account for the controls
          style={{
            height: `${iframeContainerHeight}px`,
            minHeight: `${iframeContainerHeight}px`,
          }}
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
      </div>
      <PlayerControls />
    </div>
  )
}

export default VideoPlayer
