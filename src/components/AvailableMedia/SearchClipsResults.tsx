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
              <div className="flex flex-col gap-2 pb-2" key={clip.source}>
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
                    key={match.start + match.content}
                    className="flex flex-col items-start mx-1 leading-4"
                  >
                    <div className="flex flex-row text-left w-full justify-between">
                      <div className="flex flex-row text-left w-full">
                        <span>
                          <span className="mr-2 text-xs opacity-50 ">
                            {formatTime(match.start)}
                          </span>
                        </span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(match.highlighted),
                          }}
                        />
                      </div>
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
                ))}
              </div>
            )
          )
        })}
    </>
  )
}
export default SearchClipsResults
