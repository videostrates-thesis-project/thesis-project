import { useEffect, useState } from "react"
import { useStore } from "../../store"
import { searchVideos } from "../../services/api/api"
import { SearchVideosResponse } from "../../services/api/apiTypes"
import sanitizeHtml from "sanitize-html"

const ClipsSearch = (props: {
  search: string
  setSearch: (search: string) => void
  results: SearchVideosResponse | null
}) => {
  const formatTime = (seconds: number) => {
    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substring(11, 19)
  }
  const { clipsMetadata } = useStore()

  return (
    <>
      <div className="join w-full">
        <input
          value={props.search}
          onChange={(e) => props.setSearch(e.target.value)}
          className="input input-sm join-item input-bordered w-full"
          placeholder="Search clips..."
        />
        <button className="btn btn-sm btn-neutral join-item">
          <i className="bi bi-search"></i>
        </button>
      </div>
      {props.search &&
        props.results &&
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

export default ClipsSearch
