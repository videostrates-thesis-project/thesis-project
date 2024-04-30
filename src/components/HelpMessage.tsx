import clsx from "clsx"
import { useCallback, useState } from "react"
import SparkleImage from "../assets/sparkles-primary.svg"

const HelpMessage = () => {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(true)

  const openModal = useCallback(() => {
    setHighlighted(false)
    setOpen(true)
  }, [setOpen])

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])
  return (
    <>
      <div className="tooltip tooltip-bottom" data-tip="Help">
        <button
          className={clsx(
            "btn btn-sm btn-neutral",
            highlighted && "highlight-clip"
          )}
          onClick={openModal}
        >
          <i className="bi bi-question text-2xl"></i>
        </button>
      </div>
      <dialog
        id="help_message"
        className="modal bg-black/60 backdrop-blur-sm"
        open={open}
        onClick={closeModal}
      >
        <div
          className="modal-box max-w-5xl pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-action absolute right-4 -top-2">
            <button onClick={closeModal} className="btn btn-sm btn-ghost">
              <i className="bi bi-x text-2xl"></i>
            </button>
          </div>
          <h2 className="font-bold text-xl mb-4">How to use the app</h2>
          <div className="flex flex-col gap-6">
            <section className="text-left flex flex-col gap-0">
              <h3 className="font-bold text-xl">Side Panel</h3>
              <p>
                The <strong>left side panel</strong> provides you with
                resources: <i className="bi text-primary bi-cassette"></i>{" "}
                Clips, <i className="bi text-primary bi-image"></i> Images, and{" "}
                <i className="bi text-primary bi-star"></i> Custom Elements.
                <ul className="list-disc pl-6">
                  <li>
                    <strong>Querying:</strong>{" "}
                    <i className="bi text-primary bi-search"></i> searching in
                    transcripts of the clips in the{" "}
                    <i className="bi text-primary bi-cassette"></i> clips tab
                  </li>
                  <li>
                    <strong>Generating images:</strong> Generate an image from a
                    prompt in the <i className="bi text-primary bi-image"></i>{" "}
                    images tab
                  </li>
                </ul>
              </p>
            </section>
            <section className="text-left flex flex-col gap-0">
              <h3 className="font-bold text-xl">Timeline</h3>
              <p>
                Manipulate the elements on the timeline:
                <ul className="list-disc pl-6">
                  <li>
                    <strong>Select</strong> by clicking
                  </li>
                  <li>
                    <strong>Move</strong> by dragging
                  </li>
                  <li>
                    <strong>Resize</strong> by dragging the edges
                  </li>
                  <li>
                    <strong>Edit</strong> or <strong>Add to the library</strong>{" "}
                    by right clicking (works only on custom elements)
                  </li>
                  <li>
                    <i className="bi text-primary bi-layer-forward"></i>{" "}
                    <strong>Move layer up</strong> (shortcut: ArrowUp)
                  </li>
                  <li>
                    <i className="bi text-primary bi-layer-backward"></i>{" "}
                    <strong>Move layer down</strong> (shortcut: ArrowDown)
                  </li>
                  <li>
                    <i className="bi text-primary bi-trash"></i>{" "}
                    <strong>Delete</strong> element (shortcut: Delete)
                  </li>
                  <li>
                    <i className="bi text-primary bi-zoom-in"></i>{" "}
                    <strong>Zoom in/out</strong> the timeline using buttons or
                    ctrl+scroll
                  </li>
                  <li>
                    <strong>Move sideways</strong> using scrollbar or
                    shift+scroll
                  </li>
                  <li>
                    <i className="bi text-primary bi-plus-lg"></i>{" "}
                    <strong>Element</strong> button to add a custom element
                    (available only when nothing is selected on the timeline)
                  </li>
                </ul>
              </p>
            </section>
            <section className="text-left flex flex-col gap-0">
              <h3 className="font-bold text-xl">Chat</h3>
              <p>Chat is a place where you can communicate with the AI.</p>
              <p>
                <i className="bi text-primary bi-arrow-clockwise"></i>{" "}
                <strong>Start new conversation</strong> if the AI gets stuck and
                cannot solve your problem.
              </p>
            </section>
            <section className="text-left flex flex-col gap-0">
              <h3 className="font-bold text-xl">Code View</h3>
              <p>
                <i className="bi text-primary bi-star"></i>{" "}
                <strong>Custom Elements</strong> can be edited. Right click on
                the element in the timeline and select{" "}
                <strong>Edit code</strong> to open the{" "}
                <strong>Code View</strong>.
              </p>
              <p>
                <img
                  className="w-4 h-auto inline"
                  style={{
                    transform: "scale(1.3, 1)",
                  }}
                  src={SparkleImage}
                />{" "}
                Click on a specific element in the preview to provide it as a{" "}
                <strong>context</strong> for the AI.
              </p>
            </section>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default HelpMessage
