import { ChatCompletionMessageParam } from "openai/resources"

//  OpenAI --------------------------------------------

type AzureModelType =
  | "mirrorverse-gpt-35-turbo"
  | "mirrorverse-gpt-4-turbo"
  | "mirrorverse-gpt-4"

interface AzureRequest {
  model: AzureModelType
  messages: ChatCompletionMessageParam[]
}

interface AzureFunctionRequest extends AzureRequest {
  tool_choice: {
    type: "function"
    function: {
      name: string
    }
  }
  functions: unknown[]
}

interface ExecuteChangesFunctionResponse {
  script: string
  explanation: string
}

interface AzureImageRequest {
  prompt: string
}

interface AzureImageResponse {
  url: string
}

interface AzureChatRequest {
  response: string
}

// Azure Video Indexer --------------------------------------------

interface IndexVideoRequest {
  url: string
  name: string
}

interface IndexVideoResponse {
  url: string
  state: "Uploaded" | "Processing" | "Processed"
  progress: number
}

type getVideoIndexingStateRequest = {
  urls: string[]
}
interface getVideoIndexingStateResponse {
  [videoUrl: string]: IndexingState
}

interface SearchVideosRequest {
  query: string
  videos: { url: string; start: number; end: number }[]
}

interface ClipResults {
  text: string
  before_text: string
  after_text: string
  highlighted: string
  start: number
  end: number
}

interface SearchVideosResponse {
  [videoUrl: string]: clipResults[]
}
