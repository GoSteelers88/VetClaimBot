import Link from 'next/link';
import { Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Claim } from '@/types';
import { formatRelativeTime, getRiskColor, getRiskCategory, getStatusColor, getStatusLabel } from '@/lib/utils';

interface ClaimCardProps {
  claim: Claim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const riskCategory = getRiskCategory(claim.riskScore);
  const completionPercentage = claim.completionPercentage || 0;
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)} Claim
            </CardTitle>
            <p className="text-sm text-gray-600 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatRelativeTime(claim.createdAt.toDate())}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
              {getStatusIcon(claim.status)}
              <span className="ml-1">{getStatusLabel(claim.status)}</span>
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(riskCategory)}`}>
              {riskCategory.toUpperCase()} RISK
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(completionPercentage)}`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Claim Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Conditions:</span>
              <p className="font-medium">{claim.conditionsClaimed?.length || 0}</p>
            </div>
            <div>
              <span className="text-gray-600">Documents:</span>
              <p className="font-medium">{claim.supportingDocuments?.length || 0}</p>
            </div>
          </div>

          {/* AI Suggestions Alert */}
          {claim.aiSuggestions && claim.aiSuggestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  {claim.aiSuggestions.length} AI suggestions available
                </span>
              </div>
            </div>
          )}

          {/* Risk Score */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Risk Score:</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                <div 
                  className={`h-1.5 rounded-full ${
                    riskCategory === 'high' ? 'bg-red-500' : 
                    riskCategory === 'medium' ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${claim.riskScore}%` }}
                />
              </div>
              <span className="text-sm font-medium">{claim.riskScore}/100</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="px-6 pb-6">
        <Link href={`/dashboard/claims/${claim.id}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}