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
  const store = JSON.parse(libraryFolder + file)
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
  resultType: TestResultType
  tags: string[]
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

async function run_test(generationType: GenerationType) {
  const testResults: TestResult[] = []

  // loop through the test cases
  for (const file of fs.readdirSync(testCaseFolder)) {
    console.log("")
    console.log("Running test case: ", file)

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

    if (testCase.library) {
      await importLibrary(testCase.library + ".json")
    }

    let testResultType: TestResultType | undefined

    // run the controlled or uncontrolled generation -> get the new parsed videostrate
    console.log("Prompting llm")
    useStore.setState({ parsedVideostrate: originalVideoStrate.clone() })
    try {
      if (generationType === "controlled") {
        await openAIService.sendScriptExecutionMessage(testCase.prompt)
      } else {
        await openAIServiceUncontrolled.sendScriptExecutionMessage(
          testCase.prompt
        )
      }
    } catch (e) {
      testResultType = "error"
      throw e //todo: uncomment
    }

    if (testResultType === "error") {
      console.log("[ERROR] Test case: ", file)
      continue
    }

    const llmChangedParsedVideostrate = useStore
      .getState()
      .parsedVideostrate.clone()

    console.log("LLM changed videostrate: ", llmChangedParsedVideostrate)

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
    if (llmChangedParsedVideostrate.equals(expectedParsedVideostrate)) {
      console.log("[PASSED] Test case: ", file)
      testResultType = "passed"
    } else {
      console.log("[FAILED] Test case: ", file)
      testResultType = "failed"
    }

    // save the result
    testResults.push({
      testCase: file,
      resultType: testResultType,
      tags: testCase.tags,
    })
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

test("Run test", async () => {
  console.log("Running test")
  const testReport = await run_test("controlled")
  console.log(testReport)
}, 1000000)
