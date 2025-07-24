import { storage } from './firebase';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  getMetadata,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { SupportingDocument, DocumentType } from '@/types';
import { Timestamp } from 'firebase/firestore';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface DocumentUploadResult {
  success: boolean;
  document?: SupportingDocument;
  error?: string;
}

/**
 * Upload a document to Firebase Storage
 */
export const uploadDocument = async (
  file: File,
  userId: string,
  documentType: DocumentType,
  onProgress?: (progress: UploadProgress) => void
): Promise<DocumentUploadResult> => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomId}.${fileExtension}`;
    const filePath = `veterans/${userId}/documents/${fileName}`;

    // Create storage reference
    const storageRef = ref(storage(), filePath);

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Progress tracking
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          };
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          resolve({ success: false, error: error.message });
        },
        async () => {
          try {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const metadata = await getMetadata(uploadTask.snapshot.ref);

            const document: SupportingDocument = {
              id: `doc_${timestamp}_${randomId}`,
              fileName: file.name,
              fileType: file.type,
              uploadDate: Timestamp.now(),
              firebaseStoragePath: filePath,
              documentType,
              verified: false
            };

            resolve({ success: true, document });
          } catch (error) {
            console.error('Error getting download URL:', error);
            resolve({ success: false, error: 'Failed to complete upload' });
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload initialization error:', error);
    return { success: false, error: 'Failed to start upload' };
  }
};

/**
 * Delete a document from Firebase Storage
 */
export const deleteDocument = async (firebaseStoragePath: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage(), firebaseStoragePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

/**
 * Get download URL for a document
 */
export const getDocumentURL = async (firebaseStoragePath: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage(), firebaseStoragePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    return null;
  }
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}` 
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'File type not allowed. Please use PDF, Word, image, or text files.' 
    };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Map form document type to Firebase document type
 */
export const mapDocumentType = (formType: string): DocumentType => {
  const typeMap: Record<string, DocumentType> = {
    'Military Records (DD-214)': 'dd214',
    'Service Medical Records': 'medical_record',
    'Private Medical Records': 'medical_record',
    'Medical Test Results': 'medical_record',
    'Doctor\'s Statement': 'lay_statement',
    'VA Exam Results (C&P)': 'medical_record',
    'Buddy Statements': 'buddy_statement',
    'Employment Records': 'other',
    'Social Security Records': 'other',
    'Photographs (injuries/scars)': 'other',
    'Marriage Certificate': 'marriage_certificate',
    'Divorce Decree': 'other',
    'Birth Certificate': 'birth_certificate',
    'Death Certificate': 'other',
    'Other Supporting Evidence': 'other'
  };
  return typeMap[formType] || 'other';
};

/**
 * Batch upload multiple documents
 */
export const uploadMultipleDocuments = async (
  files: File[],
  userId: string,
  documentTypes: DocumentType[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<DocumentUploadResult[]> => {
  const results: DocumentUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const documentType = documentTypes[i] || 'other';

    const result = await uploadDocument(
      file,
      userId,
      documentType,
      (progress) => onProgress?.(i, progress)
    );

    results.push(result);
  }

  return results;
};