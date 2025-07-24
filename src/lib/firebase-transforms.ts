import { 
  PersonalInfo, 
  MilitaryService, 
  Deployment, 
  ClaimedCondition, 
  HealthcareProvider, 
  SupportingDocument,
  TreatmentHistory,
  DocumentType,
  IntakeFormData,
  VeteranProfile,
  Claim
} from '@/types';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

/**
 * Transform intake form data to Firebase-compatible structures
 */

// Personal Info - Already compatible, just ensure proper types
export const transformPersonalInfoForFirebase = (formData: any): PersonalInfo => {
  return {
    firstName: formData.firstName || '',
    middleName: formData.middleName || '',
    lastName: formData.lastName || '',
    suffix: formData.suffix || '',
    email: formData.email || '',
    ssn: formData.ssn || '', // Will be encrypted by backend
    dateOfBirth: formData.dateOfBirth ? Timestamp.fromDate(new Date(formData.dateOfBirth)) : Timestamp.now(),
    placeOfBirth: formData.placeOfBirth || '',
    gender: formData.gender || undefined,
    maritalStatus: formData.maritalStatus || undefined,
    phoneNumber: formData.phoneNumber || '',
    alternatePhone: formData.alternatePhone || '',
    address: {
      street: formData.address?.street || '',
      city: formData.address?.city || '',
      state: formData.address?.state || '',
      zipCode: formData.address?.zipCode || '',
      country: formData.address?.country || 'USA'
    },
    healthcare: formData.healthcare ? {
      hasPrivateInsurance: Boolean(formData.healthcare.hasPrivateInsurance),
      insuranceProvider: formData.healthcare.insuranceProvider || undefined,
      preferredVAFacility: formData.healthcare.preferredVAFacility || undefined,
      priorityGroup: formData.healthcare.priorityGroup || 'Unknown'
    } : undefined
  };
};

// Service History - Already compatible, just ensure proper types
export const transformServiceHistoryForFirebase = (formData: any): MilitaryService => {
  return {
    serviceNumber: formData.serviceNumber || '',
    branches: Array.isArray(formData.branches) ? formData.branches : [],
    entryDate: formData.entryDate ? Timestamp.fromDate(new Date(formData.entryDate)) : Timestamp.now(),
    dischargeDate: formData.dischargeDate ? Timestamp.fromDate(new Date(formData.dischargeDate)) : Timestamp.now(),
    dischargeType: formData.dischargeType || 'honorable',
    finalRank: formData.finalRank || '',
    militaryOccupationCodes: Array.isArray(formData.militaryOccupationCodes) 
      ? formData.militaryOccupationCodes.filter(code => code && code.trim())
      : [],
    serviceConnectedDisability: Boolean(formData.serviceConnectedDisability),
    currentDisabilityRating: Number(formData.currentDisabilityRating) || 0,
    reserveNationalGuard: Boolean(formData.reserveNationalGuard)
  };
};

// Deployments - Already compatible, just ensure proper types
export const transformDeploymentsForFirebase = (formData: any[]): Deployment[] => {
  if (!Array.isArray(formData)) return [];
  
  return formData.map((deployment, index) => ({
    id: deployment.id || `deployment_${index}_${Date.now()}`,
    location: deployment.location || '',
    country: deployment.country || '',
    startDate: deployment.startDate ? Timestamp.fromDate(new Date(deployment.startDate)) : Timestamp.now(),
    endDate: deployment.endDate ? Timestamp.fromDate(new Date(deployment.endDate)) : Timestamp.now(),
    unit: deployment.unit || '',
    missionType: deployment.missionType || '',
    hazardousExposure: Boolean(deployment.hazardousExposure || (deployment.exposureTypes && deployment.exposureTypes.length > 0)),
    combatZone: Boolean(deployment.combatZone),
    exposureTypes: Array.isArray(deployment.exposureTypes) ? deployment.exposureTypes : []
  }));
};

// Conditions - Major transformation needed
export const transformConditionsForFirebase = (formData: any[]): ClaimedCondition[] => {
  if (!Array.isArray(formData)) return [];
  
  return formData.map((condition, index) => ({
    id: condition.id || `condition_${index}_${Date.now()}`,
    conditionName: condition.name || undefined,
    name: condition.name || undefined, // Support both fields for compatibility
    customName: condition.customName || undefined,
    bodySystem: condition.bodySystem || undefined,
    dateFirstNoticed: condition.dateFirstNoticed ? Timestamp.fromDate(new Date(condition.dateFirstNoticed)) : undefined,
    onsetDate: condition.dateFirstNoticed ? Timestamp.fromDate(new Date(condition.dateFirstNoticed)) : undefined,
    icd10Code: condition.icd10Code || undefined,
    serviceConnection: typeof condition.serviceConnection === 'string' 
      ? condition.serviceConnection.toLowerCase().includes('yes') || condition.serviceConnection.length > 0
      : Boolean(condition.serviceConnection),
    currentSeverity: mapSeverityToStandard(condition.currentSeverity),
    workImpact: Boolean(condition.workRelated),
    description: buildConditionDescription(condition)
  }));
};

// Helper function to map severity levels
const mapSeverityToStandard = (severity: string): string => {
  const severityMap: Record<string, string> = {
    'mild': 'mild',
    'moderate': 'moderate', 
    'severe': 'severe',
    'very-severe': 'severe', // Map very-severe to severe for standardization
    'very severe': 'severe'
  };
  return severityMap[severity?.toLowerCase()] || 'moderate';
};

// Helper function to build condition description
const buildConditionDescription = (condition: any): string => {
  const parts: string[] = [];
  
  if (condition.serviceConnection && typeof condition.serviceConnection === 'string') {
    parts.push(`Service Connection: ${condition.serviceConnection}`);
  }
  
  if (condition.symptoms && Array.isArray(condition.symptoms) && condition.symptoms.length > 0) {
    parts.push(`Symptoms: ${condition.symptoms.join(', ')}`);
  }
  
  if (condition.treatmentHistory && typeof condition.treatmentHistory === 'string') {
    parts.push(`Treatment History: ${condition.treatmentHistory}`);
  }
  
  return parts.join('\n');
};

// Providers - Major restructuring needed
export const transformProvidersForFirebase = (formData: any[]): HealthcareProvider[] => {
  if (!Array.isArray(formData)) return [];
  
  return formData.map((provider, index) => ({
    id: provider.id || `provider_${index}_${Date.now()}`,
    name: provider.name || '',
    type: provider.isVA ? 'va' : 'private',
    providerType: provider.providerType || provider.specialty || '',
    specialty: provider.specialty || '',
    isVA: Boolean(provider.isVA),
    relevantConditions: Array.isArray(provider.relevantConditions) ? provider.relevantConditions : [],
    contactInfo: {
      phone: provider.phone || '',
      address: provider.address ? {
        street: provider.address.street || '',
        city: provider.address.city || '',
        state: provider.address.state || '',
        zipCode: provider.address.zipCode || '',
        country: provider.address.country || 'USA'
      } : undefined
    },
    treatmentPeriod: {
      start: provider.treatmentDates?.startDate ? Timestamp.fromDate(new Date(provider.treatmentDates.startDate)) : Timestamp.now(),
      end: provider.treatmentDates?.endDate && !provider.treatmentDates?.isOngoing 
        ? Timestamp.fromDate(new Date(provider.treatmentDates.endDate)) 
        : undefined
    }
  }));
};

// Documents - Transform for Firebase Storage integration
export const transformDocumentsForFirebase = (formData: any[]): SupportingDocument[] => {
  if (!Array.isArray(formData)) return [];
  
  return formData.map((doc, index) => ({
    id: doc.id || `document_${index}_${Date.now()}`,
    fileName: doc.name || doc.fileName || '',
    fileType: doc.type || doc.fileType || 'application/pdf',
    uploadDate: Timestamp.now(),
    firebaseStoragePath: doc.firebaseStoragePath || `documents/${doc.id || Date.now()}/${doc.name}`,
    documentType: mapDocumentType(doc.type || doc.documentType),
    verified: Boolean(doc.verified || doc.uploaded)
  }));
};

// Helper function to map document types
const mapDocumentType = (type: string): DocumentType => {
  const typeMap: Record<string, DocumentType> = {
    'Military Records (DD-214)': 'dd214',
    'Service Medical Records': 'medical_record',
    'Private Medical Records': 'medical_record',
    'Medical Test Results': 'medical_record',
    'Doctor\'s Statement': 'lay_statement',
    'VA Exam Results (C&P)': 'medical_record',
    'Buddy Statements': 'buddy_statement',
    'Employment Records': 'other',
    'Social Security Records': 'other',
    'Photographs (injuries/scars)': 'other',
    'Marriage Certificate': 'marriage_certificate',
    'Divorce Decree': 'other',
    'Birth Certificate': 'birth_certificate',
    'Death Certificate': 'other',
    'Other Supporting Evidence': 'other'
  };
  return typeMap[type] || 'other';
};

// Create treatment history records from provider and condition data
export const createTreatmentHistoryRecords = (
  providers: HealthcareProvider[], 
  conditions: ClaimedCondition[]
): TreatmentHistory[] => {
  const treatmentRecords: TreatmentHistory[] = [];
  
  providers.forEach(provider => {
    if (provider.relevantConditions && provider.relevantConditions.length > 0) {
      provider.relevantConditions.forEach(conditionId => {
        const condition = conditions.find(c => c.id === conditionId);
        if (condition) {
          treatmentRecords.push({
            id: `treatment_${provider.id}_${conditionId}_${Date.now()}`,
            provider: provider.name,
            treatmentDates: {
              start: provider.treatmentPeriod?.start || Timestamp.now(),
              end: provider.treatmentPeriod?.end
            },
            treatmentType: provider.specialty || 'General Treatment',
            diagnosis: condition.conditionName || condition.name || 'Unknown',
            facility: provider.isVA 
              ? `VA Medical Center` 
              : provider.contactInfo?.address?.city || 'Private Practice'
          });
        }
      });
    }
  });
  
  return treatmentRecords;
};

// Main transformation function for complete intake data
export const transformIntakeDataForFirebase = (formData: IntakeFormData) => {
  const personalInfo = transformPersonalInfoForFirebase(formData.personalInfo);
  const militaryService = transformServiceHistoryForFirebase(formData.serviceHistory);
  const deployments = transformDeploymentsForFirebase(formData.deployments);
  const conditions = transformConditionsForFirebase(formData.conditions);
  const providers = transformProvidersForFirebase(formData.providers);
  const documents = transformDocumentsForFirebase(formData.documents);
  const treatmentHistory = createTreatmentHistoryRecords(providers, conditions);
  
  return {
    personalInfo,
    militaryService,
    deployments,
    conditions,
    providers,
    documents,
    treatmentHistory,
    skipConditions: Boolean(formData.skipConditions)
  };
};

// Create a complete veteran profile for Firebase
export const createVeteranProfileForFirebase = (
  userId: string, 
  transformedData: ReturnType<typeof transformIntakeDataForFirebase>
): Partial<VeteranProfile> => {
  return {
    uid: userId,
    uhid: `VET-${Date.now()}`, // This should be generated by backend
    status: 'active',
    riskScore: 0,
    riskCategory: 'low',
    profileComplete: true,
    personalInfo: transformedData.personalInfo,
    militaryService: transformedData.militaryService,
    deployments: transformedData.deployments,
    dependents: [], // Not collected in current intake
    medicalHistory: {
      currentConditions: transformedData.conditions.map(c => c.conditionName || c.name || '').filter(Boolean),
      medications: [], // Not collected in current intake
      vaHealthcare: transformedData.militaryService.serviceConnectedDisability,
      vaFacility: transformedData.providers.find(p => p.isVA)?.name
    },
    exposureAlerts: [], // Will be generated by backend based on deployments
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

// Create a claim record for Firebase
export const createClaimForFirebase = (
  veteranId: string,
  veteranProfile: VeteranProfile,
  transformedData: ReturnType<typeof transformIntakeDataForFirebase>
): Partial<Claim> => {
  const hasConditions = transformedData.conditions.length > 0;
  
  return {
    id: `claim_${veteranId}_${Date.now()}`,
    veteranId,
    uhid: veteranProfile.uhid,
    claimType: hasConditions ? 'disability' : 'healthcare',
    status: transformedData.skipConditions ? 'ready' : 'draft',
    priority: 'standard',
    completionPercentage: calculateCompletionPercentage(transformedData),
    riskScore: calculateRiskScore(transformedData),
    riskCategory: 'low', // Will be calculated by backend
    conditionsClaimed: transformedData.conditions,
    supportingDocuments: transformedData.documents,
    treatmentHistory: transformedData.treatmentHistory,
    aiSuggestions: [],
    qualityChecks: {
      missingDocuments: [],
      weakConnections: [],
      strengthScore: calculateStrengthScore(transformedData),
      completeness: calculateCompletionPercentage(transformedData),
      lastChecked: Timestamp.now()
    },
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp(),
    vaSubmitted: false
  };
};

// Helper functions for calculations
const calculateCompletionPercentage = (data: ReturnType<typeof transformIntakeDataForFirebase>): number => {
  let completed = 0;
  let total = 7;
  
  // Step 1: Personal Info (required)
  if (data.personalInfo.firstName && data.personalInfo.lastName && data.personalInfo.email) {
    completed++;
  }
  
  // Step 2: Service History (required)
  if (data.militaryService.serviceNumber && data.militaryService.branches.length > 0) {
    completed++;
  }
  
  // Step 3: Deployments (optional)
  completed++; // Always count as complete
  
  // Step 4: Conditions (required unless skipped)
  if (data.skipConditions || data.conditions.length > 0) {
    completed++;
  }
  
  // Step 5: Providers (optional)
  completed++; // Always count as complete
  
  // Step 6: Documents (optional)
  completed++; // Always count as complete
  
  // Step 7: Review (completed if we're here)
  completed++;
  
  return Math.round((completed / total) * 100);
};

const calculateRiskScore = (data: ReturnType<typeof transformIntakeDataForFirebase>): number => {
  let riskScore = 0;
  
  // Increase risk for missing documents
  if (data.documents.length === 0) riskScore += 20;
  
  // Increase risk for no providers
  if (data.providers.length === 0) riskScore += 15;
  
  // Increase risk for complex conditions
  if (data.conditions.length > 3) riskScore += 10;
  
  // Increase risk for deployment-related claims
  const hasDeployments = data.deployments.length > 0;
  const hasHazardousExposure = data.deployments.some(d => d.hazardousExposure);
  if (hasDeployments && hasHazardousExposure) riskScore += 15;
  
  return Math.min(riskScore, 100); // Cap at 100
};

// C&P Exam calculation logic
export const needsCPExam = (conditions: ClaimedCondition[]): boolean => {
  const cpExamConditions = [
    'ptsd', 'post-traumatic stress disorder', 'post traumatic stress disorder',
    'tbi', 'traumatic brain injury', 'brain injury',
    'hearing loss', 'hearing impairment', 'deafness',
    'tinnitus', 'ringing in ears',
    'sleep apnea', 'obstructive sleep apnea',
    'depression', 'anxiety', 'bipolar',
    'back injury', 'spine injury', 'spinal injury',
    'knee injury', 'shoulder injury',
    'migraine', 'headaches',
    'respiratory', 'lung', 'asthma',
    'heart', 'cardiac', 'cardiovascular'
  ];
  
  return conditions.some(condition => {
    const conditionName = (condition.conditionName || condition.name || '').toLowerCase();
    return cpExamConditions.some(examCondition => 
      conditionName.includes(examCondition)
    );
  });
};

// Priority group-based copay calculation
export const requiresCopay = (priorityGroup?: string): boolean => {
  if (!priorityGroup || priorityGroup === 'Unknown') return false;
  
  // Groups 1-6 generally don't pay copays, Groups 7-8 do
  const group = parseInt(priorityGroup);
  return group >= 7;
};

const calculateStrengthScore = (data: ReturnType<typeof transformIntakeDataForFirebase>): number => {
  let strengthScore = 100;
  
  // Reduce for missing elements
  if (data.documents.length === 0) strengthScore -= 25;
  if (data.providers.length === 0) strengthScore -= 20;
  if (data.treatmentHistory.length === 0) strengthScore -= 15;
  
  // Increase for strong evidence
  const hasMedicalRecords = data.documents.some(d => d.documentType === 'medical_record');
  if (hasMedicalRecords) strengthScore += 10;
  
  const hasDD214 = data.documents.some(d => d.documentType === 'dd214');
  if (hasDD214) strengthScore += 10;
  
  return Math.max(0, Math.min(100, strengthScore)); // Keep between 0-100
};