import { useEffect } from "react";
import "./App.css";
import React from "react";

function App() {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    console.log("Setting up event listener");
    function onMsg(msg: any) {
      console.log(`Message from an iframe`, msg);
    }

    window.addEventListener("message", onMsg, false);
    window.postMessage("testStart");
  }, []);

  function updateVideostrate() {
    const iframeWindow = iframeRef.current?.contentWindow;
    iframeWindow?.postMessage(
      {
        type: "videostrate",
        payload: {
          text: textareaRef.current?.value,
        },
      },
      "*"
    );
  }

  return (
    <>
      <textarea id="text" ref={textareaRef} />
      <button onClick={updateVideostrate}>Update webstrate content</button>
      <iframe
        ref={iframeRef}
        // src="https://demo.webstrates.net/tidy-catfish-28/"
        src="https://demo.webstrates.net/chatty-tiger-57/"
        title="W3Schools Free Online Web Tutorials"
      ></iframe>
    </>
  );
}

export default App;
