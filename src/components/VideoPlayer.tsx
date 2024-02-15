import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "../store"
import { parseVideostrate } from "../services/videostrateParser"
import { serializeVideostrate } from "../services/videostrateSerializer"

function VideoPlayer(props: { videoPlayerUrl: string }) {
  const {
    videostrateUrl,
    setVideostrateUrl,
    setParsedVideostrate,
    setMetamaxRealm,
    setPlaybackState,
    parsedVideostrate,
    seek,
  } = useStore()
  const [url, setUrl] = useState(videostrateUrl)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [playing, setPlaying] = useState(false)
  const [iframeWidth, setIframeWidth] = useState(0)
  const [iframeHeight, setIframeHeight] = useState(0)

  const updateIframeSize = useCallback(
    (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
      const target = e.target as HTMLIFrameElement
      setIframeWidth(target.clientWidth)
      setIframeHeight(target.clientHeight)
    },
    [setIframeWidth, setIframeHeight]
  )

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
    setPlaybackState({ frame: 0, time: 0 })
    controlPlayer("load", {
      url: videostrateUrl,
      width: iframeWidth,
      height: iframeHeight,
    })
  }, [setPlaybackState, videostrateUrl, iframeWidth, iframeHeight])

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
    const html = serializeVideostrate(parsedVideostrate)
    controlPlayer("update-video", { content: html })
  }, [parsedVideostrate])

  function controlPlayer(
    command: "play" | "pause" | "load" | "seek" | "update-video",
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
    console.log("Loading videostrate", url)
    controlPlayer("load", {
      url: url,
      width: iframeWidth,
      height: iframeHeight,
    })
  }, [setVideostrateUrl, url, iframeWidth, iframeHeight])

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
        onResize={(e) => updateIframeSize(e)}
        onLoad={(e) => updateIframeSize(e)}
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
