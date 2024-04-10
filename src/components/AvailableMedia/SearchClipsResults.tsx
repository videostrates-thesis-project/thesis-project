import sanitizeHtml from "sanitize-html"
import { SearchVideosResponse } from "../../services/api/apiTypes"
import { useStore } from "../../store"

const SearchClipsResults = (props: {
  results: SearchVideosResponse | null
}) => {
  const { clipsMetadata } = useStore()

  const formatTime = (seconds: number) => {
    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substring(11, 19)
  }
  return (
    <>
      {props.results &&
        Object.entries(props.results).map(([url, result]) => {
          const clip = clipsMetadata.find((clip) => clip.source === url)
          return (
            clip && (
              <div className="flex flex-col gap-2 pb-2">
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
                    key={match.toString()}
                    className="flex flex-col items-start mx-1 leading-4"
                  >
                    <div className="flex flex-row text-left">
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
