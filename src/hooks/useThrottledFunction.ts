import { useCallback, useState } from "react"

const useThrottledFunction = <T extends Array<unknown>>(
  fn: (...args: T) => unknown,
  delay: number = 300
) => {
  const [lastCalled, setLastCalled] = useState(0)

  const callFunction = useCallback(
    (...args: T) => {
      if (Date.now() - lastCalled > delay) {
        setLastCalled(Date.now())
        fn(...args)
      }
    },
    [fn, lastCalled, delay]
  )

  return callFunction
}

export default useThrottledFunction
