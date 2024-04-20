import { useCallback, useRef, useState } from "react"
import { useStore } from "../../store"

const HamburgerMenuContent = () => {
  const { videostrateUrl, setVideostrateUrl, setShowScriptTab, showScriptTab } =
    useStore()
  const [url, setUrl] = useState(videostrateUrl)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const onChangeUrl = useCallback(() => {
    setVideostrateUrl(url)
  }, [setVideostrateUrl, url])

  const onExport = useCallback(() => {
    const store = useStore.getState()
    const json = JSON.stringify(store)

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
      useStore.setState(store)
      window.location.reload()
    },
    []
  )

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

      <div className="form-control">
        <label className="label cursor-pointer">
          <input
            type="checkbox"
            checked={showScriptTab}
            onChange={() => setShowScriptTab(!showScriptTab)}
            className="checkbox checkbox-accent"
          />
          <span className="label-text ml-2">Show script tab</span>
        </label>
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
    </>
  )
}

export default HamburgerMenuContent
