import { Route, Routes, useLocation } from "react-router-dom"
import "./App.css"
import Navbar from "./components/Navbar"
import Toasts from "./components/Toasts"
import DefaultView from "./components/Views/DefaultView"
import { useClipsMetadata } from "./hooks/useClipsMetadata"
import openAIService from "./services/chatgpt/openai"
import CodeView from "./components/Views/CodeView"
import useShortcuts from "./hooks/useShortcuts"
import { useMemo } from "react"

openAIService.init()

function App() {
  const location = useLocation()
  const shortcutsEnabled = useMemo(() => {
    // Disable the shortcuts in the code editor
    return location.pathname === "/"
  }, [location.pathname])
  useClipsMetadata()
  useShortcuts(shortcutsEnabled)
  return (
    <>
      <Toasts />
      <div className="flex flex-col h-full max-h-full">
        <Navbar />
        <DefaultView />
        <Routes>
          <Route path="/" element={<></>} />
          <Route path="/code/:elementId" element={<CodeView />} />
        </Routes>
      </div>
    </>
  )
}

export default App
