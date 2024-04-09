import { IndexingState } from "../../types/videoClip"
import {
  AzureFunctionRequest,
  ExecuteChangesFunctionResponse,
  AzureImageRequest,
  AzureImageResponse,
  SearchVideosResponse,
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

export const indexVideo = async (
  videoUrl: string,
  name: string
): Promise<IndexingState> => {
  const ENDPOINT = "/azure_video_indexer/index"

  return fetch(BASE_URL + ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: videoUrl, name }),
  }).then((response) => response.json())
}

export const getVideoIndexingState = async (
  urls: string[]
): Promise<{
  [videoUrl: string]: IndexingState
}> => {
  const ENDPOINT = "/azure_video_indexer/status"

  return fetch(BASE_URL + ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls }),
  }).then((response) => response.json())
}

export const searchVideos = async (
  query: string,
  videos: { url: string; start: number; end: number }[]
): Promise<SearchVideosResponse> => {
  const ENDPOINT = "/azure_video_indexer/search"

  return fetch(BASE_URL + ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, videos }),
  }).then((response) => response.json())
}
