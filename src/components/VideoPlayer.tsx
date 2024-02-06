import { useRef } from "react"

function VideoPlayer(props: { videoPlayerUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  function controlPlayer(command: "play" | "pause" | "load", args?: object) {
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

  function loadVideo() {
    const url = urlInputRef.current?.value
    if (!url) return
    const width = iframeRef.current?.clientWidth
    const height = iframeRef.current?.clientHeight
    controlPlayer("load", { url, width, height })
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row gap-4 w-full">
        <input
          ref={urlInputRef}
          defaultValue="https://demo.webstrates.net/black-eel-9/"
          type="text"
          className="w-full input input-primary"
          placeholder="Enter video URL"
        />
        <button className="btn btn-primary" onClick={loadVideo}>
          Load video
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
