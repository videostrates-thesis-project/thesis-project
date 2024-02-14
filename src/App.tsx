import "./App.css"
import Commander from "./components/Commander"
import Timeline from "./components/Timeline"
import VideoPlayer from "./components/VideoPlayer"
import VideostrateLoader from "./components/VideostrateLoader"

function App() {
  return (
    <>
      <VideostrateLoader />
      <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/serious-goat-13/" />
      <Timeline />
      <Commander />
    </>
  )
}

export default App
