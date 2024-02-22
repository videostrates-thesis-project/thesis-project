import Timeline from "../Timeline"
import VideoPlayer from "../VideoPlayer"
import DefaultSidePanel from "./DefaultSidePanel"

const DefaultView = () => {
  return (
    <div className="flex flex-row flex-grow min-w-0">
      <DefaultSidePanel />
      <div className="flex flex-col gap-4 w-full min-w-0">
        <VideoPlayer videoPlayerUrl="https://demo.webstrates.net/polite-falcon-61/" />
        <Timeline />
      </div>
    </div>
  )
}

export default DefaultView
