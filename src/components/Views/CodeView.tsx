import { useCallback, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useStore } from "../../store"
import Browser from "../CodeView/Browser"
import { CustomElement } from "../../types/videoElement"
import CodeEditor, { EditorFile } from "../CodeView/CodeEditor"
import { css_beautify, html_beautify } from "js-beautify"
import { executeScript } from "../../services/command/executeScript"
import { VideostrateStyle } from "../../types/parsedVideostrate"
import { ExecutableCommand } from "../../services/command/recognizedCommands"
import { parseStyle } from "../../services/parser/parseStyle"

const CodeView = () => {
  const { elementId } = useParams()
  const { parsedVideostrate } = useStore()
  const [html, setHtml] = useState("")
  const [css, setCss] = useState("")
  const [oldCss, setOldCss] = useState<VideostrateStyle[]>([])
  const [oldCssText, setOldCssText] = useState("")
  const [oldHtmlText, setOldHtmlText] = useState("")
  const [currentFileName, setCurrentFileName] = useState("")
  const navigate = useNavigate()

  const element = useMemo(() => {
    const element = parsedVideostrate?.elements.find(
      (el) => el.id === elementId
    ) as CustomElement
    if (!element) return null

    element.name = element.name || "element"
    const beautifiedHtml = html_beautify(element.content, {
      indent_size: 4,
    })
    setHtml(beautifiedHtml)
    setOldHtmlText(beautifiedHtml)
    const parser = new DOMParser()
    const document = parser.parseFromString(element.content, "text/html")
    const filteredCss = parsedVideostrate.style.filter(
      (style) => document.querySelectorAll(style.selector).length > 0
    )
    setOldCss(filteredCss)
    const serializedCss = filteredCss
      .map((style) => `${style.selector} { ${style.style} }`)
      .join("\n")
    const beautifiedCss = css_beautify(serializedCss, { indent_size: 4 })
    setCss(beautifiedCss)
    setOldCssText(beautifiedCss)

    setCurrentFileName(element.name + ".html")

    return element
  }, [elementId, parsedVideostrate?.elements, parsedVideostrate.style])

  const files: EditorFile[] = useMemo(() => {
    if (!element) return []

    return [
      {
        name: element.name + ".html",
        isModified: html_beautify(html, { indent_size: 4 }) !== oldHtmlText,
      },
      {
        name: element.name + ".css",
        isModified: css_beautify(css, { indent_size: 4 }) !== oldCssText,
      },
    ]
  }, [css, element, html, oldCssText, oldHtmlText])

  const onEditorChange = useCallback(
    (code?: string) => {
      if (currentFileName.endsWith("css")) {
        setCss(code ?? "")
      } else {
        setHtml(code ?? "")
      }
    },
    [currentFileName]
  )

  const onChangeTab = useCallback(
    (newFileName: string) => {
      if (files.map((f) => f.name).includes(newFileName)) {
        setCurrentFileName(newFileName)
      }
    },
    [files]
  )

  const currentCode = useMemo(() => {
    if (currentFileName.endsWith("css")) {
      return css
    } else {
      return html
    }
  }, [css, currentFileName, html])

  const currentLanguage = useMemo(() => {
    if (currentFileName.endsWith("css")) {
      return "css"
    } else {
      return "html"
    }
  }, [currentFileName])

  const displayedHtml = useMemo(() => {
    return `<html><head><style>${css}</style></head><body>${html}</body</html>`
  }, [css, html])

  const onSave = useCallback(() => {
    const parsedStyle = parseStyle(css)
    const script: ExecutableCommand[] = [
      {
        command: "edit_custom_element",
        args: [`"${elementId}"`, `"${html}"`],
      },
      ...oldCss.map((style) => ({
        command: "delete_style" as const,
        args: [`"${style.selector}"`],
      })),
      ...parsedStyle.style.map((style) => ({
        command: "create_style" as const,
        args: [`"${style.selector}"`, `"${style.style}"`],
      })),
    ]

    executeScript(script)
    navigate("/")
  }, [css, elementId, html, navigate, oldCss])

  const onFormat = useCallback(() => {
    setHtml((prev) => html_beautify(prev, { indent_size: 4 }))
    setCss((prev) => css_beautify(prev, { indent_size: 4 }))
  }, [])

  const onHotkey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.metaKey && event.key === "s") {
        event.preventDefault()

        onSave()
      } else if (event.metaKey && event.shiftKey && event.key === "f") {
        event.preventDefault()

        onFormat()
      }
    },
    [onFormat, onSave]
  )

  const onBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <div className="grid grid-cols-2" onKeyDown={onHotkey}>
      {!element && (
        <div className="flex flex-col p-10 m-auto text-2xl font-bold gap-4">
          Element not found or cannot be edited.
          <button className="btn btn-primary" onClick={onBack}>
            Back
          </button>
        </div>
      )}
      {element && (
        <>
          <div className="grid grid-rows-2">
            <Browser
              html={displayedHtml}
              highlight={() => {}}
              isHighlighting={false}
            />
            <h1>Chat</h1>
          </div>
          <CodeEditor
            code={currentCode}
            language={currentLanguage}
            onChange={onEditorChange}
            files={files}
            currentFileName={currentFileName}
            onChangeTab={onChangeTab}
            onSave={onSave}
            onFormat={onFormat}
          />
        </>
      )}
    </div>
  )
}

export default CodeView
