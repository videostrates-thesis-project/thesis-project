import React from "react"

function EditableWebstrate() {
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
        className="w-full h-96"
        src="https://demo.webstrates.net/chatty-tiger-57/"
      ></iframe>
      <textarea id="text" ref={textareaRef} />
      <button className="btn btn-primary" onClick={updateVideostrate}>
        Update webstrate content
      </button>
    </div>
  )
}

export default EditableWebstrate
