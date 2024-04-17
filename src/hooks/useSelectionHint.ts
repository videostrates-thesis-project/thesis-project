import { useEffect, useState } from "react"
import { useStore } from "../store"

const useSelectionHint = () => {
  const [selectionHint, setSelectionHint] = useState<string | null>(null)

  const {
    selectedClipId,
    selectedImportableClipName,
    selectedImportableImage,
    selectedImportableCustomElement,
  } = useStore()

  useEffect(() => {
    if (selectedClipId) setSelectionHint(`Clip: ${selectedClipId}`)
    else if (selectedImportableClipName)
      setSelectionHint(`Importable clip: ${selectedImportableClipName}`)
    else if (selectedImportableImage)
      setSelectionHint(`Importable image: ${selectedImportableImage.title}`)
    else if (selectedImportableCustomElement)
      setSelectionHint(
        `Importable custom element: ${selectedImportableCustomElement.name}`
      )
    else setSelectionHint(null)
  }, [
    selectedClipId,
    selectedImportableClipName,
    selectedImportableImage,
    selectedImportableCustomElement,
  ])

  return { selectionHint }
}

export { useSelectionHint }
