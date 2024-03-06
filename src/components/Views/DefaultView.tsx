import Timeline from "../Timeline/Timeline"
import VideoPlayer from "../VideoPlayer"
import DefaultSidePanel from "./DefaultSidePanel"

const DefaultView = () => {
  return (
    <div className="flex flex-row flex-grow min-w-0">
      <DefaultSidePanel />
      <div className="flex flex-col w-full min-w-0">
        <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/bad-goat-7/" />
        <Timeline />
      </div>
    </div>
  )
}

export default DefaultView
