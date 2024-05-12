import * as fs from "fs"
import { parseVideostrate } from "../../../src/services/videostrateParser"
import { useStore } from "../../../src/store/index"
import openAIService from "../../../src/services/chatgpt/openai"
import openAIServiceUncontrolled from "../../../src/services/chatgpt/openaiUncontrolled"
import { runScript } from "../../../src/services/interpreter/run"
import VideoClip, { VideoClipDict } from "../../../src/types/videoClip"
import {
  CustomElement,
  CustomElementDict,
} from "../../../src/types/videoElement"

// ./test/llm-evaluation/quantitative/resources/test-cases
const rootFolder = "./test/llm-evaluation/quantitative"
const testCaseFolder = rootFolder + "/resources/test-cases"
const libraryFolder = rootFolder + "/resources/libraries"
const videostrateFolder = rootFolder + "/resources/videostrates"

/* Example test case
{
  "videostrate": "simple",
  "library": null,
  "selection": {
    "selectedClip": "clip1"
  },
  "prompt": "Move this clip 5 seconds later",
  "expectedChanges": [ // list of commands to be executed to get the expected videostrate
    "move_delta('jb2acd65-6ccb-4944-9089-28fdfc0da02b', 5)"
  ],
  "tags": [
    "timeline",
    "move",
    "selection-reference-direct"
  ]
}
*/

async function importLibrary(file: string) {
  const store = JSON.parse(fs.readFileSync(`${libraryFolder}/${file}`, "utf-8"))
  const newParsedVideostrate = useStore.getState().parsedVideostrate.clone()
  if (store.parsedVideostrate?.style) {
    store.parsedVideostrate.style.forEach(
      (s: { selector: string; style: string }) =>
        newParsedVideostrate.addStyle(s.selector, s.style)
    )
  }
  useStore.setState({
    ...useStore.getState(),
    ...store,
    clipsMetadata: store.clipsMetadata.map((c: VideoClipDict) =>
      VideoClip.fromDict(c)
    ),
    availableCustomElements: store.availableCustomElements.map(
      (a: CustomElementDict) => CustomElement.fromDict(a)
    ),
  })
  if (store.parsedVideostrate?.style) {
    useStore.getState().setParsedVideostrate(newParsedVideostrate)
  }
}

console.log(testCaseFolder)

type GenerationType = "controlled" | "uncontrolled"
type TestResultType = "passed" | "failed" | "error"

type TestResult = {
  testCase: string
  prompt: string
  resultType: TestResultType
  reason?: unknown
  tags: string[]
  generation: string
  expectedChanges: string[]
}

type TestReportForTag = {
  tag: string
  passed: number
  failed: number
  error: number
}

type TestReport = {
  generationType: GenerationType
  testResults: TestResult[]
  passed: number
  failed: number
  error: number
  testReportsForTags: TestReportForTag[]
}

function clearStore() {
  useStore.setState({
    videostrateUrl: "",
    fileName: "Untitled Videostrate",
    availableClips: [],
    clipsMetadata: [],
    availableImages: [],
    availableCustomElements: [],
    seek: 0,
    playing: false,
    playbackState: { frame: 0, time: 0 },
    selectedClip: null,
    selectedImportableClipName: null,
    selectedImportableImage: null,
    selectedImportableCustomElement: null,
    selectedChatMessage: null,
    chatMessages: [],
    currentMessages: [],
    pendingChanges: false,
    undoStack: [],
    redoStack: [],
    toasts: [],
  })
}

function setSelectedClip(id: string | undefined) {
  if (!id) return

  // find clip by name and set it as selected
  const store = useStore.getState()
  const clip = store.parsedVideostrate.all.find((c) => c.id === id)
  if (clip) {
    useStore.setState({ selectedClip: clip })
  } else {
    throw new Error(`Clip with name ${id} not found`)
  }
}

function setSelecteImportableClipName(name: string | undefined) {
  if (!name) return
  useStore.setState({ selectedImportableClipName: name })
}

function setSelectedImportableImage(title: string | undefined) {
  if (!title) return
  const image = useStore
    .getState()
    .availableImages.find((i) => i.title === title)
  if (image) {
    useStore.setState({ selectedImportableImage: image })
  } else {
    throw new Error(`Image with title ${title} not found`)
  }
}

function setSelectedImportableCustomElement(name: string | undefined) {
  if (!name) return
  const customElement = useStore
    .getState()
    .availableCustomElements.find((c) => c.name === name)
  if (customElement) {
    useStore.setState({ selectedImportableCustomElement: customElement })
  } else {
    throw new Error(`Custom element with name ${name} not found`)
  }
}

function setPlayhead(time: number) {
  useStore.setState({
    playbackState: { frame: 0, time },
    seek: time,
  })
}

async function runTestCase(
  file: string,
  generationType: GenerationType
): Promise<TestResult> {
  console.log("")
  console.log("Running test case: ", file)
  clearStore()

  // read the test case
  const testCase = JSON.parse(
    fs.readFileSync(`${testCaseFolder}/${file}`, "utf-8")
  )

  // read the specified videostrate example, parse it
  const videostrate = fs.readFileSync(
    `${videostrateFolder}/${testCase.videostrate}.html`,
    "utf-8"
  )
  const originalVideoStrate = parseVideostrate(videostrate)
  useStore.setState({ parsedVideostrate: originalVideoStrate.clone() })

  if (testCase.library) {
    await importLibrary(testCase.library + ".json")
  }

  if (testCase.selection) {
    const allowedSelections = [
      "selectedClip",
      "selectedImportableClipName",
      "selectedImportableImage",
      "selectedImportableCustomElement",
      "playhead",
    ]

    for (const selection in testCase.selection) {
      if (allowedSelections.includes(selection)) {
        const value = testCase.selection[selection]
        console.log("Setting selection: ", selection, value)
        if (selection === "selectedClip") {
          setSelectedClip(value)
        } else if (selection === "selectedImportableClipName") {
          setSelecteImportableClipName(value)
        } else if (selection === "selectedImportableImage") {
          setSelectedImportableImage(value)
        } else if (selection === "selectedImportableCustomElement") {
          setSelectedImportableCustomElement(value)
        } else if (selection === "playhead") {
          setPlayhead(value)
        }
      } else {
        throw new Error(`Invalid selection: ${selection}`)
      }
    }
  }

  let testResultType: TestResultType | undefined

  // run the controlled or uncontrolled generation -> get the new parsed videostrate
  console.log("Prompting llm")
  let generation = ""
  try {
    if (generationType === "controlled") {
      generation = await openAIService.sendScriptExecutionMessage(
        testCase.prompt
      )
    } else {
      generation = await openAIServiceUncontrolled.sendScriptExecutionMessage(
        testCase.prompt
      )
    }
  } catch (e) {
    console.log("[ERROR] Test case: ", file)
    return {
      testCase: file,
      prompt: testCase.prompt,
      resultType: "error",
      tags: testCase.tags,
      reason: `${e}`,
      expectedChanges: testCase.expectedChanges,
      generation: generation,
    }
  }

  const llmChangedParsedVideostrate = useStore
    .getState()
    .parsedVideostrate.clone()

  // run the expected changes script on the original videostrate
  console.log("Running script for expected changes")
  useStore.setState({ parsedVideostrate: originalVideoStrate.clone() })
  const script = testCase.expectedChanges.join("\n")
  await runScript(script)
  const expectedParsedVideostrate = useStore
    .getState()
    .parsedVideostrate.clone()

  // check the expected changes
  console.log("Comparing videostrates")
  console.log("Expected: ", expectedParsedVideostrate)
  console.log("Actual: ", llmChangedParsedVideostrate)
  const equalityResult = llmChangedParsedVideostrate.equals(
    expectedParsedVideostrate
  )
  let reason = ""
  if (equalityResult.equal) {
    console.log("[PASSED] Test case: ", file)
    testResultType = "passed"
  } else {
    console.log("[FAILED] Test case: ", file)
    testResultType = "failed"
    if (equalityResult.reason) {
      reason = equalityResult.reason
    }
  }

  const testResult: TestResult = {
    testCase: file,
    prompt: testCase.prompt,
    resultType: testResultType,
    tags: testCase.tags,
    expectedChanges: testCase.expectedChanges,
    generation: generation,
  }

  if (reason) {
    testResult.reason = reason
  }

  return testResult
}

async function run_test(
  generationType: GenerationType,
  passes: number,
  files?: string[],
  continue_from?: string
) {
  // const testResults: TestResult[] = []
  let testResults: TestResult[] = []
  if (continue_from) {
    testResults = JSON.parse(
      fs.readFileSync(`${rootFolder}/results/${continue_from}`, "utf-8")
    ) as TestResult[]
    console.log("Continuing from saved progress: ", continue_from)
  }

  // loop through the test cases
  if (!files) {
    files = fs.readdirSync(testCaseFolder)
  }

  console.log("Running test cases: ", files)

  for (const file of files) {
    if (testResults.find((r) => r.testCase === file)) {
      console.log("Skipping test case: ", file)
      continue
    }

    for (let i = 0; i < passes; i++) {
      const testResult = await runTestCase(file, generationType)
      testResults.push(testResult)

      const passed = testResults.filter((r) => r.resultType === "passed").length
      const failed = testResults.filter((r) => r.resultType === "failed").length
      const error = testResults.filter((r) => r.resultType === "error").length

      console.log(
        `Passed: ${passed}, Failed: ${failed}, Error: ${error}, Total: ${
          passed + failed + error
        }`
      )
    }

    const date = new Date()
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`
    fs.writeFileSync(
      `${rootFolder}/results/${generationType}-${dateString}.tmp.json`,
      JSON.stringify(testResults, null, 2)
    )
  }

  // generate report
  console.log("Generating test report")
  const testReport: TestReport = {
    generationType,
    testResults,
    passed: testResults.filter((r) => r.resultType === "passed").length,
    failed: testResults.filter((r) => r.resultType === "failed").length,
    error: testResults.filter((r) => r.resultType === "error").length,
    testReportsForTags: [],
  }

  const tags = testResults.flatMap((r) => r.tags)
  const uniqueTags = [...new Set(tags)]

  for (const tag of uniqueTags) {
    const tagResults = testResults.filter((r) => r.tags.includes(tag))
    testReport.testReportsForTags.push({
      tag,
      passed: tagResults.filter((r) => r.resultType === "passed").length,
      failed: tagResults.filter((r) => r.resultType === "failed").length,
      error: tagResults.filter((r) => r.resultType === "error").length,
    })
  }

  return testReport
}

async function run_tests(
  generationType: GenerationType,
  passes: number,
  files?: string[],
  continue_from?: string
) {
  console.log("Running test")
  const testReport = await run_test(
    generationType,
    passes,
    files,
    continue_from
  )
  console.log(testReport)

  const date = new Date()
  const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
  fs.writeFileSync(
    `${rootFolder}/results/${generationType}-${dateString}.json`,
    JSON.stringify(testReport, null, 2)
  )
}

// const files = [
//   // "add-delete-1.json",
//   // "add-delete-2-1.json",
//   // "add-delete-3-1.json",
//   // "rename-2-1.json",
//   // "rename-3-1.json",
//   // "apply-style-1.json",
//   // "add-delete-4.json",
//   // "add-delete-5.json",
//   // "move-7.json",
//   // "move-3-2.json",
//   // "move-4-1.json",
//   // "move-4-2.json",
//   "move-5.json",
//   // "rename-2-1.json",
//   // "rename-2-2.json",
//   // "speed-3-1.json",
//   // "crop-6.json",
//   // "crop-7.json",
// ]
const files = undefined
const passes = 5
// const continue_from = "controlled-2024-4-6-partial.json"
const continue_from = undefined

// test("Controlled test", async () => {
//   console.log("Running controlled tests")
//   await run_tests("controlled", passes, files, continue_from)
// }, 100000000)

test("Uncontrolled test", async () => {
  console.log("Running uncontrolled tests")
  await run_tests("uncontrolled", passes, files, continue_from)
}, 100000000)
