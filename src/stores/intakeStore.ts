import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { IntakeFormData, ServiceIncident, HealthcareProvider, DocumentUpload } from '@/types';

interface IntakeState {
  formData: IntakeFormData;
  currentStep: number;
  completedSteps: Set<number>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateFormData: <K extends keyof IntakeFormData>(section: K, data: IntakeFormData[K]) => void;
  updatePersonalInfo: (data: Partial<IntakeFormData['personalInfo']>) => void;
  updateServiceHistory: (data: Partial<IntakeFormData['serviceHistory']>) => void;
  addDeployment: (deployment: Partial<IntakeFormData['deployments'][0]>) => void;
  updateDeployment: (index: number, deployment: Partial<IntakeFormData['deployments'][0]>) => void;
  removeDeployment: (index: number) => void;
  addCondition: (condition: Partial<IntakeFormData['conditions'][0]>) => void;
  updateCondition: (index: number, condition: Partial<IntakeFormData['conditions'][0]>) => void;
  removeCondition: (index: number) => void;
  addIncident: (incident: ServiceIncident) => void;
  updateIncident: (index: number, incident: ServiceIncident) => void;
  removeIncident: (index: number) => void;
  addProvider: (provider: HealthcareProvider) => void;
  updateProvider: (index: number, provider: HealthcareProvider) => void;
  removeProvider: (index: number) => void;
  addDocument: (document: DocumentUpload) => void;
  updateDocument: (index: number, document: DocumentUpload) => void;
  removeDocument: (index: number) => void;
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  calculateCompletion: () => number;
  reset: () => void;
  clearError: () => void;
}

const initialFormData: IntakeFormData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    ssn: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  },
  serviceHistory: {
    branches: [],
    entryDate: '',
    dischargeDate: '',
    dischargeType: 'honorable',
    finalRank: '',
    serviceNumber: '',
    militaryOccupationCodes: [],
    serviceConnectedDisability: false,
    currentDisabilityRating: 0,
    reserveNationalGuard: false
  },
  deployments: [],
  conditions: [],
  incidents: [],
  providers: [],
  documents: []
};

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      currentStep: 1,
      completedSteps: new Set(),
      isLoading: false,
      error: null,

      updateFormData: (section, data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            [section]: data
          }
        }));
      },

      updatePersonalInfo: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            personalInfo: {
              ...state.formData.personalInfo,
              ...data
            }
          }
        }));
      },

      updateServiceHistory: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            serviceHistory: {
              ...state.formData.serviceHistory,
              ...data
            }
          }
        }));
      },

      addDeployment: (deployment) => {
        set((state) => ({
          formData: {
            ...state.formData,
            deployments: [
              ...state.formData.deployments,
              { 
                id: Date.now().toString(),
                location: '',
                country: '',
                startDate: new Date(),
                endDate: new Date(),
                unit: '',
                missionType: '',
                hazardousExposure: false,
                combatZone: false,
                ...deployment
              }
            ]
          }
        }));
      },

      updateDeployment: (index, deployment) => {
        set((state) => ({
          formData: {
            ...state.formData,
            deployments: state.formData.deployments.map((item, i) => 
              i === index ? { ...item, ...deployment } : item
            )
          }
        }));
      },

      removeDeployment: (index) => {
        set((state) => ({
          formData: {
            ...state.formData,
            deployments: state.formData.deployments.filter((_, i) => i !== index)
          }
        }));
      },

      addCondition: (condition) => {
        set((state) => ({
          formData: {
            ...state.formData,
            conditions: [
              ...state.formData.conditions,
              {
                id: Date.now().toString(),
                name: '',
                bodySystem: '',
                dateFirstNoticed: new Date(),
                currentSeverity: 'moderate',
                symptoms: [],
                serviceConnection: '',
                treatmentHistory: '',
                workRelated: false,
                isPresumed: false,
                deploymentRelated: false,
                customName: '',
                ...condition
              }
            ]
          }
        }));
      },

      updateCondition: (index, condition) => {
        set((state) => ({
          formData: {
            ...state.formData,
            conditions: state.formData.conditions.map((item, i) => 
              i === index ? { ...item, ...condition } : item
            )
          }
        }));
      },

      removeCondition: (index) => {
        set((state) => ({
          formData: {
            ...state.formData,
            conditions: state.formData.conditions.filter((_, i) => i !== index)
          }
        }));
      },

      addIncident: (incident) => {
        set((state) => ({
          formData: {
            ...state.formData,
            incidents: [...state.formData.incidents, incident]
          }
        }));
      },

      updateIncident: (index, incident) => {
        set((state) => ({
          formData: {
            ...state.formData,
            incidents: state.formData.incidents.map((item, i) => 
              i === index ? incident : item
            )
          }
        }));
      },

      removeIncident: (index) => {
        set((state) => ({
          formData: {
            ...state.formData,
            incidents: state.formData.incidents.filter((_, i) => i !== index)
          }
        }));
      },

      addProvider: (provider) => {
        set((state) => ({
          formData: {
            ...state.formData,
            providers: [
              ...state.formData.providers, 
              {
                id: Date.now().toString(),
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
                vaFacility: '',
                ...provider
              }
            ]
          }
        }));
      },

      updateProvider: (index, provider) => {
        set((state) => ({
          formData: {
            ...state.formData,
            providers: state.formData.providers.map((item, i) => 
              i === index ? provider : item
            )
          }
        }));
      },

      removeProvider: (index) => {
        set((state) => ({
          formData: {
            ...state.formData,
            providers: state.formData.providers.filter((_, i) => i !== index)
          }
        }));
      },

      addDocument: (document) => {
        set((state) => ({
          formData: {
            ...state.formData,
            documents: [...state.formData.documents, document]
          }
        }));
      },

      updateDocument: (index, document) => {
        set((state) => ({
          formData: {
            ...state.formData,
            documents: state.formData.documents.map((item, i) => 
              i === index ? document : item
            )
          }
        }));
      },

      removeDocument: (index) => {
        set((state) => ({
          formData: {
            ...state.formData,
            documents: state.formData.documents.filter((_, i) => i !== index)
          }
        }));
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      markStepComplete: (step) => {
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step])
        }));
      },

      calculateCompletion: () => {
        const { formData } = get();
        let completed = 0;
        let total = 0;

        // Personal info (20 points)
        total += 20;
        if (formData.personalInfo?.firstName && formData.personalInfo?.lastName && formData.personalInfo?.email) {
          completed += 20;
        }

        // Service history (20 points)
        total += 20;
        if (formData.serviceHistory?.branches?.length > 0 && formData.serviceHistory?.entryDate) {
          completed += 20;
        }

        // Deployments (15 points)
        total += 15;
        if (formData.deployments?.length > 0) {
          completed += 15;
        }

        // Conditions (20 points)
        total += 20;
        if (formData.conditions?.length > 0) {
          completed += 20;
        }

        // Providers (15 points)  
        total += 15;
        if (formData.providers?.length > 0) {
          completed += 15;
        }

        // Documents (10 points)
        total += 10;
        if (formData.documents?.length > 0) {
          completed += 10;
        }

        return Math.round((completed / total) * 100);
      },

      reset: () => {
        set({
          formData: initialFormData,
          currentStep: 1,
          completedSteps: new Set(),
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'intake-storage',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps)
      }),
    }
  )
);