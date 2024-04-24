import { useEffect, useState } from "react"
import { useStore } from "../store"

const useSelectionHint = () => {
  const [selectionHint, setSelectionHint] = useState<string | null>(null)

  const {
    selectedClip,
    selectedImportableClipName,
    selectedImportableImage,
    selectedImportableCustomElement,
  } = useStore()

  useEffect(() => {
    if (selectedClip) setSelectionHint(`Clip: ${selectedClip.name}`)
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
    selectedClip,
    selectedImportableClipName,
    selectedImportableImage,
    selectedImportableCustomElement,
  ])

  return { selectionHint }
}

export { useSelectionHint }
