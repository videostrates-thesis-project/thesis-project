import { useMemo } from "react"
import { useStore } from "../store"
import { WebstrateSerializationStrategy } from "../services/serializationStrategies/webstrateSerializationStrategy"
import {
  determineReturnValue,
  determineReturnValueTyped,
} from "../services/command/determineReturnValue"
import { ReturnValue } from "../services/command/returnValue"

export const useLatestChanges = () => {
  const { parsedVideostrate, pendingChanges, undoStack } = useStore()

  const lastExecutedChange = useMemo(() => {
    if (undoStack.length === 0 || !pendingChanges) return null
    return undoStack[undoStack.length - 1]
  }, [pendingChanges, undoStack])

  const previousVideostrate = useMemo(() => {
    if (!lastExecutedChange) return null
    return undoStack[undoStack.length - 1].parsedVideostrate
  }, [lastExecutedChange, undoStack])

  const removedElements = useMemo(() => {
    if (!previousVideostrate) return []
    return previousVideostrate.all.filter(
      (element) => !parsedVideostrate.all.find((e) => e.id === element.id)
    )
  }, [parsedVideostrate.all, previousVideostrate])

  const newElements = useMemo(() => {
    if (!previousVideostrate) return []
    return parsedVideostrate.all.filter(
      (element) => !previousVideostrate.all.find((e) => e.id === element.id)
    )
  }, [parsedVideostrate.all, previousVideostrate])

  const editedElements = useMemo(() => {
    if (!lastExecutedChange) return new Map()
    const strategy = new WebstrateSerializationStrategy()
    const html = strategy.serializeHtml(parsedVideostrate)
    const parsedHtml = new DOMParser().parseFromString(html, "text/html")
    const editedElements = new Map<string, string[]>()
    const addToEdited = (elementId: string, changeType: string) => {
      const edited = editedElements.get(elementId)
      if (edited) {
        editedElements.set(elementId, [...edited, changeType])
      } else {
        editedElements.set(elementId, [changeType])
      }
    }
    lastExecutedChange.script.forEach((command) => {
      if (["create_style", "delete_style"].includes(command.command)) {
        // It detects changes applied by:
        // create_style, delete_style, create_animation, delete_animation
        const selector = determineReturnValue(
          command.args[0],
          lastExecutedChange.context
        )
        console.log("Selector: ", selector)
        const matchingElements = parsedHtml.querySelectorAll(selector.value)
        matchingElements.forEach((element) => {
          // Find the first composited parent
          while (element && !element.classList.contains("composited")) {
            element = element.parentElement
          }
          if (element) {
            addToEdited(element.id, "Styled")
          }
        })
        console.log("Matching elements: ", matchingElements)
      } else if (command.command === "assign_class") {
        const elementIds = determineReturnValueTyped<ReturnValue<string>[]>(
          "array",
          command.args[0],
          lastExecutedChange.context
        )
        elementIds.value.forEach((elementId) => {
          addToEdited(elementId.value, "Styled")
        })
      } else if (command.command === "rename_element") {
        const elementId = determineReturnValueTyped<string>(
          "string",
          command.args[0],
          lastExecutedChange.context
        )
        addToEdited(elementId.value, "Renamed")
      } else if (command.command === "set_speed") {
        const elementId = determineReturnValueTyped<string>(
          "string",
          command.args[0],
          lastExecutedChange.context
        )
        addToEdited(elementId.value, "Speed Changed")
      } else if (["move", "move_delta", "crop"].includes(command.command)) {
        const elementId = determineReturnValue(
          command.args[0],
          lastExecutedChange.context
        )
        addToEdited(elementId.value, "Moved")
      }
    })
    newElements.forEach((element) => {
      addToEdited(element.id, "Created")
    })
    removedElements.forEach((element) => {
      addToEdited(element.id, "Removed")
    })
    return editedElements
  }, [lastExecutedChange, newElements, parsedVideostrate, removedElements])

  const movedElements = useMemo(() => {
    if (!previousVideostrate) return []
    const movedElements = parsedVideostrate.all
      .filter((element) => {
        const oldElement = previousVideostrate.all.find(
          (e) => e.id === element.id
        )
        return (
          element.start !== oldElement?.start ||
          element.end !== oldElement?.end ||
          element.layer !== oldElement?.layer
        )
      })
      .map((element) => element.id)
    return movedElements
  }, [parsedVideostrate.all, previousVideostrate])

  return {
    previousVideostrate,
    removedElements,
    newElements,
    editedElements,
    movedElements,
  }
}
