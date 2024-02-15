import "./App.css"
import Chat from "./components/Chat"
import Commander from "./components/Commander"
import Timeline from "./components/Timeline"
import VideoPlayer from "./components/VideoPlayer"
import VideostrateLoader from "./components/VideostrateLoader"
import openAIService from "./services/openai"

openAIService.init()

function App() {
  return (
    <>
      <VideostrateLoader />
      <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/serious-goat-13/" />
      <Timeline />
      <Commander />
      <Chat />
    </>
  )
}

export default App
