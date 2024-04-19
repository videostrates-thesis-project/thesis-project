import clsx from "clsx"

const ChatContextTooltip = ({
  children,
  className,
  selected,
}: {
  children: React.ReactNode
  className?: string
  selected: boolean
}) => {
  return (
    <div
      className={clsx("tooltip tooltip-bottom w-[calc(50%-0.5rem)]", className)}
      data-tip={
        selected
          ? "Click to remove from context"
          : "Click to use as chat context"
      }
    >
      {children}
    </div>
  )
}

export default ChatContextTooltip
