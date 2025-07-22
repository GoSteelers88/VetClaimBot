'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Trash2, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useIntakeStore } from '@/stores/intakeStore';

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

export function Step6Documents({ onNext, onValidationChange }: Step6DocumentsProps) {
  const { formData, addDocument, updateDocument, removeDocument } = useIntakeStore();
  const [isValid, setIsValid] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Always valid - documents are optional but helpful
    setIsValid(true);
    onValidationChange(true);
  }, [formData.documents, onValidationChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not allowed. Please use PDF, Word, image, or text files.';
    }
    return null;
  };

  const handleFileUpload = useCallback(async (files: FileList, documentType: string = '') => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        continue;
      }

      const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setUploadingFiles(prev => new Set([...prev, documentId]));

      try {
        // Simulate upload progress
        const document = {
          id: documentId,
          name: file.name,
          type: documentType || 'Other Supporting Evidence',
          size: file.size,
          uploadDate: new Date(),
          status: 'uploading' as const,
          description: '',
          relatedConditions: [],
          isRequired: REQUIRED_DOCUMENTS.includes(documentType),
          url: '', // Will be set after upload
          file: file // Temporary - for preview
        };

        addDocument(document);

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          updateDocument(
            formData.documents.length,
            { ...document, uploadProgress: progress }
          );
        }

        // Mark as completed
        updateDocument(
          formData.documents.length,
          { 
            ...document, 
            status: 'completed' as const,
            uploadProgress: 100,
            url: `documents/${documentId}/${file.name}` // Mock URL
          }
        );

      } catch (error) {
        updateDocument(
          formData.documents.length,
          { status: 'error' as const, uploadProgress: 0 }
        );
        alert('Upload failed. Please try again.');
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(documentId);
          return newSet;
        });
      }
    }
  }, [addDocument, updateDocument, formData.documents.length]);

  const handleDocumentChange = (index: number, field: string, value: any) => {
    updateDocument(index, { [field]: value });
  };

  const handleConditionToggle = (docIndex: number, conditionName: string) => {
    const document = formData.documents[docIndex];
    const relatedConditions = document.relatedConditions || [];
    const updatedConditions = relatedConditions.includes(conditionName)
      ? relatedConditions.filter(c => c !== conditionName)
      : [...relatedConditions, conditionName];
    
    handleDocumentChange(docIndex, 'relatedConditions', updatedConditions);
  };

  const handleRemoveDocument = (index: number) => {
    removeDocument(index);
  };

  const handleNext = () => {
    onNext();
  };

  const getRequiredDocumentsStatus = () => {
    const uploadedTypes = formData.documents.map(doc => doc.type);
    const missingRequired = REQUIRED_DOCUMENTS.filter(req => !uploadedTypes.includes(req));
    return { uploaded: REQUIRED_DOCUMENTS.length - missingRequired.length, total: REQUIRED_DOCUMENTS.length, missing: missingRequired };
  };

  const requiredStatus = getRequiredDocumentsStatus();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Supporting Documents</h2>
        <p className="text-gray-600 mt-2">
          Upload documents that support your claim. While not all documents are required now, they strengthen your case.
        </p>
      </div>

      {/* Required Documents Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Required Documents Status</CardTitle>
          <CardDescription className="text-blue-700">
            {requiredStatus.uploaded} of {requiredStatus.total} required documents uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {REQUIRED_DOCUMENTS.map((docType) => {
              const isUploaded = formData.documents.some(doc => doc.type === docType);
              return (
                <div key={docType} className="flex items-center space-x-3">
                  {isUploaded ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className={`text-sm ${isUploaded ? 'text-green-800' : 'text-yellow-800'}`}>
                    {docType}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Upload Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {DOCUMENT_TYPES.slice(0, 6).map((docType) => (
          <div key={docType}>
            <input
              type="file"
              id={`upload-${docType}`}
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, docType)}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`upload-${docType}`)?.click()}
              className="w-full h-auto p-3 text-xs"
            >
              <Upload className="w-4 h-4 mb-1" />
              {docType}
            </Button>
          </div>
        ))}
      </div>

      {/* General Upload Area */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="py-12">
          <div className="text-center">
            <input
              type="file"
              id="general-upload"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            <Button
              variant="ghost"
              onClick={() => document.getElementById('general-upload')?.click()}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Documents
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Drag and drop files or click to browse (PDF, Word, Images, Text)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max file size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {formData.documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Documents ({formData.documents.length})</h3>
          
          {formData.documents.map((document, index) => (
            <Card key={document.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <CardTitle className="text-base">{document.name}</CardTitle>
                      <CardDescription>
                        {document.type} • {formatFileSize(document.size)}
                        {document.isRequired && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Required
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Upload Progress */}
                {document.status === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{document.uploadProgress || 0}%</span>
                    </div>
                    <Progress value={document.uploadProgress || 0} />
                  </div>
                )}

                {/* Document Type */}
                <div>
                  <Label htmlFor={`docType-${index}`}>Document Type</Label>
                  <select
                    id={`docType-${index}`}
                    value={document.type}
                    onChange={(e) => handleDocumentChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <textarea
                    id={`description-${index}`}
                    rows={2}
                    value={document.description || ''}
                    onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                    placeholder="Describe what this document shows or proves"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Related Conditions */}
                {formData.conditions.length > 0 && (
                  <div>
                    <Label>Related Conditions</Label>
                    <p className="text-sm text-gray-600 mb-2">Select conditions this document supports:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.conditions.map((condition) => (
                        <div key={condition.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`doc-condition-${index}-${condition.id}`}
                            checked={(document.relatedConditions || []).includes(condition.name)}
                            onChange={() => handleConditionToggle(index, condition.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Label htmlFor={`doc-condition-${index}-${condition.id}`} className="text-sm">
                            {condition.name === 'Other' ? condition.customName : condition.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Information Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Document Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>DD-214:</strong> Your military discharge document (most important)</li>
            <li>• <strong>Service Medical Records:</strong> Any medical treatment during service</li>
            <li>• <strong>Private Medical Records:</strong> Civilian doctor visits and treatments</li>
            <li>• <strong>Buddy Statements:</strong> Witness statements from fellow service members</li>
            <li>• <strong>Photographs:</strong> Pictures of injuries, scars, or conditions</li>
            <li>• You can always add more documents later through your dashboard</li>
          </ul>
        </CardContent>
      </Card>

      {/* Warning for Missing Required Documents */}
      {requiredStatus.missing.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Missing Required Documents
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  You're missing: {requiredStatus.missing.join(', ')}. 
                  While you can continue, these documents are typically required for claim processing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}