'use client';

import { useState, useEffect } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Share, 
  MoreVertical, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUpload } from '@/components/upload/DocumentUpload';
import { useAuthStore } from '@/stores/authStore';
import { getVeteranClaim } from '@/lib/firestore';
import { Claim } from '@/types';
import { formatDate, formatRelativeTime, getStatusColor, getRiskColor, getRiskCategory } from '@/lib/utils';

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params?.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchClaim = async () => {
      if (!user?.uid || !claimId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const claimData = await getVeteranClaim(user.uid, claimId);
        setClaim(claimData);
      } catch (error) {
        console.error('Error loading claim:', error);
        setError('Failed to load claim details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaim();
  }, [claimId, user?.uid]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            {error ? 'Error Loading Claim' : 'Claim Not Found'}
          </h3>
          <p className="text-gray-600">
            {error || "The claim you're looking for doesn't exist."}
          </p>
          <Button 
            onClick={() => router.push('/dashboard/claims')} 
            className="mt-4"
            variant="outline"
          >
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Claims
          </Button>
          
          <div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(claim.status)}
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {claim.claimType} Claim
              </h1>
            </div>
            <p className="text-gray-600">
              Claim ID: {claim.id} • Created {formatRelativeTime(claim.createdAt instanceof Date ? claim.createdAt : new Date())}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(claim.status)}`}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </div>
              </div>
              {getStatusIcon(claim.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-xl font-bold text-gray-900">{claim.completionPercentage}%</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <Progress value={claim.completionPercentage} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="text-xl font-bold text-gray-900">{claim.riskScore}/100</p>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(getRiskCategory(claim.riskScore))}`}>
                {getRiskCategory(claim.riskScore).toUpperCase()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(claim.lastModified instanceof Date ? claim.lastModified : new Date())}
                </p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Claim Summary */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Claim Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">UHID:</span>
                      <p className="font-medium">{claim.uhid}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority:</span>
                      <p className="font-medium capitalize">{claim.priority}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Conditions:</span>
                      <p className="font-medium">{claim.conditionsClaimed.length} claimed</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Documents:</span>
                      <p className="font-medium">{claim.supportingDocuments.length} uploaded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Assessment</CardTitle>
                  <CardDescription>
                    AI-powered analysis of your claim strength
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Strength</span>
                        <span className="text-sm text-gray-600">{claim.qualityChecks.strengthScore}/100</span>
                      </div>
                      <Progress value={claim.qualityChecks.strengthScore} className="h-2" />
                    </div>

                    {claim.qualityChecks.missingDocuments.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Missing Documents</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {claim.qualityChecks.missingDocuments.map((doc, index) => (
                            <li key={index}>• {doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Add Buddy Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule C&P Exam
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-900">Medical records uploaded</p>
                        <p className="text-gray-500 text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-900">AI analysis completed</p>
                        <p className="text-gray-500 text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-900">Claim draft saved</p>
                        <p className="text-gray-500 text-xs">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          {claim.conditionsClaimed.map((condition) => (
            <Card key={condition.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{condition.conditionName}</CardTitle>
                    <CardDescription>
                      ICD-10: {condition.icd10Code} • Onset: {formatDate(condition.onsetDate)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {condition.serviceConnection && (
                      <Badge variant="secondary">Service Connected</Badge>
                    )}
                    {condition.workImpact && (
                      <Badge variant="outline">Work Impact</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Severity</h4>
                    <p className="text-gray-700">{condition.currentSeverity}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{condition.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentUpload 
            existingFiles={claim.supportingDocuments || []}
            onFileUploaded={(file) => {
              // Handle file upload - update claim with new document
            }}
            onFileRemoved={(fileId) => {
              // Handle file removal - remove document from claim
            }}
          />
        </TabsContent>

        <TabsContent value="ai-suggestions" className="space-y-4">
          {claim.aiSuggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    suggestion.priority === 'high' ? 'bg-red-100' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100' : 
                    'bg-green-100'
                  }`}>
                    <AlertCircle className={`w-4 h-4 ${
                      suggestion.priority === 'high' ? 'text-red-600' :
                      suggestion.priority === 'medium' ? 'text-yellow-600' : 
                      'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={
                        suggestion.priority === 'high' ? 'destructive' :
                        suggestion.priority === 'medium' ? 'default' : 
                        'secondary'
                      }>
                        {suggestion.priority} priority
                      </Badge>
                      <span className="text-xs text-gray-500 capitalize">
                        {suggestion.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-3">{suggestion.suggestion}</p>
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claim Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Claim Created</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(claim.createdAt instanceof Date ? claim.createdAt : new Date())}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Documents Uploaded</p>
                    <p className="text-sm text-gray-600">DD-214 and medical records added</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Pending: Ready for Submission</p>
                    <p className="text-sm text-gray-500">Complete remaining items to submit</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}