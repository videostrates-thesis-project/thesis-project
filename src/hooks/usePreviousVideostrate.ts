import { useMemo } from "react"
import { useStore } from "../store"

export const usePreviousVideostrate = () => {
  const { parsedVideostrate, pendingChanges, undoStack } = useStore()

  const previousVideostrate = useMemo(() => {
    if (undoStack.length === 0 || !pendingChanges) return null
    return undoStack[undoStack.length - 1].parsedVideostrate
  }, [pendingChanges, undoStack])

  const removedElements = useMemo(() => {
    if (!previousVideostrate) return []
    return previousVideostrate.all.filter(
      (element) => !parsedVideostrate.all.includes(element)
    )
  }, [parsedVideostrate.all, previousVideostrate])

  return { previousVideostrate, removedElements }
}
