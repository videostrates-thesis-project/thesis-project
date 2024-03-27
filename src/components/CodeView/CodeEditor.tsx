import { DiffEditor, Editor } from "@monaco-editor/react"
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

export type EditorMatch = {
  position: { lineNumber: number; column: number }
  content: string
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
  originalCode: string
  diff?: boolean
  onAccept: () => void
  onReject: () => void
  highlightedElement: HTMLElement | null
  onMatchesFound: (matches: EditorMatch[]) => void
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
  originalCode,
  diff,
  onAccept,
  onReject,
  highlightedElement,
  onMatchesFound,
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

    const { dispose } = editor.onDidChangeModelContent(() => {
      suggestionText.current = ""

      if (positionChangeTimerRef.current) {
        clearTimeout(positionChangeTimerRef.current)
      }

      positionChangeTimerRef.current = setTimeout(() => {
        getCompletion(editor.getPosition() ?? { lineNumber: 0, column: 0 })
      }, 500)
    })

    return () => {
      dispose()
    }
  }, [editor, getCompletion])

  useEffect(() => {
    if (!editor || !monaco) return

    if (!highlightedElement) {
      editor.setSelection(new monaco.Selection(0, 0, 0, 0))
      onMatchesFound([])
      return
    }

    let matches = editor
      ?.getModel()
      ?.findMatches(
        highlightedElement.outerHTML,
        false,
        false,
        false,
        null,
        true
      )
    if (!matches || matches.length === 0) {
      matches =
        editor
          ?.getModel()
          ?.findMatches(
            highlightedElement.outerHTML.replaceAll('"', "'"),
            false,
            false,
            false,
            null,
            true
          ) ?? []
    }

    onMatchesFound(
      matches.map((match) => ({
        position: {
          lineNumber: match.range.startLineNumber,
          column: match.range.startColumn,
        },
        content: match.matches?.[0] ?? "",
      }))
    )

    editor.setSelections(
      matches.map(
        (match) =>
          new monaco.Selection(
            match.range.startLineNumber,
            match.range.startColumn,
            match.range.endLineNumber,
            match.range.endColumn
          )
      )
    )

    if (matches.length > 0) {
      editor.revealLine(matches[0].range.startLineNumber)
    }
  }, [editor, highlightedElement, monaco, onMatchesFound])

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-row items-center">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={clsx(
              "px-4 py-2 bg-neutral min-w-24 flex flex-row items-center text-sm border-b-2 hover:border-primary cursor-pointer",
              currentFileName === tab.name
                ? "border-primary"
                : "border-transparent"
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
      {diff && (
        <div className="flex flex-row gap-2 absolute bottom-4 right-4 z-10">
          <button className="btn btn-accent btn-sm" onClick={onAccept}>
            <i className="bi bi-check2 text-lg"></i> Accept
          </button>
          <button className="btn btn-error btn-sm" onClick={onReject}>
            <i className="bi bi-x text-2xl"></i> Reject
          </button>
        </div>
      )}
      {diff ? (
        <DiffEditor
          onMount={(_, monaco) => {
            setMonaco(monaco)
          }}
          width="100%"
          height="calc(100vh - 5rem)"
          language={language}
          original={originalCode}
          modified={code}
          theme="vs-dark"
        />
      ) : (
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
      )}
    </div>
  )
}

export default CodeEditor
