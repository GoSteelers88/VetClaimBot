'use client';

import { useState, useEffect } from 'react';
import { Plus, UserCheck, Trash2, Phone, Mail, MapPin, Link } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntakeStore } from '@/stores/intakeStore';
import { transformProvidersForFirebase } from '@/lib/firebase-transforms';

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
      id: `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      type: 'private',
      specialty: '',
      providerType: '',
      isVA: false,
      relevantConditions: [],
      contactInfo: {
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      },
      treatmentPeriod: {
        start: new Date(),
        end: null
      },
      treatmentType: '',
      notes: '',
      vaFacility: '',
      isOngoing: true
    });
  };

  const handleRemoveProvider = (index: number) => {
    removeProvider(index);
  };

  const handleProviderChange = (index: number, field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      const provider = formData.providers[index];
      
      if (grandchild) {
        // Handle nested fields like contactInfo.address.street
        updateProvider(index, {
          ...provider,
          [parent]: {
            ...provider[parent as keyof typeof provider],
            [child]: {
              ...(provider[parent as keyof typeof provider] as any)?.[child],
              [grandchild]: value
            }
          }
        });
      } else if (parent === 'contactInfo') {
        updateProvider(index, {
          ...provider,
          contactInfo: {
            ...provider.contactInfo,
            [child]: value
          }
        });
      } else if (parent === 'treatmentPeriod') {
        updateProvider(index, {
          ...provider,
          treatmentPeriod: {
            ...provider.treatmentPeriod,
            [child]: value
          }
        });
      } else {
        updateProvider(index, {
          ...provider,
          [parent]: {
            ...provider[parent as keyof typeof provider],
            [child]: value
          }
        });
      }
    } else {
      const provider = formData.providers[index];
      // Handle special field mappings
      if (field === 'isVA') {
        updateProvider(index, { 
          [field]: value,
          type: value ? 'va' : 'private'
        });
      } else {
        updateProvider(index, { [field]: value });
      }
    }
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
              {/* Basic Provider Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`providerName-${index}`}>Provider Name *</Label>
                  <Input
                    id={`providerName-${index}`}
                    value={provider.name || ''}
                    onChange={(e) => handleProviderChange(index, 'name', e.target.value)}
                    placeholder="Dr. Smith, VA Medical Center, etc."
                    className={!provider.name ? 'border-red-500' : ''}
                  />
                  {!provider.name && (
                    <p className="text-sm text-red-600 mt-1">Provider name is required</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`specialty-${index}`}>Specialty/Department *</Label>
                  <Input
                    id={`specialty-${index}`}
                    value={provider.specialty || ''}
                    onChange={(e) => handleProviderChange(index, 'specialty', e.target.value)}
                    placeholder="Cardiology, Mental Health, etc."
                    className={!provider.specialty ? 'border-red-500' : ''}
                  />
                  {!provider.specialty && (
                    <p className="text-sm text-red-600 mt-1">Specialty is required</p>
                  )}
                </div>
              </div>

              {/* Provider Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`providerType-${index}`}>Provider Type</Label>
                  <select
                    id={`providerType-${index}`}
                    value={provider.providerType || ''}
                    onChange={(e) => handleProviderChange(index, 'providerType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Provider Type</option>
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
                    <option value="">Select Treatment Type</option>
                    {TREATMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Link to Conditions */}
              <div>
                <Label>Related Medical Conditions</Label>
                <p className="text-sm text-gray-600 mb-2">Which conditions does this provider treat?</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`provider-${index}-condition-${conditionIndex}`}
                        checked={(provider.relevantConditions || []).includes(condition.id || `condition_${conditionIndex}`)}
                        onChange={(e) => {
                          const conditionId = condition.id || `condition_${conditionIndex}`;
                          const currentConditions = provider.relevantConditions || [];
                          const updatedConditions = e.target.checked
                            ? [...currentConditions, conditionId]
                            : currentConditions.filter(id => id !== conditionId);
                          handleProviderChange(index, 'relevantConditions', updatedConditions);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor={`provider-${index}-condition-${conditionIndex}`} className="text-sm">
                        {condition.name || condition.customName || `Condition ${conditionIndex + 1}`}
                      </Label>
                    </div>
                  ))}
                  {formData.conditions.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No conditions added yet. Add conditions in Step 4 to link them here.</p>
                  )}
                </div>
              </div>

              {/* VA Provider Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id={`isVA-${index}`}
                    checked={provider.isVA || false}
                    onChange={(e) => handleProviderChange(index, 'isVA', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor={`isVA-${index}`} className="font-medium">
                    This is a VA healthcare provider
                  </Label>
                </div>
                
                {provider.isVA && (
                  <div>
                    <Label htmlFor={`vaFacility-${index}`}>VA Facility Name</Label>
                    <Input
                      id={`vaFacility-${index}`}
                      value={provider.vaFacility || ''}
                      onChange={(e) => handleProviderChange(index, 'vaFacility', e.target.value)}
                      placeholder="VA Medical Center - City Name"
                    />
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Contact Information</h4>
                
                <div>
                  <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                  <Input
                    id={`phone-${index}`}
                    value={provider.contactInfo?.phone || ''}
                    onChange={(e) => handleProviderChange(index, 'contactInfo.phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor={`street-${index}`}>Street Address</Label>
                  <Input
                    id={`street-${index}`}
                    value={provider.contactInfo?.address?.street || ''}
                    onChange={(e) => handleProviderChange(index, 'contactInfo.address.street', e.target.value)}
                    placeholder="123 Medical Center Dr"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`city-${index}`}>City</Label>
                    <Input
                      id={`city-${index}`}
                      value={provider.contactInfo?.address?.city || ''}
                      onChange={(e) => handleProviderChange(index, 'contactInfo.address.city', e.target.value)}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`state-${index}`}>State</Label>
                    <Input
                      id={`state-${index}`}
                      value={provider.contactInfo?.address?.state || ''}
                      onChange={(e) => handleProviderChange(index, 'contactInfo.address.state', e.target.value)}
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`zipCode-${index}`}>ZIP Code</Label>
                    <Input
                      id={`zipCode-${index}`}
                      value={provider.contactInfo?.address?.zipCode || ''}
                      onChange={(e) => handleProviderChange(index, 'contactInfo.address.zipCode', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>

              {/* Treatment Dates */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Treatment Period</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`startDate-${index}`}>Treatment Start Date</Label>
                    <Input
                      id={`startDate-${index}`}
                      type="date"
                      value={provider.treatmentPeriod?.start ? new Date(provider.treatmentPeriod.start).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleProviderChange(index, 'treatmentPeriod.start', new Date(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`endDate-${index}`}>Treatment End Date</Label>
                    <Input
                      id={`endDate-${index}`}
                      type="date"
                      value={provider.treatmentPeriod?.end ? new Date(provider.treatmentPeriod.end).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleProviderChange(index, 'treatmentPeriod.end', new Date(e.target.value))}
                      disabled={provider.isOngoing}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`isOngoing-${index}`}
                    checked={provider.isOngoing || false}
                    onChange={(e) => {
                      handleProviderChange(index, 'isOngoing', e.target.checked);
                      if (e.target.checked) {
                        handleProviderChange(index, 'treatmentPeriod.end', null);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor={`isOngoing-${index}`} className="text-sm">
                    This is ongoing treatment
                  </Label>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor={`notes-${index}`}>Additional Notes</Label>
                <textarea
                  id={`notes-${index}`}
                  rows={2}
                  value={provider.notes || ''}
                  onChange={(e) => handleProviderChange(index, 'notes', e.target.value)}
                  placeholder="Any additional information about this provider or treatment..."
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
                Add doctors, specialists, or healthcare facilities that have treated your conditions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">Why do we ask about healthcare providers?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Provides medical evidence to support your claim</li>
              <li>• Helps establish treatment history and severity</li>
              <li>• VA may request records from these providers</li>
              <li>• Links your conditions to professional medical care</li>
              <li>• Shows ongoing impact of your conditions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}