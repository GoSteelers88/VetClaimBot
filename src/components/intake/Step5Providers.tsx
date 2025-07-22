'use client';

import { useState, useEffect } from 'react';
import { Plus, UserCheck, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntakeStore } from '@/stores/intakeStore';

interface Step5ProvidersProps {
  onNext: () => void;
  onValidationChange: (isValid: boolean) => void;
}

const PROVIDER_TYPES = [
  'Primary Care Physician',
  'Specialist',
  'Psychiatrist',
  'Psychologist',
  'Physical Therapist',
  'Cardiologist',
  'Neurologist',
  'Orthopedic Surgeon',
  'Pain Management',
  'Mental Health Counselor',
  'VA Medical Center',
  'VA Clinic',
  'Private Practice',
  'Hospital',
  'Other'
];

const TREATMENT_TYPES = [
  'Diagnosis',
  'Ongoing Treatment',
  'Medication Management',
  'Therapy/Counseling',
  'Physical Therapy',
  'Surgery',
  'Hospitalization',
  'Emergency Care',
  'Consultation',
  'Follow-up Care',
  'Other'
];

export function Step5Providers({ onNext, onValidationChange }: Step5ProvidersProps) {
  const { formData, addProvider, updateProvider, removeProvider } = useIntakeStore();
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Validate that if providers exist, they have basic required information
    const hasValidProviders = formData.providers.length === 0 || 
      formData.providers.every(p => p.name && p.specialty);
    
    setIsValid(hasValidProviders);
    onValidationChange(hasValidProviders);
  }, [formData.providers, onValidationChange]);

  const handleAddProvider = () => {
    addProvider({
      name: '',
      specialty: '',
      providerType: '',
      treatmentType: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      phone: '',
      email: '',
      treatmentDates: {
        startDate: new Date(),
        endDate: null,
        isOngoing: true
      },
      relevantConditions: [],
      notes: '',
      isVA: false,
      vaFacility: ''
    });
  };

  const handleRemoveProvider = (index: number) => {
    removeProvider(index);
  };

  const handleProviderChange = (index: number, field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const provider = formData.providers[index];
      updateProvider(index, {
        ...provider,
        [parent]: {
          ...provider[parent as keyof typeof provider],
          [child]: value
        }
      });
    } else {
      updateProvider(index, { [field]: value });
    }
  };

  const handleConditionToggle = (providerIndex: number, conditionName: string) => {
    const provider = formData.providers[providerIndex];
    const relevantConditions = provider.relevantConditions || [];
    const updatedConditions = relevantConditions.includes(conditionName)
      ? relevantConditions.filter(c => c !== conditionName)
      : [...relevantConditions, conditionName];
    
    handleProviderChange(providerIndex, 'relevantConditions', updatedConditions);
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <UserCheck className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Healthcare Providers</h2>
        <p className="text-gray-600 mt-2">
          Add information about doctors and healthcare providers who have treated your conditions.
        </p>
      </div>

      {/* Providers List */}
      <div className="space-y-4">
        {formData.providers.map((provider, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Provider {index + 1}
                  {provider.isVA && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      VA Provider
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProvider(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Provider Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`providerName-${index}`}>Provider Name *</Label>
                  <Input
                    id={`providerName-${index}`}
                    value={provider.name || ''}
                    onChange={(e) => handleProviderChange(index, 'name', e.target.value)}
                    placeholder="Dr. John Smith"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`specialty-${index}`}>Specialty/Department *</Label>
                  <Input
                    id={`specialty-${index}`}
                    value={provider.specialty || ''}
                    onChange={(e) => handleProviderChange(index, 'specialty', e.target.value)}
                    placeholder="Cardiology, Mental Health, etc."
                  />
                </div>
              </div>

              {/* Provider Type and Treatment Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`providerType-${index}`}>Provider Type</Label>
                  <select
                    id={`providerType-${index}`}
                    value={provider.providerType || ''}
                    onChange={(e) => handleProviderChange(index, 'providerType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select provider type</option>
                    {PROVIDER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor={`treatmentType-${index}`}>Treatment Type</Label>
                  <select
                    id={`treatmentType-${index}`}
                    value={provider.treatmentType || ''}
                    onChange={(e) => handleProviderChange(index, 'treatmentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select treatment type</option>
                    {TREATMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* VA Provider Toggle */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`isVA-${index}`}
                    checked={provider.isVA || false}
                    onChange={(e) => handleProviderChange(index, 'isVA', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor={`isVA-${index}`} className="text-sm font-medium">
                    This is a VA healthcare provider
                  </Label>
                </div>
                {provider.isVA && (
                  <div className="mt-3">
                    <Label htmlFor={`vaFacility-${index}`}>VA Facility Name</Label>
                    <Input
                      id={`vaFacility-${index}`}
                      value={provider.vaFacility || ''}
                      onChange={(e) => handleProviderChange(index, 'vaFacility', e.target.value)}
                      placeholder="Phoenix VA Medical Center"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id={`phone-${index}`}
                      type="tel"
                      value={provider.phone || ''}
                      onChange={(e) => handleProviderChange(index, 'phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`email-${index}`}>Email (if available)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={provider.email || ''}
                      onChange={(e) => handleProviderChange(index, 'email', e.target.value)}
                      placeholder="provider@clinic.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <Label>Address</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    value={provider.address?.street || ''}
                    onChange={(e) => handleProviderChange(index, 'address.street', e.target.value)}
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Input
                      value={provider.address?.city || ''}
                      onChange={(e) => handleProviderChange(index, 'address.city', e.target.value)}
                      placeholder="City"
                    />
                    <Input
                      value={provider.address?.state || ''}
                      onChange={(e) => handleProviderChange(index, 'address.state', e.target.value)}
                      placeholder="State"
                      maxLength={2}
                    />
                    <Input
                      value={provider.address?.zipCode || ''}
                      onChange={(e) => handleProviderChange(index, 'address.zipCode', e.target.value)}
                      placeholder="ZIP Code"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Treatment Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`startDate-${index}`}>First Treatment Date</Label>
                  <Input
                    id={`startDate-${index}`}
                    type="date"
                    value={provider.treatmentDates?.startDate ? new Date(provider.treatmentDates.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleProviderChange(index, 'treatmentDates.startDate', new Date(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`endDate-${index}`}>Last Treatment Date</Label>
                  <Input
                    id={`endDate-${index}`}
                    type="date"
                    value={provider.treatmentDates?.endDate ? new Date(provider.treatmentDates.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleProviderChange(index, 'treatmentDates.endDate', new Date(e.target.value))}
                    disabled={provider.treatmentDates?.isOngoing}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id={`isOngoing-${index}`}
                      checked={provider.treatmentDates?.isOngoing || false}
                      onChange={(e) => handleProviderChange(index, 'treatmentDates.isOngoing', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor={`isOngoing-${index}`} className="text-sm">
                      Ongoing treatment
                    </Label>
                  </div>
                </div>
              </div>

              {/* Related Conditions */}
              {formData.conditions.length > 0 && (
                <div>
                  <Label>Conditions Treated by This Provider</Label>
                  <p className="text-sm text-gray-600 mb-2">Select the conditions this provider has treated:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.conditions.map((condition) => (
                      <div key={condition.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`condition-${index}-${condition.id}`}
                          checked={(provider.relevantConditions || []).includes(condition.name)}
                          onChange={() => handleConditionToggle(index, condition.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor={`condition-${index}-${condition.id}`} className="text-sm">
                          {condition.name === 'Other' ? condition.customName : condition.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor={`notes-${index}`}>Additional Notes</Label>
                <textarea
                  id={`notes-${index}`}
                  rows={3}
                  value={provider.notes || ''}
                  onChange={(e) => handleProviderChange(index, 'notes', e.target.value)}
                  placeholder="Any additional information about treatment, diagnosis, or relationship to your conditions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Provider Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="py-12">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleAddProvider}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Healthcare Provider
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Add doctors, specialists, or other healthcare providers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* No Providers Option */}
        {formData.providers.length === 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-6">
              <div className="text-center">
                <UserCheck className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-medium text-yellow-900 mb-2">No Healthcare Providers?</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  If you haven't received treatment yet, that's okay. You can still file claims 
                  and add providers later when you receive care.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleNext}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Continue Without Providers
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Why do we ask about healthcare providers?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Providers can help establish medical evidence for your claim</li>
            <li>• Treatment records support the severity of your conditions</li>
            <li>• VA may request records from these providers</li>
            <li>• Helps VA understand your current treatment needs</li>
            <li>• Can be used for C&P exam scheduling and preparation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}