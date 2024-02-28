import { useStore } from "../store"

const Navbar = () => {
  const { fileName, setFileName } = useStore()
  return (
    <nav className="navbar min-h-10 py-2 bg-base-300 border-b border-neutral">
      <div className="navbar-start flex items-center gap-2">
        <button className="btn btn-ghost btn-sm">
          <i className="bi bi-list text-lg leading-6"></i>
        </button>
        <h1>Videostrates</h1>
        <span className="pl-4">
          <button className="btn btn-ghost btn-sm btn-disabled">
            <i className="bi bi-arrow-counterclockwise text-lg leading-6"></i>
          </button>
          <button className="btn btn-ghost btn-sm btn-disabled">
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
