import { useLocation } from "react-router-dom"
import Timeline from "../Timeline/Timeline"
import VideoPlayer from "../VideoPlayer"
import DefaultSidePanel from "./DefaultSidePanel"
import clsx from "clsx"
import DefaultChat from "../Timeline/DefaultChat"
import VideostrateUpdater from "../VideostrateUpdater"

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
          <VideostrateUpdater updaterUrl="https://demo.webstrates.net/yellow-badger-85/" />
          <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/average-hound-52/" />
          <Timeline />
        </div>
      </div>
      <DefaultChat />
    </div>
  )
}

export default DefaultView
