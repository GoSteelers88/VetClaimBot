import { Shield } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 py-16">
            <div className="flex items-center mb-8">
              <Shield className="h-12 w-12 text-white" />
              <span className="ml-3 text-3xl font-bold text-white">VetClaimBot</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">
              Your Service Matters
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of veterans who have successfully navigated their VA benefits 
              with our AI-powered assistance.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>AI-guided claim preparation</span>
              </div>
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Automatic exposure alerts</span>
              </div>
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Secure document management</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}