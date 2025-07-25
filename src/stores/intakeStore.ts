import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { IntakeFormData, ServiceIncident, HealthcareProvider, DocumentUpload } from '@/types';

interface IntakeState {
  formData: IntakeFormData;
  currentStep: number;
  completedSteps: Set<number>;
  stepValidation: Record<number, boolean>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateFormData: ((data: Partial<IntakeFormData>) => void) | (<K extends keyof IntakeFormData>(section: K, data: IntakeFormData[K]) => void);
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
  setStepValidation: (step: number, isValid: boolean) => void;
  getStepValidation: (step: number) => boolean;
  calculateCompletion: () => number;
  prePopulateFromVeteranProfile: (veteranProfile: any) => void;
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
    },
    healthcare: {
      hasPrivateInsurance: false,
      priorityGroup: 'Unknown'
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
  skipConditions: false,
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
      stepValidation: {},
      isLoading: false,
      error: null,

      updateFormData: (sectionOrData: any, data?: any) => {
        set((state) => {
          // If called with single argument, it's a partial update
          if (data === undefined) {
            return {
              formData: {
                ...state.formData,
                ...sectionOrData
              }
            };
          }
          // If called with two arguments, it's a section update
          return {
            formData: {
              ...state.formData,
              [sectionOrData]: data
            }
          };
        });
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
                exposureTypes: [],
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
        set((state) => {
          const newSet = new Set(state.completedSteps);
          newSet.add(step);
          return { completedSteps: newSet };
        });
      },

      setStepValidation: (step, isValid) => {
        set((state) => ({
          stepValidation: {
            ...state.stepValidation,
            [step]: isValid
          }
        }));
      },

      getStepValidation: (step) => {
        const { stepValidation } = get();
        return stepValidation[step] || false;
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
          stepValidation: {},
          error: null
        });
      },

      prePopulateFromVeteranProfile: (veteranProfile) => {
        set((state) => {
          if (!veteranProfile?.personalInfo) return state;
          
          const personalInfo = veteranProfile.personalInfo;
          
          return {
            formData: {
              ...state.formData,
              personalInfo: {
                firstName: personalInfo.firstName || '',
                middleName: personalInfo.middleName || '',
                lastName: personalInfo.lastName || '',
                suffix: personalInfo.suffix || '',
                email: personalInfo.email || '',
                ssn: personalInfo.ssn || '',
                dateOfBirth: personalInfo.dateOfBirth?.toDate ? 
                  personalInfo.dateOfBirth.toDate().toISOString().split('T')[0] : 
                  (personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString().split('T')[0] : ''),
                phoneNumber: personalInfo.phoneNumber || '',
                address: {
                  street: personalInfo.address?.street || '',
                  city: personalInfo.address?.city || '',
                  state: personalInfo.address?.state || '',
                  zipCode: personalInfo.address?.zipCode || '',
                  country: personalInfo.address?.country || 'USA'
                },
                healthcare: personalInfo.healthcare || {
                  hasPrivateInsurance: false,
                  priorityGroup: 'Unknown'
                }
              }
            },
            // Mark Step 1 as completed since we have the data from registration
            completedSteps: new Set([...state.completedSteps, 1]),
            stepValidation: {
              ...state.stepValidation,
              1: true
            }
          };
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
        completedSteps: Array.from(state.completedSteps),
        stepValidation: state.stepValidation
      }),
      merge: (persistedState: any, currentState: IntakeState) => ({
        ...currentState,
        ...persistedState,
        completedSteps: new Set(persistedState.completedSteps || []),
        stepValidation: persistedState.stepValidation || {}
      }),
    }
  )
);