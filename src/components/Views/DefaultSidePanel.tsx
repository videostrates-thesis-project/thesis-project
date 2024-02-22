import AvailableClips from "../AvailableClips"
import Uploader from "../Uploader"

const DefaultSidePanel = () => {
  return (
    <div className="flex flex-col w-96 min-w-96 border-r border-neutral bg-base-300">
      <ul className="menu menu-horizontal bg-base-100 p-0">
        <li>
          <a className="rounded-none btn-disabled !bg-base-300">
            <i className="bi bi-cassette text-primary text-lg "></i>
          </a>
        </li>
        <li>
          <a className="rounded-none">
            <i className="bi bi-card-text text-lg "></i>
          </a>
        </li>
        <li>
          <a className="rounded-none">
            <i className="bi bi-star text-lg "></i>
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
