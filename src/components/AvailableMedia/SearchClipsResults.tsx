import sanitizeHtml from "sanitize-html"
import { SearchVideosResponse } from "../../services/api/apiTypes"
import { useStore } from "../../store"
import { runCommands } from "../../services/interpreter/run"
import { addCroppedClip } from "../../services/interpreter/builtin/addCroppedClip"

const SearchClipsResults = (props: {
  results: SearchVideosResponse | null
}) => {
  const { clipsMetadata, seek } = useStore()

  const formatTime = (seconds: number) => {
    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substring(11, 19)
  }

  const onAddClip = (clipTitle: string, start: number, end: number) => {
    console.log("Add clip", clipTitle, start, end)
    runCommands(addCroppedClip(clipTitle, seek, start, end))
  }

  return (
    <>
      {props.results &&
        Object.entries(props.results).map(([url, result]) => {
          const clip = clipsMetadata.find((clip) => clip.source === url)
          return (
            clip && (
              <div className="flex flex-col pb-2" key={clip.source}>
                <div className="flex flex-row gap-2 items-center bg-base-100 rounded-lg mb-1">
                  <img
                    className="w-1/4 h-12 flex-grow-0 flex-shrink-0 object-cover"
                    src={
                      clipsMetadata.find((clip) => clip.source === url)
                        ?.thumbnailUrl
                    }
                  />
                  {clip.title}
                </div>
                {result.map((match) => (
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
            )
          )
        })}
    </>
  )
}
export default SearchClipsResults
