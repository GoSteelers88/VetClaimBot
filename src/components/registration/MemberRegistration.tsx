'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { User, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

const memberRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  suffix: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, 'Please enter a valid SSN (XXX-XX-XXXX)'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  phoneNumber: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Please enter a valid phone number'),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'Please select a state'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: z.string().default('USA')
  })
});

type MemberRegistrationData = z.infer<typeof memberRegistrationSchema>;

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

export function MemberRegistration() {
  const { user, updateProfile } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStatus, setSubmitStatus] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<MemberRegistrationData>({
    resolver: zodResolver(memberRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      address: {
        country: 'USA'
      }
    }
  });

  const onSubmit = async (data: MemberRegistrationData) => {
    if (!user?.uid) {
      alert('You must be logged in to register.');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);
    setSubmitStatus('Preparing your information...');

    try {
      // Step 1: Transform data
      setSubmitProgress(20);
      setSubmitStatus('Processing registration data...');
      
      const registrationData = {
        userId: user.uid,
        personalInfo: {
          firstName: data.firstName,
          middleName: data.middleName || '',
          lastName: data.lastName,
          suffix: data.suffix || '',
          email: data.email,
          ssn: data.ssn,
          dateOfBirth: data.dateOfBirth,
          phoneNumber: data.phoneNumber,
          address: data.address
        },
        profileComplete: true,
        registrationSource: 'member_registration'
      };

      // Step 2: Submit to API
      setSubmitProgress(60);
      setSubmitStatus('Saving to your account...');

      const response = await fetch('/api/member/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Registration failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Registration successful:', result);

      // Step 3: Update local profile
      setSubmitProgress(80);
      setSubmitStatus('Updating profile...');
      
      await updateProfile({
        personalInfo: registrationData.personalInfo,
        profileComplete: true,
        uhid: result.data?.uhid
      });

      // Step 4: Complete
      setSubmitProgress(100);
      setSubmitStatus('Registration complete!');

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('❌ Registration failed:', error);
      setSubmitStatus('Registration failed. Please try again.');
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Registration failed: ${error.message}`;
      }
      
      alert(errorMessage);
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to VetClaimBot</h1>
          <p className="text-gray-600 mt-2">
            Complete your member registration to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Member Registration
            </CardTitle>
            <CardDescription>
              Provide your basic information to create your member profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    {...register('middleName')}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="suffix">Suffix</Label>
                  <Input
                    id="suffix"
                    placeholder="Jr., Sr., III, etc."
                    {...register('suffix')}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="(555) 123-4567"
                      {...register('phoneNumber')}
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ssn">Social Security Number *</Label>
                    <Input
                      id="ssn"
                      placeholder="XXX-XX-XXXX"
                      {...register('ssn')}
                      className={errors.ssn ? 'border-red-500' : ''}
                    />
                    {errors.ssn && (
                      <p className="text-red-500 text-sm mt-1">{errors.ssn.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      className={errors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Address
                </h3>
                
                <div>
                  <Label htmlFor="address.street">Street Address *</Label>
                  <Input
                    id="address.street"
                    placeholder="123 Main Street"
                    {...register('address.street')}
                    className={errors.address?.street ? 'border-red-500' : ''}
                  />
                  {errors.address?.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="address.city">City *</Label>
                    <Input
                      id="address.city"
                      {...register('address.city')}
                      className={errors.address?.city ? 'border-red-500' : ''}
                    />
                    {errors.address?.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address.state">State *</Label>
                    <select
                      id="address.state"
                      {...register('address.state')}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address?.state ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select State</option>
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.address?.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address.zipCode">ZIP Code *</Label>
                    <Input
                      id="address.zipCode"
                      placeholder="12345"
                      {...register('address.zipCode')}
                      className={errors.address?.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.address?.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submission Progress */}
              {isSubmitting && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="py-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">Completing Registration</span>
                        <span className="text-sm text-blue-700">{submitProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${submitProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">{submitStatus}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isValid || isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 animate-pulse" />
                      <span>Completing Registration...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Complete Registration</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}