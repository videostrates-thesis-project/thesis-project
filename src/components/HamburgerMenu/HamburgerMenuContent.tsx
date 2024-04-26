import { useCallback, useRef, useMemo, useState, useEffect } from "react"
import { AiProvider, useStore } from "../../store"
import useLogger from "../../hooks/useLogger"
import { v4 as uuid } from "uuid"
import VideoClip, { VideoClipDict } from "../../types/videoClip"
import { CustomElement, CustomElementDict } from "../../types/videoElement"

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
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const { exportLogs } = useLogger()

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
  }, [setVideostrateUrl, url])

  useEffect(() => {
    setUrl(videostrateUrl)
  }, [videostrateUrl])

  const onExport = useCallback(() => {
    const store = useStore.getState()
    const json = JSON.stringify({
      availableClips: store.availableClips,
      availableImages: store.availableImages,
      availableCustomElements: store.availableCustomElements,
      clipsMetadata: store.clipsMetadata,
      parsedVideostrate: {
        style: store.parsedVideostrate.style,
      },
    })

    if (downloadRef.current) {
      downloadRef.current.href = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`

      downloadRef.current.click()
    }
  }, [])

  const onImport = useCallback(() => {
    if (importRef.current) {
      importRef.current.click()
    }
  }, [])

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length <= 0) {
        return
      }
      const file = files[0]
      const store = JSON.parse(await file.text())
      const newParsedVideostrate = useStore.getState().parsedVideostrate.clone()
      store.parsedVideostrate.style.forEach(
        (s: { selector: string; style: string }) =>
          newParsedVideostrate.addStyle(s.selector, s.style)
      )
      useStore.setState({
        ...useStore.getState(),
        ...store,
        clipsMetadata: store.clipsMetadata.map((c: VideoClipDict) =>
          VideoClip.fromDict(c)
        ),
        availableCustomElements: store.availableCustomElements.map(
          (a: CustomElementDict) => CustomElement.fromDict(a)
        ),
      })
      useStore.getState().setParsedVideostrate(newParsedVideostrate)
    },
    []
  )

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

  const onCreateNewWebstrate = useCallback(() => {
    setVideostrateUrl("https://demo.webstrates.net/videostrates-" + uuid())
  }, [setVideostrateUrl])

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
        <div className="grid grid-rows-1 grid-cols-2 gap-4">
          <button className="btn btn-accent w-auto" onClick={onChangeUrl}>
            Change URL
          </button>
          <button
            className="btn btn-error w-auto"
            onClick={onCreateNewWebstrate}
          >
            Create new webstrate
          </button>
        </div>
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

      <div className="flex flex-row gap-4">
        <button className="btn btn-accent w-auto" onClick={onExport}>
          Export store
        </button>
        <button className="btn btn-info w-auto" onClick={onImport}>
          Import store
        </button>
      </div>

      <a
        className="hidden"
        ref={downloadRef}
        href={""}
        download="store.json"
      ></a>

      <input
        ref={importRef}
        type="file"
        className="hidden"
        onChange={onUpload}
      />
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
