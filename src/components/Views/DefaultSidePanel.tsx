import { useMemo } from "react"
import AvailableClips from "../AvailableMedia/AvailableClips"
import clsx from "clsx"
import Commander from "../Commander"
import { useStore } from "../../store"
import AvailableImages from "../AvailableMedia/AvailableImages"

const DefaultSidePanel = () => {
  const { sideBarTab, setSideBarTab } = useStore()

  const tabs = useMemo(() => {
    return [
      {
        icon: "bi bi-cassette",
        tab: "clips",
      },
      {
        icon: "bi bi-image",
        tab: "images",
      },
      {
        icon: "bi bi-code-slash",
        tab: "command",
      },
    ] as { icon: string; tab: SideBarTab }[]
  }, [])

  return (
    <div className="flex flex-col w-96 min-w-96 border-r border-neutral bg-base-300">
      <ul className="menu menu-horizontal bg-base-100 p-0">
        {tabs.map((t) => (
          <li key={t.tab}>
            <a
              className={`rounded-none !bg-base-300 hover:text-indigo-500`}
              onClick={() => setSideBarTab(t.tab)}
            >
              <i
                className={clsx(
                  t.icon,
                  "text-lg",
                  t.tab === sideBarTab && "text-primary"
                )}
              />
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-col p-4 w-full min-h-0 h-full overflow-y-auto">
        {sideBarTab === "clips" && <AvailableClips />}
        {sideBarTab === "command" && <Commander />}
        {sideBarTab === "images" && <AvailableImages />}
      </div>
    </div>
  )
}

export default DefaultSidePanel
