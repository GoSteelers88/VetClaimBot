'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Award, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ClaimCard } from '@/components/dashboard/ClaimCard';
import { ExposureAlerts } from '@/components/dashboard/ExposureAlerts';
import { useAuthStore } from '@/stores/authStore';
import { getVeteranClaims } from '@/lib/firestore';
import { Claim } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, veteran } = useAuthStore();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  // Redirect to intake if profile is not complete
  useEffect(() => {
    if (user && veteran && !veteran.profileComplete) {
      router.push('/intake/1');
    }
  }, [user, veteran, router]);

  // Load user's claims
  useEffect(() => {
    const loadClaims = async () => {
      if (!user?.uid) {
        setIsLoadingClaims(false);
        return;
      }

      try {
        setIsLoadingClaims(true);
        setClaimsError(null);
        const userClaims = await getVeteranClaims(user.uid);
        setClaims(userClaims);
      } catch (error) {
        console.error('Error loading claims:', error);
        setClaimsError('Failed to load claims');
        setClaims([]);
      } finally {
        setIsLoadingClaims(false);
      }
    };

    loadClaims();
  }, [user?.uid]);

  const handleStartClaim = () => {
    router.push('/intake/1');
  };

  const handleExposureAlert = (alert: any) => {
    // Handle exposure alert click - could navigate to claim creation with pre-filled data
  };

  const handleStartClaimFromAlert = (alert: any) => {
    router.push(`/intake/1?exposure=${alert.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Veteran'}
            </h1>
            <p className="text-blue-100 text-lg">
              Track your VA benefits and claims progress
            </p>
            <p className="text-blue-200 text-sm mt-1">
              UHID: {veteran?.uhid || 'Loading...'}
            </p>
          </div>
          <Button 
            onClick={handleStartClaim}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Claims"
          value={isLoadingClaims ? '...' : claims.filter(c => ['draft', 'in_review', 'ready'].includes(c.status)).length}
          description="Claims in progress"
          icon={FileText}
        />
        <StatsCard
          title="Disability Rating"
          value={`${veteran?.militaryService?.currentDisabilityRating || 0}%`}
          description="Current VA rating"
          icon={Award}
        />
        <StatsCard
          title="Exposure Alerts"
          value={veteran?.exposureAlerts?.length || 0}
          description="Potential benefits"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Completion Rate"
          value={isLoadingClaims ? '...' : claims.length > 0 ? `${Math.round(claims.reduce((acc, claim) => acc + (claim.completionPercentage || 0), 0) / claims.length)}%` : '0%'}
          description="Average claim quality"
          icon={TrendingUp}
          trend={claims.length > 1 ? { 
            value: Math.round((claims.filter(c => c.completionPercentage > 70).length / claims.length) * 10), 
            label: "high quality claims", 
            isPositive: true 
          } : undefined}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Claims Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Claims</span>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/claims')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingClaims ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your claims...</p>
                </div>
              ) : claimsError ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error Loading Claims
                  </h3>
                  <p className="text-gray-500 mb-6">{claimsError}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : claims.length > 0 ? (
                <div className="space-y-4">
                  {claims.slice(0, 3).map((claim) => (
                    <ClaimCard key={claim.id} claim={claim} />
                  ))}
                  {claims.length > 3 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/dashboard/claims')}
                      >
                        View {claims.length - 3} More Claims
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Claims Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start your first VA benefits claim with our AI-guided process.
                  </p>
                  <Button onClick={handleStartClaim}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your First Claim
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Exposure Alerts */}
          <ExposureAlerts 
            alerts={veteran?.exposureAlerts || []}
            onAlertClick={handleExposureAlert}
            onStartClaim={handleStartClaimFromAlert}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/chat')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Chat with AI Assistant
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/profile')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/claims')}
              >
                <Award className="w-4 h-4 mr-2" />
                View All Claims
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {claims.length > 0 ? (
                  <>
                    {claims.slice(0, 3).map((claim, index) => {
                      const timeSince = claim.lastModified?.toDate ? 
                        Math.floor((Date.now() - claim.lastModified.toDate().getTime()) / (1000 * 60 * 60)) : 0;
                      
                      return (
                        <div key={claim.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            claim.status === 'submitted' ? 'bg-green-500' :
                            claim.status === 'draft' ? 'bg-blue-500' :
                            claim.status === 'in_review' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="text-gray-900">
                              {claim.status === 'submitted' ? 'Claim submitted' :
                               claim.status === 'draft' ? 'Claim draft saved' :
                               claim.status === 'in_review' ? 'Claim under review' :
                               'Claim updated'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {timeSince < 1 ? 'Just now' :
                               timeSince < 24 ? `${timeSince} hours ago` :
                               `${Math.floor(timeSince / 24)} days ago`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {veteran?.profileComplete && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-900">Profile completed</p>
                          <p className="text-gray-500 text-xs">Recently</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Activity will appear here as you work on claims
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}