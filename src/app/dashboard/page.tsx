'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Award, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ClaimCard } from '@/components/dashboard/ClaimCard';
import { ExposureAlerts } from '@/components/dashboard/ExposureAlerts';
import { useAuthStore } from '@/stores/authStore';

// Mock data for development - replace with real data later
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
  }
];

// Remove mock exposure alerts - use real data from veteran profile

export default function DashboardPage() {
  const router = useRouter();
  const { user, veteran } = useAuthStore();

  // Redirect to intake if profile is not complete
  useEffect(() => {
    if (user && veteran && !veteran.profileComplete) {
      router.push('/intake/1');
    }
  }, [user, veteran, router]);

  const handleStartClaim = () => {
    router.push('/intake/1');
  };

  const handleExposureAlert = (alert: any) => {
    console.log('Exposure alert clicked:', alert);
    // Handle exposure alert click
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
          value={mockClaims.length}
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
          value="87%"
          description="Average claim quality"
          icon={TrendingUp}
          trend={{ value: 5, label: "improvement", isPositive: true }}
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
              {mockClaims.length > 0 ? (
                <div className="space-y-4">
                  {mockClaims.map((claim) => (
                    <ClaimCard key={claim.id} claim={claim as any} />
                  ))}
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
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900">Claim draft saved</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900">Profile updated</p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900">New exposure alert</p>
                    <p className="text-gray-500 text-xs">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}