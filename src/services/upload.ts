import { initializeApp } from "firebase/app"
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage"
import { v4 as uuid } from "uuid"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "videostrates.firebaseapp.com",
  projectId: "videostrates",
  storageBucket: "videostrates.appspot.com",
  messagingSenderId: "629366575634",
  appId: "1:629366575634:web:d788d1d6369d150cc43ecb",
  measurementId: "G-D128EYCT3T",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const storage = getStorage(app)

export const uploadVideo = async (file: Blob) => {
  const ref = storageRef(storage, `videos/${uuid()}.mp4`)

  try {
    const result = await uploadBytes(ref, file)
    const url = await getDownloadURL(result.ref)
    return url
  } catch (error) {
    console.error("Failed to upload to Firebase", error)
  }
}
