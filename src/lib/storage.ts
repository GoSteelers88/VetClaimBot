import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  fullPath: string;
  name: string;
  size: number;
}

export interface UploadProgress {
  progress: number;
  error?: string;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Start upload progress
    onProgress?.({ progress: 0 });

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Update progress
    onProgress?.({ progress: 90 });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Complete progress
    onProgress?.({ progress: 100 });

    return {
      url: downloadURL,
      fullPath: snapshot.ref.fullPath,
      name: file.name,
      size: file.size
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    onProgress?.({ progress: 0, error: errorMessage });
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Generate a unique file path for user documents
 */
export function generateFilePath(userId: string, fileName: string, documentType?: string): string {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const folder = documentType ? `documents/${documentType}` : 'documents';
  
  return `users/${userId}/${folder}/${timestamp}_${cleanFileName}`;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, options?: {
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}): { valid: boolean; error?: string } {
  const {
    allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    maxSize = 20 * 1024 * 1024 // 20MB default
  } = options || {};

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}