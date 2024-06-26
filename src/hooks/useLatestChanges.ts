import { useMemo } from "react"
import { useStore } from "../store"
import { WebstrateSerializationStrategy } from "../services/serializationStrategies/webstrateSerializationStrategy"

export interface ClipChange {
  changeType: ChangeType
  description: string
}

export enum ChangeType {
  Removed = "Removed",
  New = "New",
  Edited = "Edited",
}

export const useLatestChanges = () => {
  const { parsedVideostrate, pendingChanges, undoStack } = useStore()

  const lastExecutedChange = useMemo(() => {
    if (undoStack.length === 0 || !pendingChanges) return null
    return undoStack[undoStack.length - 1].script
  }, [pendingChanges, undoStack])

  const previousVideostrate = useMemo(() => {
    if (!lastExecutedChange) return null
    return undoStack[undoStack.length - 1].script.parsedVideostrate
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

  const movedElements = useMemo(() => {
    if (!previousVideostrate) return []
    const movedElements = parsedVideostrate.all
      .filter((element) => {
        const oldElement = previousVideostrate.all.find(
          (e) => e.id === element.id
        )
        return (
          element.start !== oldElement?.start || element.end !== oldElement?.end
        )
      })
      .map((element) => element.id)
    return movedElements
  }, [parsedVideostrate.all, previousVideostrate])

  const layerChangedElements = useMemo(() => {
    if (!previousVideostrate) return []
    const movedElements = parsedVideostrate.all
      .filter((element) => {
        const oldElement = previousVideostrate.all.find(
          (e) => e.id === element.id
        )
        return element.layer !== oldElement?.layer
      })
      .map((element) => element.id)
    return movedElements
  }, [parsedVideostrate.all, previousVideostrate])

  const editedElements = useMemo(() => {
    if (!lastExecutedChange) return new Map<string, ClipChange[]>()
    const strategy = new WebstrateSerializationStrategy()
    const html = strategy.serializeHtml(parsedVideostrate)
    const parsedHtml = new DOMParser().parseFromString(html, "text/html")
    const editedElements = new Map<string, ClipChange[]>()
    const addToEdited = (elementId: string, change: ClipChange) => {
      const edited = editedElements.get(elementId)
      if (change.changeType === ChangeType.New) {
        editedElements.set(elementId, [change])
      } else if (edited) {
        if (edited.some((e) => e.changeType === ChangeType.New)) return
        if (edited.some((e) => e.description === change.description)) return
        editedElements.set(elementId, [...edited, change])
      } else {
        editedElements.set(elementId, [change])
      }
    }
    newElements.forEach((element) => {
      addToEdited(element.id, {
        changeType: ChangeType.New,
        description: "A new element",
      })
    })
    removedElements.forEach((element) => {
      addToEdited(element.id, {
        changeType: ChangeType.Removed,
        description: "Removed",
      })
    })
    layerChangedElements.forEach((elementId) => {
      addToEdited(elementId, {
        changeType: ChangeType.Edited,
        description: "Layer changed",
      })
    })
    movedElements.forEach((elementId) => {
      const oldElement = previousVideostrate?.all.find(
        (e) => e.id === elementId
      )
      const newElement = parsedVideostrate.all.find((e) => e.id === elementId)
      const moveShift = (newElement?.start || 0) - (oldElement?.start || 0)
      if (moveShift !== 0) {
        const formattedShift =
          moveShift % 1 === 0 ? moveShift.toFixed(0) : moveShift.toFixed(2)
        addToEdited(elementId, {
          changeType: ChangeType.Edited,
          description: `Moved by ${formattedShift} seconds`,
        })
      }
    })
    lastExecutedChange.script.forEach((command) => {
      if (
        ["create_style", "delete_style", "create_or_update_style"].includes(
          command.name
        )
      ) {
        // It detects changes applied by:
        // create_style, delete_style, create_animation, delete_animation
        const selector = command.arguments[0]
        const matchingElements = parsedHtml.querySelectorAll(selector)
        matchingElements.forEach((element) => {
          // Find the first composited parent
          while (element && !element.classList.contains("composited")) {
            element = element.parentElement
          }
          if (element) {
            addToEdited(element.id, {
              changeType: ChangeType.Edited,
              description: "Style changed",
            })
          }
        })
      } else if (
        command.name === "assign_class" ||
        command.name === "remove_class"
      ) {
        const elementIds = command.arguments[0]
        elementIds.forEach((elementId: string) => {
          addToEdited(elementId, {
            changeType: ChangeType.Edited,
            description: "Style changed",
          })
        })
      } else if (command.name === "rename_element") {
        const elementId = command.arguments[0]
        addToEdited(elementId, {
          changeType: ChangeType.Edited,
          description: "The name changed",
        })
      } else if (command.name === "set_speed") {
        const elementId = command.arguments[0]
        addToEdited(elementId, {
          changeType: ChangeType.Edited,
          description: "Speed Changed",
        })
      } else if (["crop"].includes(command.name)) {
        const elementId = command.arguments[0]
        addToEdited(elementId, {
          changeType: ChangeType.Edited,
          description: "Crop changed",
        })
      } else if (command.name === "reposition") {
        const elementId = command.arguments[0]
        addToEdited(elementId, {
          changeType: ChangeType.Edited,
          description: "Repositioned",
        })
      }
    })
    return editedElements
  }, [
    lastExecutedChange,
    layerChangedElements,
    movedElements,
    newElements,
    parsedVideostrate,
    previousVideostrate?.all,
    removedElements,
  ])

  return {
    previousVideostrate,
    removedElements,
    newElements,
    editedElements,
    movedElements,
  }
}
