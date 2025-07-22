'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
  const { user, veteran, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (requireProfile && (!veteran || !veteran.personalInfo?.firstName)) {
      router.push('/onboarding');
      return;
    }
  }, [user, veteran, isLoading, isInitialized, requireProfile, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="mt-2 text-gray-600">Securing your session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (requireProfile && (!veteran || !veteran.personalInfo?.firstName)) {
    return null; // Will redirect to onboarding
  }

  return <>{children}</>;
}