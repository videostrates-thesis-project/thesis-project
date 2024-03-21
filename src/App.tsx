import {
  BrowserRouter,
  Route,
  RouterProvider,
  Routes,
  createBrowserRouter,
  useLocation,
} from "react-router-dom"
import "./App.css"
import Navbar from "./components/Navbar"
import Toasts from "./components/Toasts"
import DefaultView from "./components/Views/DefaultView"
import { useClipsMetadata } from "./hooks/useClipsMetadata"
import openAIService from "./services/chatgpt/openai"
import CodeView from "./components/Views/CodeView"

openAIService.init()

const router = createBrowserRouter([
  {
    path: "/",
    element: <></>,
  },
  {
    path: "/code/:elementId",
    element: <CodeView />,
  },
])

function App() {
  useClipsMetadata()
  return (
    <>
      <Toasts />
      <div className="flex flex-col h-full max-h-full">
        <Navbar />
        <Routes>
          <Route path="/" element={<></>} />
          <Route path="/code/:elementId" element={<CodeView />} />
        </Routes>
        <DefaultView />
      </div>
    </>
  )
}

export default App
