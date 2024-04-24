import { useCallback, useState } from "react"
import { undo } from "../services/interpreter/undo"
import { useStore } from "../store"
import clsx from "clsx"
import { redo } from "../services/interpreter/redo"
import HamburgerMenu from "./HamburgerMenu/HamburgerMenu"

const Navbar = () => {
  const { fileName, setFileName, undoStack, redoStack } = useStore()
  const [hamburgerOpen, setHamburgerOpen] = useState(false)

  const onUndo = useCallback(() => {
    undo()
  }, [])

  const onRedo = useCallback(() => {
    redo()
  }, [])

  const toggleHamburger = useCallback(() => {
    setHamburgerOpen((prev) => !prev)
  }, [])

  const closeHamburger = useCallback(() => {
    setHamburgerOpen(false)
  }, [])

  return (
    <>
      <HamburgerMenu isOpen={hamburgerOpen} onClose={closeHamburger} />
      <nav className="navbar h-12 min-h-12 py-2 bg-base-300 border-b border-neutral">
        <div className="navbar-start flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={toggleHamburger}>
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
            readOnly
          />
        </div>
        <div className="navbar-end"></div>
      </nav>
    </>
  )
}

export default Navbar
