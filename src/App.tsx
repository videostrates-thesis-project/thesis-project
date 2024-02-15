import "./App.css"
import Commander from "./components/Commander"
import Timeline from "./components/Timeline"
import VideoPlayer from "./components/VideoPlayer"

function App() {
  return (
    <>
      <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/polite-falcon-61/" />
      <Timeline />
      <Commander />
    </>
  )
}

export default App
