import {
  AzureFunctionRequest,
  ExecuteChangesFunctionResponse,
} from "./apiTypes"

const BASE_URL = "http://localhost:5001"

export const azureFunctionRequest = async (
  request: AzureFunctionRequest
): Promise<ExecuteChangesFunctionResponse> => {
  const ENDPOINT = "/prompt_azure_openai/function"

  return fetch(BASE_URL + ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  }).then(
    (response) => response.json() as unknown as ExecuteChangesFunctionResponse
  )
}
