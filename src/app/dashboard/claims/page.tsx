'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClaimCard } from '@/components/dashboard/ClaimCard';

// Mock data - replace with real data later
const mockClaims = [
  {
    id: '1',
    veteranId: 'user1',
    uhid: 'VET-123',
    claimType: 'disability' as const,
    status: 'draft' as const,
    priority: 'standard' as const,
    completionPercentage: 65,
    riskScore: 75,
    riskCategory: 'medium' as const,
    conditionsClaimed: [
      { id: '1', conditionName: 'PTSD', serviceConnection: true },
      { id: '2', conditionName: 'Hearing Loss', serviceConnection: true },
    ],
    supportingDocuments: [],
    treatmentHistory: [],
    aiSuggestions: [
      { id: '1', type: 'missing_docs' as const, suggestion: 'Add buddy statement', priority: 'high' as const, completed: false }
    ],
    qualityChecks: { missingDocuments: [], weakConnections: [], strengthScore: 75, completeness: 65 },
    createdAt: { toDate: () => new Date() },
    lastModified: { toDate: () => new Date() },
    vaSubmitted: false,
  },
  {
    id: '2',
    veteranId: 'user1',
    uhid: 'VET-123',
    claimType: 'education' as const,
    status: 'submitted' as const,
    priority: 'standard' as const,
    completionPercentage: 100,
    riskScore: 85,
    riskCategory: 'high' as const,
    conditionsClaimed: [],
    supportingDocuments: [],
    treatmentHistory: [],
    aiSuggestions: [],
    qualityChecks: { missingDocuments: [], weakConnections: [], strengthScore: 85, completeness: 100 },
    createdAt: { toDate: () => new Date(Date.now() - 86400000) },
    lastModified: { toDate: () => new Date(Date.now() - 86400000) },
    vaSubmitted: true,
  }
];

export default function ClaimsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();

  const filteredClaims = mockClaims.filter(claim => {
    const matchesSearch = claim.claimType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Claims</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your VA benefit claims
          </p>
        </div>
        <Button onClick={() => router.push('/intake/step-1')}>
          <Plus className="w-4 h-4 mr-2" />
          New Claim
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="ready">Ready</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Grid */}
      {filteredClaims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim as any} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Claims Found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first VA benefits claim.'
                }
              </p>
              <Button onClick={() => router.push('/intake/step-1')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {filteredClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Claims Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {mockClaims.filter(c => c.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">Draft</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockClaims.filter(c => ['submitted', 'processing'].includes(c.status)).length}
                </div>
                <div className="text-sm text-gray-600">In Process</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockClaims.filter(c => c.status === 'submitted').length}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round(mockClaims.reduce((acc, claim) => acc + claim.completionPercentage, 0) / mockClaims.length)}%
                </div>
                <div className="text-sm text-gray-600">Avg. Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}