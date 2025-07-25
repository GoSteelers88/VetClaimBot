'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, MapPin, Heart, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntakeStore } from '@/stores/intakeStore';
import { useEffect, useRef } from 'react';

const personalInfoSchema = z.object({
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
  }),
  healthcare: z.object({
    hasPrivateInsurance: z.boolean().default(false),
    insuranceProvider: z.string().optional(),
    preferredVAFacility: z.string().optional(),
    priorityGroup: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', 'Unknown']).optional()
  }).optional()
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface Step1PersonalInfoProps {
  onNext: () => void;
  onValidationChange: (isValid: boolean) => void;
}

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

const VA_FACILITIES = [
  'VA Medical Center - Birmingham, AL',
  'VA Medical Center - Phoenix, AZ', 
  'VA Medical Center - Little Rock, AR',
  'VA Medical Center - Los Angeles, CA',
  'VA Medical Center - San Francisco, CA',
  'VA Medical Center - Denver, CO',
  'VA Medical Center - West Haven, CT',
  'VA Medical Center - Wilmington, DE',
  'VA Medical Center - Miami, FL',
  'VA Medical Center - Tampa, FL',
  'VA Medical Center - Atlanta, GA',
  'VA Medical Center - Honolulu, HI',
  'VA Medical Center - Boise, ID',
  'VA Medical Center - Chicago, IL',
  'VA Medical Center - Indianapolis, IN',
  'VA Medical Center - Iowa City, IA',
  'VA Medical Center - Kansas City, MO',
  'VA Medical Center - Louisville, KY',
  'VA Medical Center - New Orleans, LA',
  'VA Medical Center - Boston, MA',
  'VA Medical Center - Detroit, MI',
  'VA Medical Center - Minneapolis, MN',
  'VA Medical Center - Jackson, MS',
  'VA Medical Center - St. Louis, MO',
  'VA Medical Center - Helena, MT',
  'VA Medical Center - Omaha, NE',
  'VA Medical Center - Las Vegas, NV',
  'VA Medical Center - Manchester, NH',
  'VA Medical Center - East Orange, NJ',
  'VA Medical Center - Albuquerque, NM',
  'VA Medical Center - New York, NY',
  'VA Medical Center - Durham, NC',
  'VA Medical Center - Fargo, ND',
  'VA Medical Center - Cleveland, OH',
  'VA Medical Center - Oklahoma City, OK',
  'VA Medical Center - Portland, OR',
  'VA Medical Center - Philadelphia, PA',
  'VA Medical Center - Providence, RI',
  'VA Medical Center - Columbia, SC',
  'VA Medical Center - Sioux Falls, SD',
  'VA Medical Center - Nashville, TN',
  'VA Medical Center - Houston, TX',
  'VA Medical Center - Dallas, TX',
  'VA Medical Center - Salt Lake City, UT',
  'VA Medical Center - White River Junction, VT',
  'VA Medical Center - Richmond, VA',
  'VA Medical Center - Seattle, WA',
  'VA Medical Center - Martinsburg, WV',
  'VA Medical Center - Milwaukee, WI',
  'VA Medical Center - Cheyenne, WY'
];

export function Step1PersonalInfo({ onNext, onValidationChange }: Step1PersonalInfoProps) {
  const { formData, updatePersonalInfo, getStepValidation } = useIntakeStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      ...formData.personalInfo,
      healthcare: formData.personalInfo?.healthcare || {
        hasPrivateInsurance: false,
        priorityGroup: 'Unknown'
      }
    },
    mode: 'onChange'
  });

  // Initialize validation from stored state when component mounts
  useEffect(() => {
    const storedValidation = getStepValidation(1);
    if (storedValidation && !isValid) {
      // If we have stored validation but form isn't currently valid,
      // trust the current form state (user might have modified data)
      onValidationChange(isValid);
    } else if (storedValidation) {
      // Use stored validation if available and form is valid
      onValidationChange(storedValidation);
    }
  }, []);

  // Watch all fields to update store in real-time
  const watchedFields = watch();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce the store update to prevent excessive updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      updatePersonalInfo(watchedFields);
    }, 300); // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watchedFields]);

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  const onSubmit = (data: PersonalInfoFormData) => {
    updatePersonalInfo(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-8">
        <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-600 mt-2">
          Let's start with your basic information to create your veteran profile.
        </p>
      </div>

      {/* Name Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Full Name
          </CardTitle>
          <CardDescription>
            Enter your legal name as it appears on official documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="John"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                {...register('middleName')}
                placeholder="Michael"
              />
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Doe"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="w-full md:w-32">
            <Label htmlFor="suffix">Suffix</Label>
            <select
              id="suffix"
              {...register('suffix')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              <option value="Jr">Jr</option>
              <option value="Sr">Sr</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Contact Information
          </CardTitle>
          <CardDescription>
            How can we reach you about your claim?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="(555) 123-4567"
                className={errors.phoneNumber ? 'border-red-500' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>
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
                <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="ssn">Social Security Number *</Label>
            <Input
              id="ssn"
              {...register('ssn')}
              placeholder="XXX-XX-XXXX"
              className={errors.ssn ? 'border-red-500' : ''}
            />
            {errors.ssn && (
              <p className="text-sm text-red-600 mt-1">{errors.ssn.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Your SSN is encrypted and secure
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Mailing Address
          </CardTitle>
          <CardDescription>
            Where should we send important documents?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              {...register('address.street')}
              placeholder="123 Main Street"
              className={errors.address?.street ? 'border-red-500' : ''}
            />
            {errors.address?.street && (
              <p className="text-sm text-red-600 mt-1">{errors.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('address.city')}
                placeholder="Hometown"
                className={errors.address?.city ? 'border-red-500' : ''}
              />
              {errors.address?.city && (
                <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <select
                id="state"
                {...register('address.state')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address?.state ? 'border-red-500' : 'border-gray-300'
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
                <p className="text-sm text-red-600 mt-1">{errors.address.state.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                {...register('address.zipCode')}
                placeholder="12345"
                className={errors.address?.zipCode ? 'border-red-500' : ''}
              />
              {errors.address?.zipCode && (
                <p className="text-sm text-red-600 mt-1">{errors.address.zipCode.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Healthcare Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Healthcare Information
          </CardTitle>
          <CardDescription>
            Help us understand your healthcare needs and eligibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasPrivateInsurance"
              {...register('healthcare.hasPrivateInsurance')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="hasPrivateInsurance" className="text-sm">
              I have private health insurance
            </Label>
          </div>

          {watch('healthcare.hasPrivateInsurance') && (
            <div>
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                {...register('healthcare.insuranceProvider')}
                placeholder="Blue Cross, Aetna, etc."
              />
            </div>
          )}

          <div>
            <Label htmlFor="priorityGroup">VA Priority Group (if known)</Label>
            <select
              id="priorityGroup"
              {...register('healthcare.priorityGroup')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Unknown">I don't know my priority group</option>
              <option value="1">Group 1 - Service-connected 50% or more</option>
              <option value="2">Group 2 - Service-connected 30-40%</option>
              <option value="3">Group 3 - Service-connected 10-20%</option>
              <option value="4">Group 4 - Service-connected 0% or catastrophic disability</option>
              <option value="5">Group 5 - Non-service-connected, low income</option>
              <option value="6">Group 6 - Compensable 0% or exposed to radiation/herbicides</option>
              <option value="7">Group 7 - Higher income, agreed to pay copay</option>
              <option value="8">Group 8 - Higher income, enrolled before 2003</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Your priority group determines your eligibility and copay requirements
            </p>
          </div>
        </CardContent>
      </Card>

      {/* VA Facility Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            VA Facility Preference
          </CardTitle>
          <CardDescription>
            Which VA medical facility would you prefer for care?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="preferredVAFacility">Preferred VA Medical Center</Label>
            <select
              id="preferredVAFacility"
              {...register('healthcare.preferredVAFacility')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a VA Medical Center</option>
              {VA_FACILITIES.map((facility) => (
                <option key={facility} value={facility}>
                  {facility}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This helps us route your healthcare-related claims appropriately
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}