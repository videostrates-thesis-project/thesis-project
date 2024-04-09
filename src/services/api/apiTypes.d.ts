import { ChatCompletionMessageParam } from "openai/resources/index.mjs"

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

interface SearchVideosResponse {
  [videoUrl: string]: [
    {
      content: string
      highlighted: string
      start: number
      end: number
    },
  ]
}
