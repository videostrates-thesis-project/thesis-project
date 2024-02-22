import { useStore } from "../store"

const PlayerControls = () => {
  const { playing, setPlaying, playbackState, setSeek, parsedVideostrate } =
    useStore()
  console.log("parsedVideostrate.length", parsedVideostrate.length)

  return (
    <div className="flex justify-between items-center">
      <button className="btn btn-sm btn-ghost">
        <i className="bi bi-card-text text-lg"></i>
      </button>
      <div className="flex items-center">
        <button
          className="btn btn-sm btn-ghost px-2"
          onClick={() => {
            if (playing) setPlaying(false)
            setSeek(0)
          }}
        >
          <i className="bi bi-skip-backward-fill text-lg"></i>
        </button>
        <button
          className="btn btn-sm btn-ghost px-2"
          onClick={() => setSeek(playbackState.time - 5)}
        >
          <div className="relative">
            <i className="bi bi-arrow-counterclockwise text-2xl"></i>
            <span className="absolute text-xs left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              5
            </span>
          </div>
        </button>
        {!playing ? (
          <button
            className="btn btn-ghost px-2"
            onClick={() => setPlaying(true)}
          >
            <i className="bi bi-play-circle-fill text-3xl"></i>
          </button>
        ) : (
          <button
            className="btn btn-ghost px-2"
            onClick={() => setPlaying(false)}
          >
            <i className="bi bi-pause-circle-fill text-3xl"></i>
          </button>
        )}
        <button
          className="btn btn-sm btn-ghost px-2"
          onClick={() => setSeek(playbackState.time + 5)}
        >
          <div className="relative">
            <i className="bi bi-arrow-clockwise text-2xl"></i>
            <span className="absolute text-xs left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              5
            </span>
          </div>
        </button>
        <button
          className="btn btn-sm btn-ghost px-2"
          onClick={() => {
            if (playing) setPlaying(false)
            setSeek(parsedVideostrate.length)
          }}
        >
          <i className="bi bi-skip-forward-fill text-lg"></i>
        </button>
      </div>
      <button className="btn btn-sm btn-ghost">
        <i className="bi bi-fullscreen text-lg"></i>
      </button>
    </div>
  )
}

export default PlayerControls
