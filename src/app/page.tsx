'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Shield, Bot, FileText, AlertTriangle } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">VetClaimBot</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Your VA Benefits,{' '}
            <span className="text-blue-600">Simplified</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered assistance to help veterans navigate VA benefits, file claims with confidence, 
            and get the support you&apos;ve earned through your service.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={() => router.push('/register')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Your Claim
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/login')}
            >
              Veteran Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">AI-Powered Guidance</h3>
            <p className="mt-2 text-gray-600">
              Get personalized assistance from our AI advisor trained on VA regulations and procedures.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Smart Form Builder</h3>
            <p className="mt-2 text-gray-600">
              Step-by-step guided forms that auto-populate based on your service history and conditions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Exposure Alerts</h3>
            <p className="mt-2 text-gray-600">
              Automatic notifications about potential benefits based on your deployment locations and dates.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of veterans who have successfully filed their claims with VetClaimBot.
          </p>
          <Button 
            size="lg" 
            className="mt-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/register')}
          >
            Create Your Account
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400">
              &copy; 2024 VetClaimBot. Built with respect for those who served.
            </p>
            <div className="flex space-x-6">
              <button 
                onClick={() => router.push('/terms')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => router.push('/privacy')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}