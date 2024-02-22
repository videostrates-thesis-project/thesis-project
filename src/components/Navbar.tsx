import { useStore } from "../store"

const Navbar = () => {
  const { fileName, setFileName } = useStore()
  return (
    <nav className="navbar min-h-10 py-2 border-b border-neutral">
      <div className="navbar-start flex items-center gap-6">
        <button className="btn btn-ghost btn-sm">
          <i className="bi bi-list text-2xl leading-6"></i>
        </button>

        <h1>Videostrates</h1>
        <span>
          <button className="btn btn-ghost btn-sm btn-disabled">
            <i className="bi bi-arrow-counterclockwise text-2xl leading-6"></i>
          </button>
          <button className="btn btn-ghost btn-sm btn-disabled">
            <i className="bi bi-arrow-clockwise text-2xl leading-6"></i>
          </button>
        </span>
      </div>
      <div className="navbar-center">
        <input
          className="input input-sm input-ghost bg-neutral text-neutral-content text-lg"
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>
      <div className="navbar-end">
        <button className="btn btn-accent btn-sm">
          <i className="bi bi-download text-xl"></i> Export
        </button>
      </div>
    </nav>
  )
}

export default Navbar
