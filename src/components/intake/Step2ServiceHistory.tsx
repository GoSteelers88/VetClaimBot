'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Award, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntakeStore } from '@/stores/intakeStore';
import { useEffect, useRef } from 'react';

const serviceHistorySchema = z.object({
  serviceNumber: z.string().min(1, 'Service number is required'),
  branches: z.array(z.string()).min(1, 'Please select at least one branch'),
  entryDate: z.string().min(1, 'Entry date is required'),
  dischargeDate: z.string().min(1, 'Discharge date is required'),
  dischargeType: z.enum(['honorable', 'general', 'other_than_honorable', 'bad_conduct', 'dishonorable']),
  finalRank: z.string().min(1, 'Final rank is required'),
  militaryOccupationCodes: z.array(z.string()),
  serviceConnectedDisability: z.boolean(),
  currentDisabilityRating: z.number().min(0).max(100),
  reserveNationalGuard: z.boolean()
});

type ServiceHistoryFormData = z.infer<typeof serviceHistorySchema>;

interface Step2ServiceHistoryProps {
  onNext: () => void;
  onValidationChange: (isValid: boolean) => void;
}

const MILITARY_BRANCHES = [
  'Army',
  'Navy', 
  'Air Force',
  'Marines',
  'Coast Guard',
  'Space Force'
];

const DISCHARGE_TYPES = [
  { value: 'honorable', label: 'Honorable' },
  { value: 'general', label: 'General Under Honorable Conditions' },
  { value: 'other_than_honorable', label: 'Other Than Honorable' },
  { value: 'bad_conduct', label: 'Bad Conduct Discharge' },
  { value: 'dishonorable', label: 'Dishonorable Discharge' }
];

export function Step2ServiceHistory({ onNext, onValidationChange }: Step2ServiceHistoryProps) {
  const { formData, updateServiceHistory } = useIntakeStore();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<ServiceHistoryFormData>({
    resolver: zodResolver(serviceHistorySchema),
    defaultValues: {
      ...formData.serviceHistory,
      branches: formData.serviceHistory?.branches || [],
      militaryOccupationCodes: formData.serviceHistory?.militaryOccupationCodes || [],
      serviceConnectedDisability: formData.serviceHistory?.serviceConnectedDisability || false,
      currentDisabilityRating: formData.serviceHistory?.currentDisabilityRating || 0,
      reserveNationalGuard: formData.serviceHistory?.reserveNationalGuard || false
    },
    mode: 'onChange'
  });

  const watchedFields = watch();
  const selectedBranches = watch('branches') || [];

  useEffect(() => {
    // Debounce the store update to prevent excessive updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      updateServiceHistory(watchedFields);
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

  const onSubmit = (data: ServiceHistoryFormData) => {
    updateServiceHistory(data);
    onNext();
  };

  const handleBranchToggle = (branch: string) => {
    const currentBranches = selectedBranches;
    const newBranches = currentBranches.includes(branch)
      ? currentBranches.filter(b => b !== branch)
      : [...currentBranches, branch];
    setValue('branches', newBranches);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-8">
        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Military Service History</h2>
        <p className="text-gray-600 mt-2">
          Tell us about your military service background and experience.
        </p>
      </div>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Basic Service Information
          </CardTitle>
          <CardDescription>
            Your military service details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceNumber">Service Number *</Label>
              <Input
                id="serviceNumber"
                {...register('serviceNumber')}
                placeholder="123-45-6789"
                className={errors.serviceNumber ? 'border-red-500' : ''}
              />
              {errors.serviceNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.serviceNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="finalRank">Final Rank/Grade *</Label>
              <Input
                id="finalRank"
                {...register('finalRank')}
                placeholder="E-5, O-3, etc."
                className={errors.finalRank ? 'border-red-500' : ''}
              />
              {errors.finalRank && (
                <p className="text-sm text-red-600 mt-1">{errors.finalRank.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryDate">Entry Date *</Label>
              <Input
                id="entryDate"
                type="date"
                {...register('entryDate')}
                className={errors.entryDate ? 'border-red-500' : ''}
              />
              {errors.entryDate && (
                <p className="text-sm text-red-600 mt-1">{errors.entryDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dischargeDate">Discharge Date *</Label>
              <Input
                id="dischargeDate"
                type="date"
                {...register('dischargeDate')}
                className={errors.dischargeDate ? 'border-red-500' : ''}
              />
              {errors.dischargeDate && (
                <p className="text-sm text-red-600 mt-1">{errors.dischargeDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="dischargeType">Discharge Type *</Label>
            <select
              id="dischargeType"
              {...register('dischargeType')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dischargeType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {DISCHARGE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.dischargeType && (
              <p className="text-sm text-red-600 mt-1">{errors.dischargeType.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Branch of Service */}
      <Card>
        <CardHeader>
          <CardTitle>Branch(es) of Service *</CardTitle>
          <CardDescription>
            Select all branches you served in (you can select multiple)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MILITARY_BRANCHES.map((branch) => (
              <div
                key={branch}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedBranches.includes(branch)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleBranchToggle(branch)}
              >
                <div className="text-center">
                  <Shield className={`w-8 h-8 mx-auto mb-2 ${
                    selectedBranches.includes(branch) ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedBranches.includes(branch) ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    {branch}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {errors.branches && (
            <p className="text-sm text-red-600 mt-2">{errors.branches.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Current Disability Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Current Disability Status
          </CardTitle>
          <CardDescription>
            Information about existing VA disability ratings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="serviceConnectedDisability"
              {...register('serviceConnectedDisability')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="serviceConnectedDisability" className="text-sm">
              I currently have a service-connected disability rating from the VA
            </Label>
          </div>

          {watch('serviceConnectedDisability') && (
            <div>
              <Label htmlFor="currentDisabilityRating">Current Disability Rating (%)</Label>
              <Input
                id="currentDisabilityRating"
                type="number"
                min="0"
                max="100"
                step="10"
                {...register('currentDisabilityRating', { valueAsNumber: true })}
                placeholder="0"
                className={errors.currentDisabilityRating ? 'border-red-500' : ''}
              />
              {errors.currentDisabilityRating && (
                <p className="text-sm text-red-600 mt-1">{errors.currentDisabilityRating.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter your combined disability rating (0-100%)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Additional Service Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reserveNationalGuard"
                {...register('reserveNationalGuard')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="reserveNationalGuard" className="text-sm">
                I served in the Reserves or National Guard
              </Label>
            </div>
            
            <div>
              <Label htmlFor="militaryOccupationCodes">Military Occupation Codes (MOS/Rate/AFSC)</Label>
              <Input
                id="militaryOccupationCodes"
                {...register('militaryOccupationCodes.0')}
                placeholder="11B, HM, 3E5X1, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your primary military occupation specialty code
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}