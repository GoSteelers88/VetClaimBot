'use client';

import { useState, useEffect } from 'react';
import { Plus, Stethoscope, Trash2, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntakeStore } from '@/stores/intakeStore';

interface Step4ConditionsProps {
  onNext: () => void;
  onValidationChange: (isValid: boolean) => void;
}

const COMMON_CONDITIONS = [
  'PTSD',
  'Depression',
  'Anxiety',
  'Tinnitus',
  'Hearing Loss',
  'Back Pain',
  'Knee Pain',
  'Migraine Headaches',
  'Sleep Apnea',
  'Diabetes Type 2',
  'Hypertension',
  'Asthma',
  'Gastroesophageal Reflux Disease (GERD)',
  'Shoulder Injury',
  'Traumatic Brain Injury (TBI)',
  'Scars',
  'Skin Conditions',
  'Joint Pain',
  'Chronic Pain',
  'Other'
];

const BODY_SYSTEMS = [
  'Musculoskeletal',
  'Mental Health',
  'Neurological',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Genitourinary',
  'Endocrine',
  'Skin',
  'Eyes',
  'Ears',
  'Other'
];

const SYMPTOM_SEVERITY = [
  { value: 'mild', label: 'Mild - Minimal impact on daily life' },
  { value: 'moderate', label: 'Moderate - Some impact on daily activities' },
  { value: 'severe', label: 'Severe - Significant impact on daily life' },
  { value: 'very-severe', label: 'Very Severe - Major impact on ability to function' }
];

export function Step4Conditions({ onNext, onValidationChange }: Step4ConditionsProps) {
  const { formData, addCondition, updateCondition, removeCondition, updateFormData } = useIntakeStore();
  const [isValid, setIsValid] = useState(false);
  const [skipConditions, setSkipConditions] = useState(formData.skipConditions || false);

  useEffect(() => {
    // Validate that we either have conditions OR user chose to skip
    const hasValidConditions = formData.conditions.length > 0 && 
      formData.conditions.some(c => c.name && c.dateFirstNoticed);
    
    const isValidStep = hasValidConditions || skipConditions;
    setIsValid(isValidStep);
    onValidationChange(isValidStep);
  }, [formData.conditions, skipConditions, onValidationChange]);

  const handleAddCondition = () => {
    addCondition({
      name: '',
      bodySystem: '',
      dateFirstNoticed: new Date(),
      currentSeverity: 'moderate',
      symptoms: [],
      serviceConnection: '',
      treatmentHistory: '',
      workRelated: false,
      isPresumed: false,
      deploymentRelated: false
    });
  };

  const handleRemoveCondition = (index: number) => {
    removeCondition(index);
  };

  const handleConditionChange = (index: number, field: string, value: any) => {
    updateCondition(index, { [field]: value });
  };

  const handleSymptomsChange = (index: number, symptom: string) => {
    const condition = formData.conditions[index];
    const symptoms = condition.symptoms || [];
    const updatedSymptoms = symptoms.includes(symptom)
      ? symptoms.filter(s => s !== symptom)
      : [...symptoms, symptom];
    
    handleConditionChange(index, 'symptoms', updatedSymptoms);
  };

  const getPresumptiveInfo = (conditionName: string, deployments: any[]) => {
    const presumptiveConditions = {
      'PTSD': ['Iraq', 'Afghanistan', 'Kuwait', 'Persian Gulf'],
      'Diabetes Type 2': ['Vietnam', 'Thailand', 'Cambodia', 'Laos'],
      'Asthma': ['Iraq', 'Afghanistan', 'Kuwait'],
      'Chronic Bronchitis': ['Iraq', 'Afghanistan', 'Kuwait'],
      'Hypertension': ['Vietnam', 'Thailand', 'Cambodia', 'Laos'],
    };

    const deploymentCountries = deployments.map(d => d.country);
    const presumptiveLocations = presumptiveConditions[conditionName as keyof typeof presumptiveConditions];
    
    if (presumptiveLocations) {
      const matchingDeployments = deploymentCountries.filter(country => 
        presumptiveLocations.includes(country)
      );
      return matchingDeployments.length > 0 ? matchingDeployments : null;
    }
    
    return null;
  };

  const handleSkipToggle = (skip: boolean) => {
    setSkipConditions(skip);
    updateFormData({ skipConditions: skip });
    
    // If skipping, clear any existing conditions
    if (skip && formData.conditions.length > 0) {
      // Clear conditions but keep the skip flag
      updateFormData({ conditions: [] });
    }
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Stethoscope className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Medical Conditions</h2>
        <p className="text-gray-600 mt-2">
          Tell us about the medical conditions you want to claim for VA benefits. Be as specific as possible.
        </p>
      </div>

      {/* Skip Option */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="skipConditions"
                checked={skipConditions}
                onChange={(e) => handleSkipToggle(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="skipConditions" className="text-base font-medium">
                I don't have any medical conditions to claim right now
              </Label>
            </div>
            {skipConditions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 ml-7">
                <p className="text-sm text-blue-700">
                  You can always return later to add medical conditions to your claim. 
                  You'll still be able to complete your profile and access other VA benefit resources.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditions List - only show if not skipping */}
      {!skipConditions && (
        <div className="space-y-4">
          {formData.conditions.map((condition, index) => {
          const presumptiveInfo = getPresumptiveInfo(condition.name, formData.deployments);
          
          return (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Condition {index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCondition(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {presumptiveInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Potential Presumptive Condition
                        </p>
                        <p className="text-xs text-green-700">
                          Based on your deployment to {presumptiveInfo.join(', ')}, this condition may qualify as presumptive.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Condition Name and Body System */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`conditionName-${index}`}>Condition Name *</Label>
                    <select
                      id={`conditionName-${index}`}
                      value={condition.name || ''}
                      onChange={(e) => handleConditionChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a condition</option>
                      {COMMON_CONDITIONS.map((conditionName) => (
                        <option key={conditionName} value={conditionName}>
                          {conditionName}
                        </option>
                      ))}
                    </select>
                    {condition.name === 'Other' && (
                      <Input
                        className="mt-2"
                        placeholder="Please specify the condition"
                        value={condition.customName || ''}
                        onChange={(e) => handleConditionChange(index, 'customName', e.target.value)}
                      />
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`bodySystem-${index}`}>Body System</Label>
                    <select
                      id={`bodySystem-${index}`}
                      value={condition.bodySystem || ''}
                      onChange={(e) => handleConditionChange(index, 'bodySystem', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select body system</option>
                      {BODY_SYSTEMS.map((system) => (
                        <option key={system} value={system}>
                          {system}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date First Noticed and Current Severity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`dateFirstNoticed-${index}`}>When did you first notice symptoms? *</Label>
                    <Input
                      id={`dateFirstNoticed-${index}`}
                      type="date"
                      value={condition.dateFirstNoticed ? new Date(condition.dateFirstNoticed).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleConditionChange(index, 'dateFirstNoticed', new Date(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`severity-${index}`}>Current Severity</Label>
                    <select
                      id={`severity-${index}`}
                      value={condition.currentSeverity || 'moderate'}
                      onChange={(e) => handleConditionChange(index, 'currentSeverity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SYMPTOM_SEVERITY.map((severity) => (
                        <option key={severity.value} value={severity.value}>
                          {severity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Service Connection */}
                <div>
                  <Label htmlFor={`serviceConnection-${index}`}>How is this condition related to your military service?</Label>
                  <textarea
                    id={`serviceConnection-${index}`}
                    rows={3}
                    value={condition.serviceConnection || ''}
                    onChange={(e) => handleConditionChange(index, 'serviceConnection', e.target.value)}
                    placeholder="Describe how this condition is connected to your military service (injury, exposure, stress, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Current Symptoms */}
                <div>
                  <Label>Current Symptoms</Label>
                  <p className="text-sm text-gray-600 mb-2">Check all symptoms you currently experience:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {condition.name === 'PTSD' && ['Flashbacks', 'Nightmares', 'Anxiety', 'Depression', 'Irritability', 'Sleep problems', 'Avoidance', 'Hypervigilance'].map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`symptom-${index}-${symptom}`}
                          checked={(condition.symptoms || []).includes(symptom)}
                          onChange={() => handleSymptomsChange(index, symptom)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor={`symptom-${index}-${symptom}`} className="text-sm">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                    
                    {condition.name === 'Tinnitus' && ['Ringing', 'Buzzing', 'Humming', 'Roaring', 'Clicking', 'Hissing'].map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`symptom-${index}-${symptom}`}
                          checked={(condition.symptoms || []).includes(symptom)}
                          onChange={() => handleSymptomsChange(index, symptom)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor={`symptom-${index}-${symptom}`} className="text-sm">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Treatment History */}
                <div>
                  <Label htmlFor={`treatment-${index}`}>Current or Past Treatment</Label>
                  <textarea
                    id={`treatment-${index}`}
                    rows={2}
                    value={condition.treatmentHistory || ''}
                    onChange={(e) => handleConditionChange(index, 'treatmentHistory', e.target.value)}
                    placeholder="List any doctors, medications, therapies, or treatments you've received for this condition"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Additional Flags */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`deploymentRelated-${index}`}
                        checked={condition.deploymentRelated || false}
                        onChange={(e) => handleConditionChange(index, 'deploymentRelated', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor={`deploymentRelated-${index}`} className="text-sm">
                        This condition is related to a deployment
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`workRelated-${index}`}
                        checked={condition.workRelated || false}
                        onChange={(e) => handleConditionChange(index, 'workRelated', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor={`workRelated-${index}`} className="text-sm">
                        This affects my ability to work
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Condition Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="py-12">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleAddCondition}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Medical Condition
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Add each medical condition you want to claim
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">Tips for Describing Your Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be specific about symptoms and how they affect your daily life</li>
              <li>• Include any diagnoses from military or civilian doctors</li>
              <li>• Describe the connection between your condition and military service</li>
              <li>• List all treatments you've tried or are currently receiving</li>
              <li>• Don't worry about being perfect - you can always add more details later</li>
            </ul>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Validation Message */}
      {!isValid && formData.conditions.length === 0 && !skipConditions && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Please add at least one medical condition or check "I don't have any medical conditions to claim right now" to continue.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}