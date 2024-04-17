import clsx from "clsx"
import { useCallback, useEffect, useState } from "react"
import HamburgerMenuContent from "./HamburgerMenuContent"

type HamburgerMenuProps = {
  isOpen: boolean
  onClose: () => void
}

const HamburgerMenu = ({ isOpen, onClose }: HamburgerMenuProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const close = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      close()
    }
  }, [close, isOpen])

  if (!isVisible) return null

  return (
    <>
      <div
        className={clsx(
          "absolute top-10 left-0 right-0 bottom-0 bg-black bg-opacity-60 backdrop-blur-sm z-[49]",
          isClosing ? "animate-fade-out" : "animate-fade-in"
        )}
        onClick={close}
      ></div>

      <div
        className={clsx(
          "fixed top-10 left-0 bottom-0 w-96 bg-base-300 z-50 flex flex-col items-center gap-5 px-4",
          isClosing ? "animate-slide-out" : "animate-slide-in"
        )}
      >
        <h1>Options</h1>
        <HamburgerMenuContent />
      </div>
    </>
  )
}

export default HamburgerMenu
