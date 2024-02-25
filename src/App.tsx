import "./App.css"
import Chat from "./components/Chat"
import Commander from "./components/Commander"
import Timeline from "./components/Timeline"
import Uploader from "./components/Uploader"
import VideoPlayer from "./components/VideoPlayer"
import { useClipsMetadata } from "./hooks/useClipsMetadata"
import openAIService from "./services/chatgpt/openai"

openAIService.init()

function App() {
  useClipsMetadata()
  return (
    <>
      <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/bad-goat-7/" />
      <Timeline />
      <Commander />
      <Chat />
      <Uploader />
    </>
  )
}

export default App
