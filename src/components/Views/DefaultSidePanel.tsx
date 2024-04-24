import { useMemo } from "react"
import AvailableClips from "../AvailableMedia/AvailableClips"
import clsx from "clsx"
import Commander from "../Commander"
import { useStore } from "../../store"
import AvailableImages from "../AvailableMedia/AvailableImages"
import AvailableCustomElements from "../AvailableMedia/AvailableCustomElements"

const DefaultSidePanel = () => {
  const { sideBarTab, setSideBarTab, showScriptTab } = useStore()

  const tabs = useMemo(() => {
    return [
      {
        icon: "bi bi-cassette",
        tab: "clips",
        tooltip: "Clips",
      },
      {
        icon: "bi bi-image",
        tab: "images",
        tooltip: "Images",
      },
      {
        icon: "bi bi-star",
        tab: "custom-elements",
        tooltip: "Custom Elements",
      },
      {
        icon: "bi bi-code-slash",
        tab: "command",
        tooltip: "Commander",
        hidden: !showScriptTab,
      },
    ] as { icon: string; tab: SideBarTab; tooltip: string; hidden?: boolean }[]
  }, [showScriptTab])

  return (
    <div className="flex flex-col w-96 min-w-96 border-r border-neutral bg-base-300">
      <ul className="menu menu-horizontal bg-base-100 p-0">
        {tabs
          .filter((t) => !t.hidden)
          .map((t) => (
            <li key={t.tab}>
              <div className="tooltip p-0" data-tip={t.tooltip}>
                <a
                  className={clsx(
                    "btn btn-ghost rounded-none",
                    t.tab === sideBarTab && "btn-active !bg-base-300"
                  )}
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
              </div>
            </li>
          ))}
      </ul>
      <div className="flex flex-col p-4 w-full min-h-0 h-full overflow-y-scroll">
        {sideBarTab === "clips" && <AvailableClips />}
        {sideBarTab === "command" && <Commander />}
        {sideBarTab === "images" && <AvailableImages />}
        {sideBarTab === "custom-elements" && <AvailableCustomElements />}
      </div>
    </div>
  )
}

export default DefaultSidePanel
