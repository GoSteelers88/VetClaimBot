'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntakeStore } from '@/stores/intakeStore';

interface Step3DeploymentsProps {
  onNext: () => void;
  onValidationChange: (isValid: boolean) => void;
}

const COMMON_DEPLOYMENT_LOCATIONS = [
  'Iraq', 'Afghanistan', 'Kuwait', 'Germany', 'Japan', 'South Korea',
  'Guantanamo Bay', 'Bosnia', 'Kosovo', 'Somalia', 'Persian Gulf',
  'Vietnam', 'Thailand', 'Cambodia', 'Laos'
];

const MISSION_TYPES = [
  'Combat Operations',
  'Peacekeeping',
  'Training Mission',
  'Humanitarian Aid',
  'Security Operations',
  'Advisory Role',
  'Other'
];

export function Step3Deployments({ onNext, onValidationChange }: Step3DeploymentsProps) {
  const { formData, addDeployment, updateDeployment, removeDeployment } = useIntakeStore();
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Validate that we have at least basic information
    const hasValidDeployments = formData.deployments.length === 0 || 
      formData.deployments.some(d => d.location && d.startDate);
    
    setIsValid(hasValidDeployments);
    onValidationChange(hasValidDeployments);
  }, [formData.deployments, onValidationChange]);

  const handleAddDeployment = () => {
    addDeployment({
      location: '',
      country: '',
      startDate: new Date(),
      endDate: new Date(),
      unit: '',
      missionType: '',
      hazardousExposure: false,
      combatZone: false
    });
  };

  const handleRemoveDeployment = (index: number) => {
    removeDeployment(index);
  };

  const handleDeploymentChange = (index: number, field: string, value: any) => {
    updateDeployment(index, { [field]: value });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MapPin className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Deployments & Assignments</h2>
        <p className="text-gray-600 mt-2">
          Add information about your deployments and overseas assignments. This helps identify potential exposures.
        </p>
      </div>

      {/* Deployments List */}
      <div className="space-y-4">
        {formData.deployments.map((deployment, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Deployment {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDeployment(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`location-${index}`}>Location/Base *</Label>
                  <Input
                    id={`location-${index}`}
                    value={deployment.location || ''}
                    onChange={(e) => handleDeploymentChange(index, 'location', e.target.value)}
                    placeholder="Baghdad, FOB Liberty, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor={`country-${index}`}>Country *</Label>
                  <select
                    id={`country-${index}`}
                    value={deployment.country || ''}
                    onChange={(e) => handleDeploymentChange(index, 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Country</option>
                    {COMMON_DEPLOYMENT_LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`startDate-${index}`}>Start Date *</Label>
                  <Input
                    id={`startDate-${index}`}
                    type="date"
                    value={deployment.startDate ? new Date(deployment.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDeploymentChange(index, 'startDate', new Date(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`endDate-${index}`}>End Date *</Label>
                  <Input
                    id={`endDate-${index}`}
                    type="date"
                    value={deployment.endDate ? new Date(deployment.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDeploymentChange(index, 'endDate', new Date(e.target.value))}
                  />
                </div>
              </div>

              {/* Unit and Mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`unit-${index}`}>Unit Assignment</Label>
                  <Input
                    id={`unit-${index}`}
                    value={deployment.unit || ''}
                    onChange={(e) => handleDeploymentChange(index, 'unit', e.target.value)}
                    placeholder="1st Infantry Division, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor={`missionType-${index}`}>Mission Type</Label>
                  <select
                    id={`missionType-${index}`}
                    value={deployment.missionType || ''}
                    onChange={(e) => handleDeploymentChange(index, 'missionType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Mission Type</option>
                    {MISSION_TYPES.map((mission) => (
                      <option key={mission} value={mission}>
                        {mission}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exposure Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-3">Potential Exposures</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`combatZone-${index}`}
                      checked={deployment.combatZone || false}
                      onChange={(e) => handleDeploymentChange(index, 'combatZone', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor={`combatZone-${index}`} className="text-sm">
                      This was a combat zone deployment
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`hazardousExposure-${index}`}
                      checked={deployment.hazardousExposure || false}
                      onChange={(e) => handleDeploymentChange(index, 'hazardousExposure', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor={`hazardousExposure-${index}`} className="text-sm">
                      I was exposed to hazardous materials (burn pits, chemicals, etc.)
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  This information helps identify potential presumptive conditions for your claim.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Deployment Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="py-12">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleAddDeployment}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Deployment
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Add information about deployments, TDY assignments, or overseas duty
              </p>
            </div>
          </CardContent>
        </Card>

        {/* No Deployments Option */}
        {formData.deployments.length === 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-blue-900 mb-2">No Deployments?</h3>
                <p className="text-sm text-blue-700 mb-4">
                  If you didn't have any deployments or overseas assignments, that's okay. 
                  You can still file claims for conditions related to your stateside service.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleNext}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Continue Without Deployments
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Why do we ask about deployments?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Identifies potential exposure-related presumptive conditions</li>
            <li>• Helps establish service connection for certain illnesses</li>
            <li>• Provides context for your military service experience</li>
            <li>• May qualify you for additional benefits or expedited processing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}