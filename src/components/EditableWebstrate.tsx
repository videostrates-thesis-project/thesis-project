import React, { useEffect } from "react"
import { useStore } from "../store"
import "../services/videostrateParser"

function EditableWebstrate() {
  const { videostrateUrl } = useStore()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log("iframe:", event.data)
      if (event.data.type === "htmlContent") {
        console.log(event.data.html)
      }
    })
  }, [])

  function updateVideostrate() {
    const iframeWindow = iframeRef.current?.contentWindow
    iframeWindow?.postMessage(
      {
        type: "videostrate",
        payload: {
          text: textareaRef.current?.value,
        },
      },
      "*"
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <iframe
        ref={iframeRef}
        onLoad={() => {
          console.log(
            "iframe loaded"
            //iframeRef.current?.contentWindow?.document.body.innerHTML
          )

          updateVideostrate()
        }}
        className="w-full h-96"
        src="https://demo.webstrates.net/thin-dog-15/"
      ></iframe>
      <textarea id="text" ref={textareaRef} />
      <button className="btn btn-primary" onClick={updateVideostrate}>
        Update webstrate content
      </button>
      <button
        className="btn btn-primary"
        onClick={() => {
          console.log(iframeRef.current?.contentWindow?.document.body.innerHTML)
        }}
      >
        Fetch webstrate content
      </button>
    </div>
  )
}

export default EditableWebstrate
