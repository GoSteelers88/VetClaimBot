'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle, FileText, Image, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { DocumentType } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface DocumentUploadProps {
  onFileUploaded?: (file: UploadedFile) => void;
  onFileRemoved?: (fileId: string) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  existingFiles?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: DocumentType;
  uploadProgress: number;
  uploaded: boolean;
  url?: string;
  error?: string;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'dd214', label: 'DD-214', description: 'Certificate of Release or Discharge from Active Duty' },
  { value: 'medical_record', label: 'Medical Records', description: 'Hospital, clinic, or doctor visit records' },
  { value: 'buddy_statement', label: 'Buddy Statement', description: 'Statement from fellow service member' },
  { value: 'lay_statement', label: 'Personal Statement', description: 'Your own written statement' },
  { value: 'marriage_certificate', label: 'Marriage Certificate', description: 'For dependent benefits' },
  { value: 'birth_certificate', label: 'Birth Certificate', description: 'For dependent benefits' },
  { value: 'other', label: 'Other', description: 'Other supporting documents' }
];

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export function DocumentUpload({
  onFileUploaded,
  onFileRemoved,
  allowedTypes = ALLOWED_FILE_TYPES,
  maxFileSize = 10, // 10MB default
  maxFiles = 10,
  existingFiles = []
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (selectedFiles: File[]) => {
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} not allowed`);
        return false;
      }

      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File size must be less than ${maxFileSize}MB`);
        return false;
      }

      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: 'other' as DocumentType,
      uploadProgress: 0,
      uploaded: false
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Start upload for each file
    newFiles.forEach(fileObj => {
      uploadFile(fileObj);
    });
  };

  const uploadFile = async (fileObj: UploadedFile) => {
    try {
      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, uploadProgress: progress } : f
        ));
      };

      // Simulate progressive upload
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(progress);
      }

      // TODO: Replace with actual Firebase Storage upload
      const mockUrl = URL.createObjectURL(fileObj.file);
      
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id 
          ? { ...f, uploaded: true, url: mockUrl }
          : f
      ));

      onFileUploaded?.(fileObj);
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id 
          ? { ...f, error: 'Upload failed', uploadProgress: 0 }
          : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemoved?.(fileId);
  };

  const updateFileType = (fileId: string, type: DocumentType) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, type } : f
    ));
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.file.type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (file.file.type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Upload supporting documents for your claim. Accepted formats: PDF, JPG, PNG, DOC, TXT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Maximum {maxFiles} files, up to {maxFileSize}MB each
              </p>
            </div>

            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((fileObj) => (
                <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(fileObj)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileObj.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {fileObj.uploaded ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : fileObj.error ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileObj.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!fileObj.uploaded && !fileObj.error && (
                    <div className="mb-3">
                      <Progress value={fileObj.uploadProgress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Uploading... {fileObj.uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {fileObj.error && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      {fileObj.error}
                    </div>
                  )}

                  {/* Document Type Selection */}
                  <div>
                    <Label htmlFor={`docType-${fileObj.id}`} className="text-sm">
                      Document Type
                    </Label>
                    <select
                      id={`docType-${fileObj.id}`}
                      value={fileObj.type}
                      onChange={(e) => updateFileType(fileObj.id, e.target.value as DocumentType)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {DOCUMENT_TYPES.map((docType) => (
                        <option key={docType.value} value={docType.value}>
                          {docType.label} - {docType.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Download Link */}
                  {fileObj.uploaded && fileObj.url && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(fileObj.url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Requirements */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Document Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Essential Documents:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• DD-214 (Certificate of Discharge)</li>
                <li>• Medical records (VA and private)</li>
                <li>• Current treatment records</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Helpful Documents:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Buddy statements</li>
                <li>• Personnel records</li>
                <li>• Employment records</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}