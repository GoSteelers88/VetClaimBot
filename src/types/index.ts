import { Timestamp } from 'firebase/firestore';

// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  profileComplete: boolean;
}

// Veteran Profile Types
export interface VeteranProfile {
  uid: string;
  uhid: string; // Unique Human ID
  status: 'active' | 'inactive' | 'review';
  riskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  profileComplete?: boolean;
  personalInfo?: PersonalInfo;
  militaryService?: MilitaryService;
  deployments?: Deployment[];
  dependents?: Dependent[];
  medicalHistory?: MedicalHistory;
  exposureAlerts?: ExposureAlert[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email?: string;
  ssn: string; // encrypted
  dateOfBirth: Timestamp;
  placeOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  phoneNumber: string;
  alternatePhone?: string;
  address: Address;
  healthcare?: HealthcareInfo;
}

export interface HealthcareInfo {
  hasPrivateInsurance: boolean;
  insuranceProvider?: string;
  preferredVAFacility?: string;
  priorityGroup?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'Unknown';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface MilitaryService {
  serviceNumber: string;
  branches: string[];
  entryDate: Timestamp;
  dischargeDate: Timestamp;
  dischargeType: 'honorable' | 'general' | 'other_than_honorable' | 'bad_conduct' | 'dishonorable';
  finalRank: string;
  militaryOccupationCodes: string[];
  serviceConnectedDisability: boolean;
  currentDisabilityRating: number;
  reserveNationalGuard: boolean;
}

export interface Deployment {
  id: string;
  location: string;
  country: string;
  startDate: Timestamp;
  endDate: Timestamp;
  unit: string;
  missionType: string;
  hazardousExposure: boolean;
  combatZone: boolean;
  exposureTypes?: string[];
}

export interface Dependent {
  id: string;
  relationship: 'spouse' | 'child' | 'parent';
  firstName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: Timestamp;
  disabled: boolean;
  student: boolean;
}

export interface MedicalHistory {
  currentConditions: string[];
  medications: string[];
  primaryCareProvider?: string;
  vaHealthcare: boolean;
  vaFacility?: string;
}

export interface ExposureAlert {
  id: string;
  conditionId: string;
  conditionName: string;
  exposureType: string;
  alertDate: Timestamp;
  acknowledged: boolean;
  claimSuggested: boolean;
  deploymentReference?: string;
}

// Claims Types
export interface Claim {
  id: string;
  veteranId: string;
  uhid: string;
  claimNumber?: string; // VA assigned
  claimType: ClaimType;
  status: ClaimStatus;
  priority: 'standard' | 'expedited';
  completionPercentage: number;
  riskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  
  // Claim Details
  conditionsClaimed: ClaimedCondition[];
  supportingDocuments: SupportingDocument[];
  treatmentHistory: TreatmentHistory[];
  
  // AI Assistance
  aiSuggestions: AISuggestion[];
  qualityChecks: QualityCheck;
  
  // Dates
  createdAt: Timestamp;
  lastModified: Timestamp;
  submissionDate?: Timestamp;
  decisionDate?: Timestamp;
  
  // External Integration
  airtableRecordId?: string;
  vaSubmitted: boolean;
  vaConfirmationNumber?: string;
}

export type ClaimType = 
  | 'disability' 
  | 'education' 
  | 'healthcare' 
  | 'home_loan' 
  | 'burial' 
  | 'pension';

export type ClaimStatus = 
  | 'draft' 
  | 'in_review' 
  | 'ready' 
  | 'submitted' 
  | 'processing' 
  | 'approved' 
  | 'denied';

export interface ClaimedCondition {
  id: string;
  conditionName?: string;
  name?: string;
  customName?: string;
  bodySystem?: string;
  dateFirstNoticed?: Timestamp;
  icd10Code?: string;
  onsetDate?: Timestamp;
  serviceConnection?: boolean;
  currentSeverity?: string;
  workImpact?: boolean;
  description?: string;
}

export interface SupportingDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: Timestamp;
  firebaseStoragePath: string;
  documentType: DocumentType;
  verified: boolean;
}

export type DocumentType = 
  | 'dd214' 
  | 'medical_record' 
  | 'buddy_statement' 
  | 'lay_statement' 
  | 'marriage_certificate' 
  | 'birth_certificate' 
  | 'other';

export interface TreatmentHistory {
  id: string;
  provider: string;
  treatmentDates: {
    start: Timestamp;
    end?: Timestamp;
  };
  treatmentType: string;
  diagnosis: string;
  facility: string;
}

export interface AISuggestion {
  id: string;
  type: 'fix_claim' | 'missing_docs' | 'strength_improvement';
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: Timestamp;
}

export interface QualityCheck {
  missingDocuments: string[];
  weakConnections: string[];
  strengthScore: number;
  completeness: number;
  lastChecked: Timestamp;
}

// Presumptive Conditions
export interface PresumptiveCondition {
  id: string;
  conditionName: string;
  exposureType: ExposureType;
  icd10Codes: string[];
  affectedLocations: string[];
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  description: string;
  eligibilityCriteria: string;
  vaRegulationReference: string;
  automaticServiceConnection: boolean;
  requiredEvidence: string[];
}

export type ExposureType = 
  | 'agent_orange' 
  | 'burn_pits' 
  | 'radiation' 
  | 'asbestos' 
  | 'pfas' 
  | 'gulf_war' 
  | 'chemical' 
  | 'depleted_uranium';

// Chat Types
export interface ChatSession {
  id: string;
  veteranId: string;
  sessionStart: Timestamp;
  sessionEnd?: Timestamp;
  messages: ChatMessage[];
  topicsDiscussed: string[];
  actionsCompleted: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  metadata?: {
    tokens?: number;
    model?: string;
    suggestions?: string[];
  };
}

// Form Types
export interface IntakeFormData {
  serviceHistory: Partial<MilitaryService>;
  personalInfo: Partial<PersonalInfo>;
  deployments: Partial<Deployment>[];
  conditions: Partial<ClaimedCondition>[];
  skipConditions?: boolean;
  incidents: ServiceIncident[];
  providers: HealthcareProvider[];
  documents: DocumentUpload[];
}

export interface ServiceIncident {
  id: string;
  date: Timestamp;
  location: string;
  description: string;
  eventType: 'combat' | 'training' | 'accident' | 'exposure';
  witnesses: string[];
  evidenceFiles: string[];
  severity: number; // 1-10
  serviceConnected: boolean;
}

export interface HealthcareProvider {
  id: string;
  name: string;
  type?: 'va' | 'private' | 'military';
  providerType?: string;
  specialty?: string;
  isVA?: boolean;
  relevantConditions?: string[];
  contactInfo?: {
    phone?: string;
    address?: Address;
  };
  treatmentPeriod?: {
    start: Timestamp;
    end?: Timestamp;
  };
}

export interface DocumentUpload {
  id: string;
  file?: File;
  name?: string;
  size?: number;
  type?: string;
  documentType: DocumentType;
  description?: string;
  uploadProgress?: number;
  uploaded: boolean;
  isRequired?: boolean;
  status?: 'pending' | 'uploading' | 'uploaded' | 'error';
  relatedConditions?: string[];
}

// UI Types
export interface FilterState {
  status: ClaimStatus | 'all';
  riskLevel: 'low' | 'medium' | 'high' | 'all';
  claimType: ClaimType | 'all';
  dateRange: 'all' | 'week' | 'month' | 'year';
}

export interface SortState {
  field: 'date' | 'status' | 'risk' | 'completion';
  direction: 'asc' | 'desc';
}