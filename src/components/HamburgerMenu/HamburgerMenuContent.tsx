import { useCallback, useState } from "react"
import { useStore } from "../../store"
import useLogger from "../../hooks/useLogger"

const HamburgerMenuContent = () => {
  const { videostrateUrl, setVideostrateUrl, setShowScriptTab, showScriptTab } =
    useStore()
  const [url, setUrl] = useState(videostrateUrl)
  const { exportLogs } = useLogger()

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
  }, [setVideostrateUrl, url])

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <input
          type="text"
          className="w-full input input-sm input-bordered text-white"
          placeholder="Enter video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn btn-sm btn-accent w-auto" onClick={onChangeUrl}>
          Change URL
        </button>
      </div>

      <div className="form-control w-full gap-4">
        <label className="label cursor-pointer mr-auto">
          <input
            type="checkbox"
            checked={showScriptTab}
            onChange={() => setShowScriptTab(!showScriptTab)}
            className="checkbox checkbox-accent"
          />
          <span className="label-text ml-2">Show script tab</span>
        </label>
        <button className="btn btn-sm btn-accent w-auto" onClick={exportLogs}>
          Export Logs
        </button>
      </div>
    </>
  )
}

export default HamburgerMenuContent
