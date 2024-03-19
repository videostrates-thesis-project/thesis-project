import { initializeApp } from "firebase/app"
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage"
import { v4 as uuid } from "uuid"
import { useStore } from "../store"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "videostrates.firebaseapp.com",
  projectId: "videostrates",
  storageBucket: "videostrates.appspot.com",
  messagingSenderId: "629366575634",
  appId: "1:629366575634:web:d788d1d6369d150cc43ecb",
  measurementId: "G-D128EYCT3T",
}

const BASE_URL = "https://storage.googleapis.com/videostrates.appspot.com/"

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const storage = getStorage(app)

const uploadFile = async (file: Blob, extension: string) => {
  const ref = storageRef(storage, `files/${uuid()}.${extension}`)

  try {
    const result = await uploadBytes(ref, file)
    const url = BASE_URL + result.metadata.fullPath
    return url
  } catch (error) {
    console.error("Failed to upload to Firebase", error)
    useStore
      .getState()
      .addToast("error", "Error uploading a file", (error as Error).message)
  }
}

export const uploadVideo = async (file: Blob) => {
  return uploadFile(file, "mp4")
}

export const uploadImage = async (file: Blob) => {
  return uploadFile(file, "png")
}
