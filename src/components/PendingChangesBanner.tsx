import { undo } from "../services/command/undo"
import { useStore } from "../store"

const PendingChangesBanner = () => {
  const { setPendingChanges } = useStore()
  return (
    <div className="bg-base-100 border border-accent rounded-lg p-2 pl-3 w-full flex justify-between">
      <p>Pending changes...</p>
      <div>
        <button
          onClick={() => {
            setPendingChanges(false)
          }}
          className="btn btn-sm btn-ghost"
        >
          <i className="bi bi-check2 text-lg text-accent"></i>
        </button>
        <button
          onClick={() => {
            undo()?.noRedo()
          }}
          className="btn btn-sm btn-ghost"
        >
          <i className="bi bi-x text-lg text-accent"></i>
        </button>
      </div>
    </div>
  )
}

export default PendingChangesBanner
