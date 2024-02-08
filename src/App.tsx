import "./App.css"
import Timeline from "./components/Timeline"
import VideoPlayer from "./components/VideoPlayer"
import VideostrateLoader from "./components/VideostrateLoader"

function App() {
  return (
    <>
      <VideostrateLoader />
      <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/serious-goat-13/" />
      <Timeline />
    </>
  )
}

export default App
