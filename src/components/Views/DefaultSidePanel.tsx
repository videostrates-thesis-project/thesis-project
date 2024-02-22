import AvailableClips from "../AvailableClips"
import Uploader from "../Uploader"

const DefaultSidePanel = () => {
  return (
    <div className="flex flex-col w-96 border-r border-neutral bg-base-300">
      {/* <div className="flex flex-row w-full bg-base-100">
        <button className="btn btn-disabled !bg-base-300 rounded-none">
          <i className="bi bi-cassette text-primary text-2xl "></i>
        </button>
        <button className="btn btn-ghost rounded-none">
          <i className="bi bi-card-text text-2xl "></i>
        </button>
        <button className="btn btn-ghost rounded-none">
          <i className="bi bi-star text-2xl "></i>
        </button>
      </div> */}
      <ul className="menu menu-horizontal bg-base-100 p-0">
        <li>
          <a className="rounded-none btn-disabled !bg-base-300">
            <i className="bi bi-cassette text-primary text-2xl "></i>
          </a>
        </li>
        <li>
          <a className="rounded-none">
            <i className="bi bi-card-text text-2xl "></i>
          </a>
        </li>
        <li>
          <a className="rounded-none">
            <i className="bi bi-star text-2xl "></i>
          </a>
        </li>
      </ul>
      <div className="flex flex-col gap-4 p-4 w-full">
        <Uploader />
        <AvailableClips />
      </div>
    </div>
  )
}

export default DefaultSidePanel
