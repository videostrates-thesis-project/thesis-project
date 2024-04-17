import clsx from "clsx"
import SparkleImage from "../assets/sparkles.svg"

type SparkleProps = {
  className?: string
}

const Sparkle = ({ className }: SparkleProps) => {
  return (
    <div
      className={clsx(
        "absolute top-0 left-0 z-10 pointer-events-none",
        className
      )}
    >
      <img
        className="w-6 h-auto"
        style={{
          transform: "scale(1.3, 1)",
        }}
        src={SparkleImage}
      />
    </div>
  )
}

export default Sparkle
