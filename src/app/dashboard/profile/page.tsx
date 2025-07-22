'use client';

import { useState } from 'react';
import { User, Shield, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { VeteranProfile } from '@/types';

export default function ProfilePage() {
  const { user, veteran, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    personalInfo: veteran?.personalInfo || {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      ssn: '',
      dateOfBirth: new Date(),
      placeOfBirth: '',
      gender: 'male' as const,
      maritalStatus: 'single' as const,
      phoneNumber: '',
      alternatePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    },
    militaryService: veteran?.militaryService || {
      branch: '',
      rank: '',
      serviceStartDate: '',
      serviceEndDate: '',
      dischargeType: ''
    }
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      personalInfo: veteran?.personalInfo || {
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        ssn: '',
        dateOfBirth: new Date(),
        placeOfBirth: '',
        gender: 'male' as const,
        maritalStatus: 'single' as const,
        phoneNumber: '',
        alternatePhone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      },
      militaryService: veteran?.militaryService || {
        branch: '',
        rank: '',
        serviceStartDate: '',
        serviceEndDate: '',
        dischargeType: ''
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      personalInfo: veteran?.personalInfo || {
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        ssn: '',
        dateOfBirth: new Date(),
        placeOfBirth: '',
        gender: 'male' as const,
        maritalStatus: 'single' as const,
        phoneNumber: '',
        alternatePhone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      },
      militaryService: veteran?.militaryService || {
        branch: '',
        rank: '',
        serviceStartDate: '',
        serviceEndDate: '',
        dischargeType: ''
      }
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile(editedData as Partial<VeteranProfile>);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and service details</p>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your VetClaimBot account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Email Address</Label>
              <div className="mt-1 text-gray-900">{user?.email}</div>
            </div>
            <div>
              <Label>UHID (Unique Human ID)</Label>
              <div className="mt-1 text-gray-900 font-mono">{veteran?.uhid}</div>
            </div>
            <div>
              <Label>Account Created</Label>
              <div className="mt-1 text-gray-900">
                {user?.metadata?.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  veteran?.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {veteran?.status || 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={editedData.personalInfo.firstName || ''}
                  onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">{veteran?.personalInfo?.firstName || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={editedData.personalInfo.lastName || ''}
                  onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">{veteran?.personalInfo?.lastName || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phoneNumber"
                  value={editedData.personalInfo.phoneNumber || ''}
                  onChange={(e) => handleChange('personalInfo', 'phoneNumber', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">{veteran?.personalInfo?.phoneNumber || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editedData.personalInfo.dateOfBirth instanceof Date ? editedData.personalInfo.dateOfBirth.toISOString().split('T')[0] : editedData.personalInfo.dateOfBirth || ''}
                  onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {veteran?.personalInfo?.dateOfBirth ? 
                    new Date(veteran.personalInfo.dateOfBirth).toLocaleDateString() : 
                    'Not set'}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Mailing Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                {isEditing ? (
                  <Input
                    id="street"
                    value={editedData.personalInfo.address?.street || ''}
                    onChange={(e) => handleChange('personalInfo', 'address', {
                      ...editedData.personalInfo.address,
                      street: e.target.value
                    })}
                  />
                ) : (
                  <div className="mt-1 text-gray-900">{veteran?.personalInfo?.address?.street || 'Not set'}</div>
                )}
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={editedData.personalInfo.address?.city || ''}
                    onChange={(e) => handleChange('personalInfo', 'address', {
                      ...editedData.personalInfo.address,
                      city: e.target.value
                    })}
                  />
                ) : (
                  <div className="mt-1 text-gray-900">{veteran?.personalInfo?.address?.city || 'Not set'}</div>
                )}
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                {isEditing ? (
                  <Input
                    id="zipCode"
                    value={editedData.personalInfo.address?.zipCode || ''}
                    onChange={(e) => handleChange('personalInfo', 'address', {
                      ...editedData.personalInfo.address,
                      zipCode: e.target.value
                    })}
                  />
                ) : (
                  <div className="mt-1 text-gray-900">{veteran?.personalInfo?.address?.zipCode || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Military Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Military Service Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Branch(es) of Service</Label>
              <div className="mt-1 text-gray-900">
                {veteran?.militaryService?.branches?.join(', ') || 'Not set'}
              </div>
            </div>
            <div>
              <Label>Service Dates</Label>
              <div className="mt-1 text-gray-900">
                {veteran?.militaryService?.entryDate && veteran?.militaryService?.dischargeDate
                  ? `${new Date(veteran.militaryService.entryDate).toLocaleDateString()} - ${new Date(veteran.militaryService.dischargeDate).toLocaleDateString()}`
                  : 'Not set'}
              </div>
            </div>
            <div>
              <Label>Final Rank</Label>
              <div className="mt-1 text-gray-900">{veteran?.militaryService?.finalRank || 'Not set'}</div>
            </div>
            <div>
              <Label>Discharge Type</Label>
              <div className="mt-1 text-gray-900 capitalize">
                {veteran?.militaryService?.dischargeType?.replace('_', ' ') || 'Not set'}
              </div>
            </div>
            <div>
              <Label>Current Disability Rating</Label>
              <div className="mt-1 text-gray-900">
                {veteran?.militaryService?.currentDisabilityRating || 0}%
              </div>
            </div>
            <div>
              <Label>Service Connected</Label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  veteran?.militaryService?.serviceConnectedDisability
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {veteran?.militaryService?.serviceConnectedDisability ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployments */}
      {veteran?.deployments && veteran.deployments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deployments & Assignments</CardTitle>
            <CardDescription>
              Your recorded deployment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {veteran.deployments.map((deployment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <div className="text-gray-900">{deployment.location}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Dates</Label>
                      <div className="text-gray-900">
                        {new Date(deployment.startDate).toLocaleDateString()} - {new Date(deployment.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Unit</Label>
                      <div className="text-gray-900">{deployment.unit || 'Not specified'}</div>
                    </div>
                  </div>
                  {(deployment.combatZone || deployment.hazardousExposure) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {deployment.combatZone && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Combat Zone
                        </span>
                      )}
                      {deployment.hazardousExposure && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Hazardous Exposure
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="bg-gray-50">
        <CardContent className="py-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Need to Update Your Information?</h3>
            <p className="text-gray-600 mb-4">
              Keep your profile current to ensure accurate claim processing and benefit notifications.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/intake/1'}>
              Complete Profile Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}