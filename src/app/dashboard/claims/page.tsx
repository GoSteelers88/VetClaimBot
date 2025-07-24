'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClaimCard } from '@/components/dashboard/ClaimCard';
import { useAuthStore } from '@/stores/authStore';
import { getVeteranClaims } from '@/lib/firestore';
import { Claim } from '@/types';

export default function ClaimsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  // Load user's claims
  useEffect(() => {
    const loadClaims = async () => {
      // Wait for auth to be initialized
      if (!isInitialized) {
        return;
      }
      
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('🔍 Loading claims for user:', user.uid);
        const userClaims = await getVeteranClaims(user.uid);
        console.log('✅ Claims loaded:', userClaims.length);
        setClaims(userClaims); // Empty array is perfectly normal for new users
      } catch (error) {
        console.error('❌ Error loading claims:', error);
        // Only show error for actual database/permission issues
        setError('Unable to connect to database. Please try again.');
        setClaims([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadClaims();
  }, [user?.uid, isInitialized]);

  const filteredClaims = claims.filter(claim => {
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
        <Button onClick={() => router.push('/intake/1')}>
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
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your claims...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Claims
              </h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredClaims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
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
              <Button onClick={() => router.push('/intake/1')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {!isLoading && !error && claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Claims Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {claims.filter(c => c.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">Draft</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {claims.filter(c => ['submitted', 'processing'].includes(c.status)).length}
                </div>
                <div className="text-sm text-gray-600">In Process</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {claims.filter(c => c.status === 'submitted').length}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {claims.length > 0 ? Math.round(claims.reduce((acc, claim) => acc + (claim.completionPercentage || 0), 0) / claims.length) : 0}%
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