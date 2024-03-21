import { useLocation } from "react-router-dom"
import Timeline from "../Timeline/Timeline"
import VideoPlayer from "../VideoPlayer"
import DefaultSidePanel from "./DefaultSidePanel"
import clsx from "clsx"
import DefaultChat from "../Timeline/DefaultChat"

const DefaultView = () => {
  const location = useLocation()
  return (
    <div
      className={clsx(
        "flex flex-row flex-grow w-full min-h-0",
        location.pathname !== "/" && "hidden"
      )}
    >
      <div className="flex flex-row flex-grow min-w-0">
        <DefaultSidePanel />
        <div className="flex flex-col w-full min-w-0">
          <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/bad-goat-7/" />
          <Timeline />
        </div>
      </div>
      <DefaultChat />
    </div>
  )
}

export default DefaultView
