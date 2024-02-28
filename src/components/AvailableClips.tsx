import { useStore } from "../store"

const AvailableClips = () => {
  const { availableClips } = useStore()
  return (
    <div className="w-full flex flex-col gap-3">
      {availableClips.map((clip) => {
        const formattedTitle = `${clip.title || clip.source}`
        return (
          <div className="flex flex-row gap-2" key={clip.source}>
            <img
              className="w-1/2 flex-grow-0 flex-shrink-0 h-28 object-cover rounded"
              src={clip.thumbnailUrl || "https://via.placeholder.com/150"}
            />
            <div className="py-2 flex flex-col w-1/2 h-full flex-grow-0 flex-shrink-0 text-left">
              <div className="overflow-hidden whitespace-nowrap text-ellipsis">
                {formattedTitle}
              </div>
              <div>{clip.length ?? "?"} seconds</div>
              <div className="flex-grow w-full flex justify-end items-end">
                <button className="btn btn-sm btn-ghost">
                  <i className="bi bi-images text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AvailableClips