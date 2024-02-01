function onMsg(msg) {
  if (msg.origin === "https://demo.webstrates.net") return;
  console.log(msg);
  if (msg.data.type === "videostrate") {
    var body = document.getElementsByTagName("BODY")[0];
    body.innerHTML = msg.data.payload.text;
  }
}

window.addEventListener("message", onMsg, false);
