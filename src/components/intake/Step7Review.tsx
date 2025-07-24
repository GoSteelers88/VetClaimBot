'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, User, Shield, MapPin, Stethoscope, UserCheck, FileText, Send, Edit, Cloud, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntakeStore } from '@/stores/intakeStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  transformIntakeDataForFirebase, 
  createVeteranProfileForFirebase, 
  createClaimForFirebase 
} from '@/lib/firebase-transforms';

interface Step7ReviewProps {
  onNext: () => void;
  onValidationChange: (isValid: boolean) => void;
}

export function Step7Review({ onNext, onValidationChange }: Step7ReviewProps) {
  const { formData, calculateCompletion } = useIntakeStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    onValidationChange(agreedToTerms);
  }, [agreedToTerms, onValidationChange]);

  const completionPercentage = calculateCompletion();

  const handleEditSection = (step: number) => {
    router.push(`/intake/${step}`);
  };

  const handleSubmit = async () => {
    if (!agreedToTerms || !user?.uid) {
      if (!user?.uid) {
        alert('You must be logged in to submit your claim.');
      }
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionProgress(0);
    setSubmissionStatus('Preparing your claim data...');
    
    try {
      // Step 1: Transform data for Firebase
      setSubmissionProgress(20);
      setSubmissionStatus('Transforming form data...');
      const transformedData = transformIntakeDataForFirebase(formData);
      
      // Step 2: Create veteran profile
      setSubmissionProgress(40);
      setSubmissionStatus('Creating veteran profile...');
      const veteranProfile = createVeteranProfileForFirebase(user.uid, transformedData);
      
      // Step 3: Prepare submission data
      setSubmissionProgress(60);
      setSubmissionStatus('Preparing submission...');
      const submissionData = {
        userId: user.uid,
        ...transformedData,
        veteranProfile,
        submittedAt: new Date().toISOString(),
        submissionSource: 'intake_wizard_v2'
      };
      
      // Step 4: Submit to API
      setSubmissionProgress(80);
      setSubmissionStatus('Submitting to VA benefits system...');
      
      console.log('📋 Submitting claim data:', {
        userId: user.uid,
        hasPersonalInfo: !!transformedData.personalInfo,
        hasMilitaryService: !!transformedData.militaryService,
        conditionCount: transformedData.conditions.length,
        providerCount: transformedData.providers.length,
        documentCount: transformedData.documents.length,
        skipConditions: transformedData.skipConditions
      });
      
      const response = await fetch('/api/intake/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Submission successful:', result);
      
      // Step 5: Complete
      setSubmissionProgress(100);
      setSubmissionStatus('Submission complete!');
      
      // Wait a moment to show completion, then navigate to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Submission failed:', error);
      setSubmissionStatus('Submission failed. Please try again.');
      
      let errorMessage = 'Submission failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Submission failed: ${error.message}`;
      }
      
      alert(errorMessage);
      setIsSubmitting(false);
      setSubmissionProgress(0);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Not provided';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getSectionStatus = (sectionData: any, required = false) => {
    if (!sectionData) return { status: 'incomplete', color: 'red' };
    
    if (Array.isArray(sectionData)) {
      if (sectionData.length === 0) {
        return required ? 
          { status: 'incomplete', color: 'red' } : 
          { status: 'optional', color: 'gray' };
      }
      return { status: 'complete', color: 'green' };
    }
    
    if (typeof sectionData === 'object') {
      const hasData = Object.values(sectionData).some(value => 
        value !== '' && value !== null && value !== undefined
      );
      return hasData ? 
        { status: 'complete', color: 'green' } : 
        { status: 'incomplete', color: 'red' };
    }
    
    return { status: 'complete', color: 'green' };
  };

  const personalStatus = getSectionStatus(formData.personalInfo, true);
  const serviceStatus = getSectionStatus(formData.serviceHistory, true);
  const deploymentStatus = getSectionStatus(formData.deployments);
  const conditionStatus = getSectionStatus(formData.conditions, true);
  const providerStatus = getSectionStatus(formData.providers);
  const documentStatus = getSectionStatus(formData.documents);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="text-gray-600 mt-2">
          Review your claim information and submit to begin the VA benefits process.
        </p>
      </div>

      {/* Completion Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Claim Completion Status</CardTitle>
          <CardDescription className="text-blue-700">
            Your claim is {completionPercentage}% complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-blue-700 mt-2">
            {completionPercentage >= 80 ? 
              'Excellent! Your claim has strong supporting information.' :
              'Consider adding more information to strengthen your claim.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Section Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Sections</CardTitle>
          <CardDescription>Overview of all sections in your claim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Personal Information', status: personalStatus, icon: User, step: 1 },
              { name: 'Service History', status: serviceStatus, icon: Shield, step: 2 },
              { name: 'Deployments & Assignments', status: deploymentStatus, icon: MapPin, step: 3 },
              { name: 'Medical Conditions', status: conditionStatus, icon: Stethoscope, step: 4 },
              { name: 'Healthcare Providers', status: providerStatus, icon: UserCheck, step: 5 },
              { name: 'Supporting Documents', status: documentStatus, icon: FileText, step: 6 }
            ].map((section) => {
              const IconComponent = section.icon;
              return (
                <div key={section.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{section.name}</span>
                    <span className={`text-sm px-2 py-1 rounded-full text-white ${
                      section.status.color === 'green' ? 'bg-green-500' :
                      section.status.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                    }`}>
                      {section.status.status === 'complete' ? 'Complete' :
                       section.status.status === 'optional' ? 'Optional' : 'Incomplete'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSection(section.step)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p>{formData.personalInfo?.firstName} {formData.personalInfo?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p>{formData.personalInfo?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                  <p>{formatDate(formData.personalInfo?.dateOfBirth || '')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p>{formData.personalInfo?.phoneNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p>
                  {formData.personalInfo?.address?.street}, {formData.personalInfo?.address?.city}, {' '}
                  {formData.personalInfo?.address?.state} {formData.personalInfo?.address?.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Branch(es)</p>
                  <p>{formData.serviceHistory?.branches?.join(', ') || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Service Dates</p>
                  <p>
                    {formatDate(formData.serviceHistory?.entryDate || '')} - {' '}
                    {formatDate(formData.serviceHistory?.dischargeDate || '')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Final Rank</p>
                  <p>{formData.serviceHistory?.finalRank || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Discharge Type</p>
                  <p className="capitalize">{formData.serviceHistory?.dischargeType}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployments & Assignments ({formData.deployments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.deployments?.length === 0 ? (
                <p className="text-gray-500">No deployments recorded</p>
              ) : (
                <div className="space-y-4">
                  {formData.deployments?.map((deployment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p>{deployment.location}, {deployment.country}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Dates</p>
                          <p>{formatDate(deployment.startDate)} - {formatDate(deployment.endDate)}</p>
                        </div>
                      </div>
                      {(deployment.combatZone || deployment.hazardousExposure) && (
                        <div className="mt-2 flex space-x-4">
                          {deployment.combatZone && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Combat Zone</span>
                          )}
                          {deployment.hazardousExposure && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Hazardous Exposure</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions ({formData.conditions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.conditions?.length === 0 ? (
                <p className="text-gray-500">No conditions recorded</p>
              ) : (
                <div className="space-y-4">
                  {formData.conditions?.map((condition, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{condition.name === 'Other' ? condition.customName : condition.name}</h4>
                          <p className="text-sm text-gray-600">{condition.bodySystem}</p>
                          <p className="text-sm text-gray-600">First noticed: {formatDate(condition.dateFirstNoticed)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          condition.currentSeverity === 'mild' ? 'bg-green-100 text-green-800' :
                          condition.currentSeverity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {condition.currentSeverity}
                        </span>
                      </div>
                      {condition.serviceConnection && (
                        <p className="text-sm text-gray-700 mt-2">{condition.serviceConnection}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Providers ({formData.providers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.providers?.length === 0 ? (
                <p className="text-gray-500">No providers recorded</p>
              ) : (
                <div className="space-y-4">
                  {formData.providers?.map((provider, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{provider.name}</h4>
                          <p className="text-sm text-gray-600">{provider.specialty}</p>
                          <p className="text-sm text-gray-600">{provider.providerType}</p>
                        </div>
                        {provider.isVA && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">VA Provider</span>
                        )}
                      </div>
                      {provider.relevantConditions && provider.relevantConditions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Treats: {provider.relevantConditions.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents ({formData.documents?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.documents?.length === 0 ? (
                <p className="text-gray-500">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {formData.documents?.map((document, index) => (
                    <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{document.name}</p>
                          <p className="text-sm text-gray-600">{document.type}</p>
                        </div>
                      </div>
                      {document.isRequired && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Required</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Terms and Conditions */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-900">Before You Submit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms-agreement" className="text-sm text-yellow-800">
                I certify that the information provided is true and complete to the best of my knowledge, and I authorize submission to Firebase and the VA benefits system
              </label>
            </div>
          </div>
          
          <div className="bg-yellow-100 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">What Happens Next?</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Your claim data will be securely stored in Firebase</li>
              <li>• The system will automatically submit to the VA for processing</li>
              <li>• You'll receive a confirmation email with your claim number</li>
              <li>• VA typically schedules a Compensation & Pension (C&P) exam</li>
              <li>• Processing time varies but typically takes 3-6 months</li>
              <li>• You can track progress in your VetClaimBot dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Submission Progress */}
      {isSubmitting && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Submitting to Firebase & VA System</span>
                <span className="text-sm text-blue-700">{submissionProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${submissionProgress}%` }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">{submissionStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={handleSubmit}
          disabled={!agreedToTerms || isSubmitting}
          className="px-8"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 animate-pulse" />
              <span>Processing with Firebase...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <Cloud className="w-4 h-4" />
              <span>Submit to Firebase & VA</span>
            </div>
          )}
        </Button>
      </div>

      {!agreedToTerms && (
        <p className="text-center text-sm text-red-600">
          Please review and accept the certification above to submit your claim
        </p>
      )}
    </div>
  );
}