'use client';

import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">VetClaimBot</span>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: December 2024</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using VetClaimBot ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                VetClaimBot is an AI-powered platform designed to assist U.S. military veterans in navigating 
                VA benefits and filing disability claims. The Service provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Guided claim preparation assistance</li>
                <li>AI-powered guidance and recommendations</li>
                <li>Document management and organization</li>
                <li>Educational resources about VA benefits</li>
                <li>Progress tracking and status updates</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Important:</strong> VetClaimBot is not affiliated with the U.S. Department of Veterans Affairs (VA). 
                We are an independent service provider that helps veterans prepare their claims.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Eligibility</h2>
              <p className="text-gray-700 mb-4">
                This Service is intended exclusively for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>U.S. military veterans</li>
                <li>Active duty service members</li>
                <li>Authorized representatives acting on behalf of veterans</li>
                <li>Family members of deceased veterans</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You must be at least 18 years old to use this Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate and truthful information</li>
                <li>Keep your login credentials secure</li>
                <li>Not share your account with others</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the Service for any illegal or unauthorized purpose</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">5. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                We take your privacy seriously. Our collection, use, and protection of your personal information 
                is governed by our Privacy Policy, which is incorporated by reference into these Terms.
              </p>
              <p className="text-gray-700 mb-4">
                By using our Service, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive 
                property of VetClaimBot and its licensors. The Service is protected by copyright, trademark, and 
                other laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Legal Advice Disclaimer</h3>
                <p className="text-yellow-800 text-sm">
                  VetClaimBot does not provide legal advice. The information and assistance provided through our 
                  Service is for educational and informational purposes only and should not be construed as legal advice.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-900 mb-2">No Guarantee of Claim Approval</h3>
                <p className="text-red-800 text-sm">
                  We cannot guarantee that any claim prepared using our Service will be approved by the VA. 
                  Claim decisions are made solely by the Department of Veterans Affairs based on their own criteria and processes.
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                The Service is provided "as is" without warranty of any kind. We disclaim all warranties, 
                express or implied, including but not limited to implied warranties of merchantability, 
                fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall VetClaimBot, its directors, employees, partners, agents, suppliers, or affiliates 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use 
                of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior 
                notice or liability, under our sole discretion, for any reason whatsoever, including without limitation 
                if you breach the Terms.
              </p>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by contacting us or through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of the United States, without regard to 
                its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@vetclaimbot.com<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Contact Number]
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Thank you for using VetClaimBot. We're honored to serve those who served.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}