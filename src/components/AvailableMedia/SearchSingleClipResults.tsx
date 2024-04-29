import sanitizeHtml from "sanitize-html"
import { ClipResults } from "../../services/api/apiTypes"
import { useStore } from "../../store"
import { runCommands } from "../../services/interpreter/run"
import { addCroppedClip } from "../../services/interpreter/builtin/addCroppedClip"
import { useMemo, useState } from "react"

const SearchSingleClipResults = (props: {
  results: ClipResults[]
  url: string
}) => {
  const { clipsMetadata, playbackState } = useStore()

  const [folded, setFolded] = useState(false)

  const formatTime = (seconds: number) => {
    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substring(11, 19)
  }

  const onAddClip = (clipTitle: string, start: number, end: number) => {
    console.log("Add clip", clipTitle, start, end)
    runCommands(addCroppedClip(clipTitle, playbackState.time, start, end))
  }

  const clip = useMemo(
    () => clipsMetadata.find((clip) => clip.source === props.url),
    [clipsMetadata, props.url]
  )

  if (!clip) return null

  return (
    <>
      <div className="flex flex-col" key={clip.source}>
        <div className="flex flex-row items-center justify-between gap-2 bg-base-100 rounded-lg mb-1 overflow-hidden">
          <div className="flex flex-row items-center gap-2">
            <img
              className="w-auto h-12 flex-grow-0 flex-shrink-0 object-cover"
              src={
                clipsMetadata.find((clip) => clip.source === props.url)
                  ?.thumbnailUrl
              }
            />
            {clip.title}
          </div>
          <button
            className="btn btn-sm btn-ghost mr-2"
            onClick={() => setFolded(!folded)}
          >
            {folded ? (
              <i className="bi bi-chevron-right"></i>
            ) : (
              <i className="bi bi-chevron-down"></i>
            )}
          </button>
        </div>
        {!folded &&
          props.results.map((match) => (
            <div
              key={match.start + match.text}
              className="flex flex-col items-start mx-1 leading-4 border-b border-neutral last:border-0"
            >
              <div className="py-2 flex flex-row text-left w-full justify-between items-center">
                <div className="h-fit flex flex-col">
                  <span className="mr-2 text-xs opacity-50 ">
                    {formatTime(match.start)}
                  </span>
                  <span className="mr-2 text-xs opacity-50 ">
                    {formatTime(match.end)}
                  </span>
                </div>
                <div className="flex flex-col gap-2 flex-grow">
                  <span className="opacity-30">{match.before_text}</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(match.highlighted),
                    }}
                  />
                  <span className="opacity-30">{match.after_text}</span>
                </div>
                <div
                  className="tooltip tooltip-left"
                  data-tip="Add matching part of the clip"
                >
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() =>
                      onAddClip(clip.title, match.start, match.end)
                    }
                  >
                    <i className="bi bi-plus-lg text-lg text-accent ml-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
export default SearchSingleClipResults
