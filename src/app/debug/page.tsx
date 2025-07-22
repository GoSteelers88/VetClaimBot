'use client';

import { AuthDebug } from '@/components/auth/AuthDebug';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Firebase Debug Tools</h1>
        <AuthDebug />
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Use this page to test Firebase connectivity and diagnose authentication issues.</p>
          <p className="mt-2">Check the browser console for detailed error information.</p>
        </div>
      </div>
    </div>
  );
}