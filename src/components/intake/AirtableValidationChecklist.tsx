'use client';

import { CheckCircle, XCircle, AlertTriangle, User, Shield, MapPin, Stethoscope, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IntakeFormData } from '@/types';

interface ChecklistItem {
  id: string;
  category: string;
  field: string;
  label: string;
  required: boolean;
  isValid: boolean;
  value?: string;
  icon: React.ReactNode;
  errorMessage?: string;
}

interface AirtableValidationChecklistProps {
  formData: IntakeFormData;
  claimType: 'disability' | 'healthcare';
}

export function AirtableValidationChecklist({ formData, claimType }: AirtableValidationChecklistProps) {
  // Define validation rules based on Airtable field requirements
  const validateFormData = (): ChecklistItem[] => {
    const items: ChecklistItem[] = [];

    // Personal Information (Required for all claim types)
    items.push({
      id: 'veteran-name',
      category: 'Personal Information',
      field: 'Veteran Name',
      label: 'Full Name (First & Last)',
      required: true,
      isValid: !!(formData.personalInfo?.firstName && formData.personalInfo?.lastName),
      value: `${formData.personalInfo?.firstName || ''} ${formData.personalInfo?.lastName || ''}`.trim(),
      icon: <User className="w-4 h-4" />,
      errorMessage: 'First and last name are required for Airtable'
    });

    items.push({
      id: 'email',
      category: 'Personal Information',
      field: 'Email',
      label: 'Email Address',
      required: true,
      isValid: !!(formData.personalInfo?.email && formData.personalInfo.email.includes('@')),
      value: formData.personalInfo?.email,
      icon: <User className="w-4 h-4" />,
      errorMessage: 'Valid email address is required'
    });

    items.push({
      id: 'phone',
      category: 'Personal Information',
      field: 'Phone',
      label: 'Phone Number',
      required: true,
      isValid: !!(formData.personalInfo?.phoneNumber && formData.personalInfo.phoneNumber.length >= 10),
      value: formData.personalInfo?.phoneNumber,
      icon: <User className="w-4 h-4" />,
      errorMessage: 'Phone number is required for contact'
    });

    // Service History (Required for all claim types)
    items.push({
      id: 'branch-service',
      category: 'Military Service',
      field: 'Branch of Service',
      label: 'Military Branch(es)',
      required: true,
      isValid: !!(formData.serviceHistory?.branches && formData.serviceHistory.branches.length > 0),
      value: formData.serviceHistory?.branches?.join(', '),
      icon: <Shield className="w-4 h-4" />,
      errorMessage: 'At least one military branch is required'
    });

    items.push({
      id: 'service-dates',
      category: 'Military Service',
      field: 'Service Dates',
      label: 'Entry & Discharge Dates',
      required: true,
      isValid: !!(formData.serviceHistory?.entryDate && formData.serviceHistory?.dischargeDate),
      value: formData.serviceHistory?.entryDate && formData.serviceHistory?.dischargeDate 
        ? `${new Date(formData.serviceHistory.entryDate).getFullYear()} - ${new Date(formData.serviceHistory.dischargeDate).getFullYear()}`
        : undefined,
      icon: <Shield className="w-4 h-4" />,
      errorMessage: 'Entry and discharge dates are required'
    });

    items.push({
      id: 'current-rating',
      category: 'Military Service',
      field: 'Current Rating',
      label: 'Current Disability Rating',
      required: false,
      isValid: true, // Optional field
      value: formData.serviceHistory?.currentDisabilityRating ? 
        `${formData.serviceHistory.currentDisabilityRating}%` : '0%',
      icon: <Shield className="w-4 h-4" />
    });

    // Claim Type Specific Validations
    if (claimType === 'disability') {
      items.push({
        id: 'conditions-claimed',
        category: 'Disability Claim',
        field: 'Conditions Claimed',
        label: 'Medical Conditions',
        required: true,
        isValid: !!(formData.conditions && formData.conditions.length > 0),
        value: formData.conditions?.map(c => c.name || c.conditionName).filter(Boolean).join(', '),
        icon: <Stethoscope className="w-4 h-4" />,
        errorMessage: 'At least one medical condition is required for disability claims'
      });

      items.push({
        id: 'service-connection',
        category: 'Disability Claim',
        field: 'Service Connection',
        label: 'Service Connection Evidence',
        required: true,
        isValid: !!(formData.conditions && formData.conditions.some(c => c.serviceConnection)),
        value: formData.conditions?.some(c => c.serviceConnection) ? 'Yes' : 'No',
        icon: <Stethoscope className="w-4 h-4" />,
        errorMessage: 'At least one condition should have service connection information'
      });

      // Check for exposure information from deployments
      const hasExposureInfo = formData.deployments && formData.deployments.some(d => 
        d.hazardousExposure || (d.exposureTypes && d.exposureTypes.length > 0)
      );
      
      items.push({
        id: 'exposure-type',
        category: 'Disability Claim',
        field: 'Exposure Type',
        label: 'Hazardous Exposure History',
        required: false,
        isValid: true, // Optional but helpful
        value: hasExposureInfo ? 'Documented' : 'None documented',
        icon: <MapPin className="w-4 h-4" />
      });
    }

    if (claimType === 'healthcare') {
      items.push({
        id: 'priority-group',
        category: 'Healthcare Claim',
        field: 'Priority Group',
        label: 'VA Priority Group',
        required: false,
        isValid: true,
        value: formData.personalInfo?.healthcare?.priorityGroup || 'Unknown',
        icon: <Stethoscope className="w-4 h-4" />
      });

      items.push({
        id: 'insurance-status',
        category: 'Healthcare Claim',
        field: 'Insurance',
        label: 'Private Insurance Status',
        required: true,
        isValid: formData.personalInfo?.healthcare?.hasPrivateInsurance !== undefined,
        value: formData.personalInfo?.healthcare?.hasPrivateInsurance ? 'Yes' : 'No',
        icon: <Stethoscope className="w-4 h-4" />,
        errorMessage: 'Insurance status is required for healthcare enrollment'
      });
    }

    // Supporting Documentation
    items.push({
      id: 'medical-records',
      category: 'Documentation',
      field: 'Medical Records',
      label: 'Medical Documentation',
      required: claimType === 'disability',
      isValid: !!(formData.documents && formData.documents.length > 0),
      value: formData.documents && formData.documents.length > 0 ? 
        `${formData.documents.length} document(s)` : 'None uploaded',
      icon: <FileText className="w-4 h-4" />,
      errorMessage: claimType === 'disability' ? 'Medical records are strongly recommended for disability claims' : undefined
    });

    // Healthcare Providers
    items.push({
      id: 'healthcare-providers',
      category: 'Medical History',
      field: 'Healthcare Providers',
      label: 'Current/Past Providers',
      required: claimType === 'disability',
      isValid: !!(formData.providers && formData.providers.length > 0),
      value: formData.providers && formData.providers.length > 0 ? 
        `${formData.providers.length} provider(s)` : 'None listed',
      icon: <Users className="w-4 h-4" />,
      errorMessage: claimType === 'disability' ? 'Healthcare providers help establish treatment history' : undefined
    });

    return items;
  };

  const checklistItems = validateFormData();
  const requiredItems = checklistItems.filter(item => item.required);
  const optionalItems = checklistItems.filter(item => !item.required);
  
  const requiredValid = requiredItems.filter(item => item.isValid).length;
  const requiredTotal = requiredItems.length;
  const completionPercentage = requiredTotal > 0 ? Math.round((requiredValid / requiredTotal) * 100) : 100;

  const getStatusIcon = (item: ChecklistItem) => {
    if (item.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (item.required) {
      return <XCircle className="w-4 h-4 text-red-600" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (item: ChecklistItem) => {
    if (item.isValid) return 'text-green-700 bg-green-50';
    if (item.required) return 'text-red-700 bg-red-50';
    return 'text-yellow-700 bg-yellow-50';
  };

  const groupedItems = checklistItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Airtable Validation Checklist
        </CardTitle>
        <CardDescription>
          Ensure all required information is complete for successful claim processing
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={completionPercentage === 100 ? "default" : "destructive"}>
            {requiredValid}/{requiredTotal} Required Fields Complete
          </Badge>
          <Badge variant="outline">
            {completionPercentage}% Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900 border-b pb-1">
              {category}
            </h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(item)}`}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusIcon(item)}
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {item.label}
                      </span>
                      {item.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Airtable Field: <code className="bg-gray-100 px-1 rounded">{item.field}</code>
                    </div>
                    {item.value && (
                      <div className="text-sm mt-1 font-mono bg-white/50 px-2 py-1 rounded">
                        {item.value}
                      </div>
                    )}
                    {!item.isValid && item.errorMessage && (
                      <div className="text-xs text-red-600 mt-1 font-medium">
                        ⚠️ {item.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {completionPercentage < 100 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Action Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Please complete the required fields above before submitting. Missing information may delay your claim processing.
                </p>
              </div>
            </div>
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Ready to Submit</h4>
                <p className="text-sm text-green-700 mt-1">
                  All required information is complete and ready for Airtable processing.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}