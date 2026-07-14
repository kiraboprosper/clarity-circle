import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param path The path in storage where the file should be saved (e.g., 'avatars/user123.jpg').
 * @param file The file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadImage(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}