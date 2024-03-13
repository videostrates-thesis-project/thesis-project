import { useEditedClipDetails } from "../../store/editedClipDetails"

const HoveredClipDetails = () => {
  const { details, position } = useEditedClipDetails()
  return details ? (
    <div
      className="bg-neutral rounded shadow shadow-base-300 text-neutral-content w-fit h-fit flex flex-col items-start gap-2 p-4 absolute z-30"
      style={{
        left: `${position.x + 4}px`,
        bottom: `${position.y + 4}px`,
      }}
    >
      {details.map((d) => {
        return <p key={d}>{d}</p>
      })}
    </div>
  ) : null
}

export default HoveredClipDetails
