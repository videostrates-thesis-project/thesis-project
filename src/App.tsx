import "./App.css"
import React from "react"

function App() {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

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
        // src="https://demo.webstrates.net/tidy-catfish-28/"
        src="https://demo.webstrates.net/chatty-tiger-57/"
        title="W3Schools Free Online Web Tutorials"
      ></iframe>
      <textarea id="text" ref={textareaRef} />
      <button className="btn btn-primary" onClick={updateVideostrate}>
        Update webstrate content
      </button>
    </div>
  )
}

export default App
