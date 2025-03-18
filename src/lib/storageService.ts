import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { User } from 'firebase/auth';

// Define a type for the upload result
interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

/**
 * Upload an image to Firebase Storage
 * @param file The file to upload
 * @param user The current user
 * @param folder Optional folder path
 * @returns Promise with the download URL and file path
 */
export async function uploadImage(
  file: File, 
  user: User,
  folder: string = 'wiki-images'
): Promise<UploadResult> {
  try {
    // Create a unique filename using timestamp and original file extension
    const fileExtension = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Create the full path for the file
    const path = `${folder}/${user.uid}/${uniqueFilename}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, path);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const url = await getDownloadURL(storageRef);
    
    return {
      url,
      path,
      filename: uniqueFilename
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Firebase Storage
 * @param files Array of files to upload
 * @param user The current user
 * @param folder Optional folder path
 * @returns Promise with array of download URLs and file paths
 */
export async function uploadMultipleImages(
  files: File[],
  user: User,
  folder: string = 'wiki-images'
): Promise<UploadResult[]> {
  try {
    // Upload all files in parallel
    const uploadPromises = files.map(file => uploadImage(file, user, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
} 