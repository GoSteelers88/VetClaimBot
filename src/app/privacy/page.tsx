'use client';

import { Shield, ArrowLeft, Lock, Database, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: December 2024</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
              <p className="text-gray-700 mb-4">
                At VetClaimBot, we understand that your personal information, especially medical and military records, 
                is extremely sensitive. We are committed to protecting your privacy and handling your data with the 
                highest level of security and care.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Lock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">HIPAA Compliance</h3>
                    <p className="text-blue-800 text-sm">
                      We implement administrative, physical, and technical safeguards that comply with HIPAA 
                      requirements to protect your health information.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Name, address, phone number, email address</li>
                <li>Date of birth and Social Security Number (encrypted)</li>
                <li>Military service information (service dates, branch, discharge status)</li>
                <li>Deployment history and locations</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Health Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Medical conditions and symptoms</li>
                <li>Healthcare provider information</li>
                <li>Treatment history and medical records</li>
                <li>Disability ratings and assessments</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Technical Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>IP address and browser information</li>
                <li>Device information and operating system</li>
                <li>Usage patterns and interaction data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Database className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold text-green-900 mb-2">Claim Preparation</h3>
                  <p className="text-green-800 text-sm">
                    To help you prepare and organize your VA disability claim
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Eye className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-blue-900 mb-2">AI Assistance</h3>
                  <p className="text-blue-800 text-sm">
                    To provide personalized AI guidance and recommendations
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <Lock className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-purple-900 mb-2">Service Improvement</h3>
                  <p className="text-purple-800 text-sm">
                    To improve our services and user experience
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                We use your information specifically to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Generate and populate VA forms and documents</li>
                <li>Provide AI-powered guidance and recommendations</li>
                <li>Track your claim progress and send updates</li>
                <li>Identify potential benefits and exposures</li>
                <li>Communicate with you about your account and claims</li>
                <li>Improve our AI algorithms and service quality</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-900 mb-2">We Never Sell Your Data</h3>
                <p className="text-red-800 text-sm">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>

              <p className="text-gray-700 mb-4">We may share your information in the following limited circumstances:</p>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">With Your Consent</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>When you explicitly authorize us to share information</li>
                <li>For services you specifically request (e.g., submitting forms to the VA)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Service Providers</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Trusted third-party services that help us operate our platform</li>
                <li>Cloud storage and database providers (with encryption)</li>
                <li>AI and machine learning service providers</li>
                <li>All service providers are bound by strict confidentiality agreements</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Legal Requirements</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>When required by law or legal process</li>
                <li>To protect the rights and safety of our users</li>
                <li>To comply with government requests or court orders</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• All data encrypted in transit and at rest</li>
                    <li>• AES-256 encryption standard</li>
                    <li>• TLS 1.3 for data transmission</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Access Controls</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Multi-factor authentication</li>
                    <li>• Role-based access permissions</li>
                    <li>• Regular access reviews and audits</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Infrastructure</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• SOC 2 Type II certified providers</li>
                    <li>• Regular security assessments</li>
                    <li>• Firewall and intrusion detection</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Monitoring</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 24/7 security monitoring</li>
                    <li>• Automated threat detection</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">Data Access and Control</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Access:</strong> View all personal information we have about you</li>
                <li><strong>Correct:</strong> Update or correct inaccurate information</li>
                <li><strong>Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Restrict:</strong> Limit how we process your information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Communication Preferences</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Opt out of marketing communications</li>
                <li>Choose notification preferences</li>
                <li>Update contact information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as necessary to provide our services and fulfill the 
                purposes described in this policy. Specifically:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Active accounts:</strong> While your account remains active</li>
                <li><strong>Closed accounts:</strong> Up to 7 years for legal and tax purposes</li>
                <li><strong>Medical records:</strong> As required by applicable laws</li>
                <li><strong>Communications:</strong> 3 years for customer service purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Essential cookies:</strong> Required for basic site functionality</li>
                <li><strong>Analytics cookies:</strong> Help us understand how you use our site</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings, though this may limit some functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Users</h2>
              <p className="text-gray-700 mb-4">
                If you are accessing our services from outside the United States, please note that your 
                information will be transferred to and processed in the United States, where our servers 
                and central database are located.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this privacy policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-gray-700 mb-4">
                For significant changes, we will provide additional notice (such as email notification).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this privacy policy or our 
                data practices, please contact us:
              </p>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Privacy Officer</strong><br />
                  Email: privacy@vetclaimbot.com<br />
                  Address: [Your Business Address]<br />
                  Phone: [Your Contact Number]
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Your privacy is our priority. We're committed to protecting the personal information of those who served.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}