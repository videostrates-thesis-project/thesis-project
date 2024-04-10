import { useCallback } from "react"
import { undo } from "../services/interpreter/undo"
import { useStore } from "../store"
import clsx from "clsx"
import { redo } from "../services/interpreter/redo"

const Navbar = () => {
  const { fileName, setFileName, undoStack, redoStack } = useStore()

  const onUndo = useCallback(() => {
    undo()
  }, [])

  const onRedo = useCallback(() => {
    redo()
  }, [])

  return (
    <nav className="navbar min-h-10 py-2 bg-base-300 border-b border-neutral">
      <div className="navbar-start flex items-center gap-2">
        <button className="btn btn-ghost btn-sm">
          <i className="bi bi-list text-lg leading-6"></i>
        </button>
        <h1>Videostrates</h1>
        <span className="pl-4">
          <button
            className={clsx(
              "btn btn-ghost btn-sm",
              undoStack.length === 0 && "btn-disabled"
            )}
            onClick={onUndo}
          >
            <i className="bi bi-arrow-counterclockwise text-lg leading-6"></i>
          </button>
          <button
            className={clsx(
              "btn btn-ghost btn-sm",
              redoStack.length === 0 && "btn-disabled"
            )}
            onClick={onRedo}
          >
            <i className="bi bi-arrow-clockwise text-lg leading-6"></i>
          </button>
        </span>
      </div>
      <div className="navbar-center">
        <input
          className="input input-sm input-ghost bg-neutral text-neutral-content text-center"
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>
      <div className="navbar-end">
        <button className="btn btn-accent btn-sm">
          <i className="bi bi-download text-lg"></i> Export
        </button>
      </div>
    </nav>
  )
}

export default Navbar
