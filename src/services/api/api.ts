import {
  AzureFunctionRequest,
  ExecuteChangesFunctionResponse,
  AzureImageRequest,
  AzureImageResponse,
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
  }).then((response) => response.json())
}

export const azureImageRequest = async (
  request: AzureImageRequest
): Promise<AzureImageResponse> => {
  const ENDPOINT = "/prompt_azure_openai/image"

  return fetch(BASE_URL + ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  }).then((response) => response.json())
}
