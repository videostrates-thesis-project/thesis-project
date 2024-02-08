import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "../store"

function VideoPlayer(props: { videoPlayerUrl: string }) {
  const { videostrateUrl, setVideostrateUrl, setPlaybackState, seek } =
    useStore()
  const [url, setUrl] = useState(videostrateUrl)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    controlPlayer("seek", { time: seek })
    if (playing) {
      controlPlayer("play")
    }
    // Make sure this effect only runs when the seek changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seek])

  const loadVideo = useCallback(() => {
    if (!videostrateUrl) return
    const width = iframeRef.current?.clientWidth
    const height = iframeRef.current?.clientHeight
    setPlaybackState({ frame: 0, time: 0 })
    controlPlayer("load", { url: videostrateUrl, width, height })
  }, [setPlaybackState, videostrateUrl])

  useEffect(() => {
    // Listen for messages from the iframe
    const listener = (event: MessageEvent) => {
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
  }, [loadVideo, setPlaybackState])

  function controlPlayer(
    command: "play" | "pause" | "load" | "seek",
    args?: object
  ) {
    if (command === "play") setPlaying(true)
    else if (command === "pause") setPlaying(false)

    const iframeWindow = iframeRef.current?.contentWindow
    iframeWindow?.postMessage(
      {
        type: "player-control",
        command: command,
        args: args,
      },
      "*"
    )
  }

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
  }, [setVideostrateUrl, url])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row gap-4 w-full">
        <input
          type="text"
          className="w-full input input-primary text-white"
          placeholder="Enter video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onChangeUrl}>
          Change URL
        </button>
      </div>
      <iframe
        ref={iframeRef}
        className="h-[50rem] max-w-7xl w-[80rem]"
        src={props.videoPlayerUrl}
      ></iframe>
      <div className="flex flex-row gap-4 w-full">
        <button
          className="btn btn-primary"
          onClick={() => controlPlayer("play")}
        >
          Play
        </button>
        <button
          className="btn btn-primary"
          onClick={() => controlPlayer("pause")}
        >
          Pause
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
