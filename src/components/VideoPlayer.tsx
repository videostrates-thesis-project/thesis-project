import { useRef } from "react"

function VideoPlayer(props: { videoPlayerUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function controlPlayer(command: "play" | "pause") {
    const iframeWindow = iframeRef.current?.contentWindow
    iframeWindow?.postMessage(
      {
        type: "player-control",
        command: command,
      },
      "*"
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <iframe
        ref={iframeRef}
        className="w-full h-[50rem]"
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
