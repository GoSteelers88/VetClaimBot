'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Trash2, AlertCircle, CheckCircle, Eye, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useIntakeStore } from '@/stores/intakeStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  uploadDocument, 
  deleteDocument, 
  validateFile, 
  formatFileSize, 
  mapDocumentType,
  UploadProgress 
} from '@/lib/firebase-storage';

interface Step6DocumentsProps {
  onNext: () => void;
  onValidationChange: (isValid: boolean) => void;
}

const DOCUMENT_TYPES = [
  'Military Records (DD-214)',
  'Service Medical Records',
  'Private Medical Records',
  'Medical Test Results',
  'Doctor\'s Statement',
  'VA Exam Results (C&P)',
  'Buddy Statements',
  'Employment Records',
  'Social Security Records',
  'Photographs (injuries/scars)',
  'Marriage Certificate',
  'Divorce Decree',
  'Birth Certificate',
  'Death Certificate',
  'Other Supporting Evidence'
];

const REQUIRED_DOCUMENTS = [
  'Military Records (DD-214)',
  'Service Medical Records'
];

export function Step6Documents({ onNext, onValidationChange }: Step6DocumentsProps) {
  const { formData, addDocument, updateDocument, removeDocument } = useIntakeStore();
  const { user } = useAuthStore();
  const [isValid, setIsValid] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // Always valid - documents are optional but helpful
    setIsValid(true);
    onValidationChange(true);
  }, [formData.documents, onValidationChange]);

  const handleFileUpload = useCallback(async (files: FileList, documentType: string = '') => {
    if (!user?.uid) {
      alert('You must be logged in to upload documents');
      return;
    }

    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        continue;
      }

      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUploadingFiles(prev => new Set([...prev, documentId]));
      setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));

      try {
        // Upload to Firebase Storage
        const firebaseDocumentType = mapDocumentType(documentType || 'Other Supporting Evidence');
        
        const result = await uploadDocument(
          file,
          user.uid,
          firebaseDocumentType,
          (progress: UploadProgress) => {
            setUploadProgress(prev => ({ ...prev, [documentId]: progress.percentage }));
          }
        );

        if (result.success && result.document) {
          // Add to form state
          const document = {
            id: documentId,
            name: file.name,
            fileName: file.name,
            type: documentType || 'Other Supporting Evidence',
            documentType: firebaseDocumentType,
            size: file.size,
            fileType: file.type,
            description: '',
            uploadProgress: 100,
            uploaded: true,
            status: 'uploaded',
            firebaseStoragePath: result.document.firebaseStoragePath,
            verified: result.document.verified,
            uploadDate: result.document.uploadDate,
            relatedConditions: [] // Can be linked later
          };
          
          addDocument(document);
        } else {
          alert(`Upload failed: ${result.error}`);
        }
        
      } catch (error) {
        alert('Upload failed. Please try again.');
        console.error('Upload error:', error);
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(documentId);
          return newSet;
        });
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[documentId];
          return newProgress;
        });
      }
    }
  }, [addDocument, user?.uid]);

  const handleRemoveDocument = async (index: number) => {
    const document = formData.documents[index];
    
    // Delete from Firebase Storage if it has a storage path
    if (document.firebaseStoragePath) {
      try {
        const deleted = await deleteDocument(document.firebaseStoragePath);
        if (!deleted) {
          console.warn('Failed to delete file from storage:', document.firebaseStoragePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    removeDocument(index);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Supporting Documents</h2>
        <p className="text-gray-600 mt-2">
          Upload documents that support your claim. These help provide evidence for your conditions.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent 
          className="py-12"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop files here, or click to select files
            </p>
            
            <div className="space-y-4">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploadingFiles.size > 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                {DOCUMENT_TYPES.slice(0, 6).map((docType) => (
                  <div key={docType}>
                    <input
                      type="file"
                      id={`upload-${docType}`}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files, docType)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById(`upload-${docType}`)?.click()}
                      className="w-full text-xs p-2 h-auto"
                      disabled={uploadingFiles.size > 0}
                    >
                      {docType.length > 20 ? docType.substring(0, 17) + '...' : docType}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: PDF, Word, Images, Text files (max 20MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {formData.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({formData.documents.length})</CardTitle>
            <CardDescription>
              Documents that have been uploaded to support your claim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.documents.map((doc, index) => (
                <div key={doc.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {doc.name || doc.fileName}
                          </span>
                          {doc.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(doc.size || 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {doc.type}
                        </span>
                        <div className="flex items-center space-x-2">
                          {doc.uploaded ? (
                            <div className="flex items-center space-x-1">
                              <Cloud className="h-4 w-4 text-green-500" />
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          ) : doc.status === 'uploading' ? (
                            <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-xs text-gray-600">
                            {doc.uploaded ? 'Stored in Firebase' : doc.status === 'uploading' ? 'Uploading...' : 'Failed'}
                          </span>
                        </div>
                      </div>

                      {doc.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={uploadProgress[doc.id] || doc.uploadProgress || 0} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {uploadProgress[doc.id] || doc.uploadProgress || 0}% complete
                          </p>
                        </div>
                      )}
                      
                      {/* Link to Conditions */}
                      {doc.uploaded && formData.conditions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Label className="text-xs text-gray-600">Related to conditions:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.conditions.map((condition, conditionIndex) => (
                              <div key={conditionIndex} className="flex items-center space-x-1">
                                <input
                                  type="checkbox"
                                  id={`doc-${index}-condition-${conditionIndex}`}
                                  checked={(doc.relatedConditions || []).includes(condition.id || `condition_${conditionIndex}`)}
                                  onChange={(e) => {
                                    const conditionId = condition.id || `condition_${conditionIndex}`;
                                    const currentConditions = doc.relatedConditions || [];
                                    const updatedConditions = e.target.checked
                                      ? [...currentConditions, conditionId]
                                      : currentConditions.filter(id => id !== conditionId);
                                    updateDocument(index, { ...doc, relatedConditions: updatedConditions });
                                  }}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <Label htmlFor={`doc-${index}-condition-${conditionIndex}`} className="text-xs">
                                  {condition.name || condition.customName || `Condition ${conditionIndex + 1}`}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div className="mt-3">
                        <Label htmlFor={`description-${index}`} className="text-xs text-gray-600">
                          Description (optional)
                        </Label>
                        <Input
                          id={`description-${index}`}
                          value={doc.description || ''}
                          onChange={(e) => updateDocument(index, { ...doc, description: e.target.value })}
                          placeholder="Describe what this document shows..."
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      className="text-red-600 hover:text-red-700 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Requirements Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">Document Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Recommended Documents:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• DD-214 or other military discharge documents</li>
                <li>• Medical records from military service</li>
                <li>• Private medical records related to your conditions</li>
                <li>• Statements from fellow service members (buddy statements)</li>
              </ul>
            </div>
            
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Tips for Better Claims:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• More documentation generally leads to stronger claims</li>
                <li>• Link documents to specific medical conditions when possible</li>
                <li>• Include recent medical records showing ongoing treatment</li>
                <li>• VA may request additional documents during review</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Documents Option */}
      {formData.documents.length === 0 && (
        <Card className="bg-gray-50">
          <CardContent className="py-6">
            <div className="text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">No Documents Yet?</h3>
              <p className="text-sm text-gray-600 mb-4">
                That's okay! You can submit your claim without documents and add them later.
                However, supporting documents significantly strengthen your claim.
              </p>
              <Button 
                variant="outline" 
                onClick={() => onNext()}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Continue Without Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}