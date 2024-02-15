import "./App.css"
import Chat from "./components/Chat"
import Commander from "./components/Commander"
import Timeline from "./components/Timeline"
import Uploader from "./components/Uploader"
import VideoPlayer from "./components/VideoPlayer"
import { useClipsMetadata } from "./hooks/useClipsMetadata"
import openAIService from "./services/openai"

openAIService.init()

function App() {
  useClipsMetadata()
  return (
    <>
      <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/polite-falcon-61/" />
      <Timeline />
      <Commander />
      <Chat />
      <Uploader />
    </>
  )
}

export default App
