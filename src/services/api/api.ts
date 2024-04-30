import {
  AzureFunctionRequest,
  ExecuteChangesFunctionResponse,
  AzureImageRequest,
  AzureImageResponse,
  SearchVideosRequest,
  SearchVideosResponse,
  IndexVideoResponse,
  getVideoIndexingStateRequest,
  IndexVideoRequest,
  getVideoIndexingStateResponse,
  AzureRequest,
  AzureChatRequest,
} from "./apiTypes"
import { API_URL } from "../../envVariables"

export const azureFunctionRequest = async (
  request: AzureFunctionRequest
): Promise<ExecuteChangesFunctionResponse> => {
  const ENDPOINT = "/prompt_azure_openai/function"
  return perform_request(ENDPOINT, request)
}

export const azureImageRequest = async (
  request: AzureImageRequest
): Promise<AzureImageResponse> => {
  const ENDPOINT = "/prompt_azure_openai/image"
  return perform_request(ENDPOINT, request)
}

export const azureChatRequest = async (
  request: AzureRequest
): Promise<AzureChatRequest> => {
  const ENDPOINT = "/prompt_azure_openai/message"
  return perform_request(ENDPOINT, request)
}

export const indexVideo = async (
  request: IndexVideoRequest
): Promise<IndexVideoResponse> => {
  const ENDPOINT = "/azure_video_indexer/index"
  return perform_request(ENDPOINT, request)
}

export const getVideoIndexingState = async (
  request: getVideoIndexingStateRequest
): Promise<getVideoIndexingStateResponse> => {
  const ENDPOINT = "/azure_video_indexer/status"
  return perform_request(ENDPOINT, request)
}

export const searchVideos = async (
  request: SearchVideosRequest
): Promise<SearchVideosResponse> => {
  const ENDPOINT = "/azure_video_indexer/search"
  return perform_request(ENDPOINT, request)
}

const perform_request = async (
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  return fetch(API_URL + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  }).then((response) => response.json())
}
