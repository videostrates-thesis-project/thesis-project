import { useCallback, useMemo, useState } from "react"
import { AiProvider, useStore } from "../../store"
import useLogger from "../../hooks/useLogger"

const HamburgerMenuContent = () => {
  const {
    videostrateUrl,
    setVideostrateUrl,
    setShowScriptTab,
    showScriptTab,
    aiProvider,
    setAiProvider,
  } = useStore()
  const [url, setUrl] = useState(videostrateUrl)
  const { exportLogs } = useLogger()

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
  }, [setVideostrateUrl, url])

  const aiProviderItems = useMemo(() => {
    return [
      {
        value: "openai",
        label: "OpenAI",
        isSelected: aiProvider === "openai",
      },
      {
        value: "azure",
        label: "Azure",
        isSelected: aiProvider === "azure",
      },
    ] as { value: AiProvider; label: string; isSelected: boolean }[]
  }, [aiProvider])

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
      <div className="flex flex-col justify-center items-center">
        <p className="text-gray-400">AI provider</p>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">
            {aiProviderItems.find((q) => q.isSelected)?.label}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {aiProviderItems.map((item) => (
              <li key={item.value}>
                <a onClick={() => setAiProvider(item.value)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default HamburgerMenuContent
