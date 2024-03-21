import { Editor } from "@monaco-editor/react"
import HtmlImage from "../../assets/html.svg"
import CssImage from "../../assets/css.svg"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import clsx from "clsx"
import openAIService from "../../services/chatgpt/openai"
import { editor } from "monaco-editor"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api"

type Monaco = typeof monaco

export type EditorFile = {
  name: string
  isModified?: boolean
}

type CodeEditorProps = {
  code: string
  language: string
  onChange: (newValue?: string) => void
  onChangeTab: (tab: string) => void
  onSave: () => void
  onFormat: () => void
  currentFileName: string
  files: EditorFile[]
}

const CodeEditor = ({
  code,
  language,
  onChange,
  currentFileName,
  files,
  onChangeTab,
  onSave,
  onFormat,
}: CodeEditorProps) => {
  const [editor, setEditor] = useState<editor.ICodeEditor>()
  const [monaco, setMonaco] = useState<Monaco>()
  const positionChangeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const suggestionText = useRef("")
  const tabs = useMemo(() => {
    return files.map((f) => ({
      name: f.name,
      src: f.name.endsWith(".html") ? HtmlImage : CssImage,
      isModified: f.isModified,
    }))
  }, [files])

  const getCompletion = useCallback(
    async (position: { lineNumber: number; column: number }) => {
      suggestionText.current = ""

      const completion = await openAIService.githubCopilotAtHome(
        code,
        position.lineNumber,
        position.column
      )
      suggestionText.current = completion ?? ""

      setTimeout(() => {
        if (suggestionText.current) {
          editor?.trigger("anyString", "editor.action.triggerSuggest", {})
        }
      }, 40)
    },
    [code, editor]
  )

  const provideCompletionItems = useCallback(
    (
      model: editor.ITextModel,
      position: monaco.Position
    ): monaco.languages.CompletionList => {
      if (!monaco) return { suggestions: [] }

      return {
        suggestions: [
          {
            insertText: suggestionText.current,
            label: suggestionText.current,
            kind: monaco.languages.CompletionItemKind.Snippet,
            preselect: true,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: model.getWordUntilPosition(position).startColumn,
              endColumn: position.column,
            },
          },
        ],
      }
    },
    [monaco]
  )

  useEffect(() => {
    if (!monaco) return

    const { dispose } = monaco.languages.registerCompletionItemProvider(
      "html",
      {
        provideCompletionItems,
      }
    )

    return () => {
      dispose()
    }
  }, [monaco, provideCompletionItems])

  useEffect(() => {
    if (!editor) return

    const { dispose } = editor.onDidChangeCursorPosition((e) => {
      suggestionText.current = ""

      if (positionChangeTimerRef.current) {
        clearTimeout(positionChangeTimerRef.current)
      }

      positionChangeTimerRef.current = setTimeout(() => {
        getCompletion(e.position)
      }, 1000)
    })

    return () => {
      dispose()
    }
  }, [editor, getCompletion])

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-row items-center">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={clsx(
              "px-4 py-2 bg-neutral min-w-24 flex flex-row items-center text-sm border-b-2 border-transparent hover:border-primary cursor-pointer",
              currentFileName === tab.name && "border-primary"
            )}
            onClick={() => onChangeTab(tab.name)}
          >
            <img className="pr-2 w-8" src={tab.src} /> {tab.name}
            <div
              className={clsx(
                "w-2 h-2 bg-neutral rounded-full ml-2",
                tab.isModified && "bg-neutral-100"
              )}
            ></div>
          </div>
        ))}
        <button
          className="btn btn-warning btn-sm ml-auto mr-2"
          onClick={onFormat}
        >
          <i className="bi bi-braces text-lg"></i>Format
        </button>
        <button className="btn btn-info btn-sm mx-2" onClick={onSave}>
          <i className="bi bi-floppy text-lg"></i>Save
        </button>
      </div>
      <Editor
        onMount={(editor, monaco) => {
          setEditor(editor)
          setMonaco(monaco)
        }}
        width="100%"
        height="calc(100vh - 5rem)"
        language={language}
        defaultValue={code}
        value={code}
        theme="vs-dark"
        onChange={onChange}
        options={{
          inlineSuggest: {
            enabled: true,
            showToolbar: "never",
          },
          suggest: {
            preview: true,
            showStatusBar: false,
          },
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
        }}
      />
    </div>
  )
}

export default CodeEditor
