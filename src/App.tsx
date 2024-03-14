import "./App.css"
import Chat from "./components/Chat"
import Navbar from "./components/Navbar"
import Toasts from "./components/Toasts"
import DefaultView from "./components/Views/DefaultView"
import { useClipsMetadata } from "./hooks/useClipsMetadata"
import openAIService from "./services/chatgpt/openai"

openAIService.init()

function App() {
  useClipsMetadata()
  return (
    <>
      <Toasts />
      <div className="flex flex-col h-full max-h-full">
        <Navbar />
        <div className="flex flex-row flex-grow w-full min-h-0">
          <DefaultView />
          <Chat />
        </div>
      </div>
    </>
  )
}

export default App
