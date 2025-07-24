'use client';

import { useState, useEffect, useCallback } from 'react';

import { useRouter, useParams } from 'next/navigation';
import { WizardHeader } from '@/components/intake/WizardHeader';
import { WizardNavigation } from '@/components/intake/WizardNavigation';
import { Step1PersonalInfo } from '@/components/intake/Step1PersonalInfo';
import { Step2ServiceHistory } from '@/components/intake/Step2ServiceHistory';
import { Step3Deployments } from '@/components/intake/Step3Deployments';
import { Step4Conditions } from '@/components/intake/Step4Conditions';
import { Step5Providers } from '@/components/intake/Step5Providers';
import { Step6Documents } from '@/components/intake/Step6Documents';
import { Step7Review } from '@/components/intake/Step7Review';
import { useIntakeStore } from '@/stores/intakeStore';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const TOTAL_STEPS = 7;

export default function IntakeWizardPage() {
  const router = useRouter();
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [canGoNext, setCanGoNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, veteran, updateProfile } = useAuthStore();
  const {
    completedSteps,
    calculateCompletion,
    setCurrentStep: setStoreStep,
    markStepComplete,
    formData,
    stepValidation,
    setStepValidation,
    getStepValidation
  } = useIntakeStore();

  // Parse current step from URL and initialize validation state
  useEffect(() => {
    const stepFromUrl = params?.steps?.[0] ? parseInt(params.steps[0]) : 1;
    if (stepFromUrl >= 1 && stepFromUrl <= TOTAL_STEPS) {
      setCurrentStep(stepFromUrl);
      setStoreStep(stepFromUrl);
      
      // Initialize canGoNext based on stored validation for current step
      const storedValidation = getStepValidation(stepFromUrl);
      setCanGoNext(storedValidation);
      console.log('Loaded step', stepFromUrl, 'with stored validation:', storedValidation);
    }

    // Draft loading is handled by Zustand persistence
    // Remove problematic Firebase draft loading to prevent permission errors
  }, [params, setStoreStep, getStepValidation, user?.uid]);

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setIsLoading(true);
      
      // Mark current step as complete
      markStepComplete(currentStep);
      
      // Navigate to next step
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setStoreStep(nextStep);
      router.push(`/intake/${nextStep}`);
      
      setIsLoading(false);
    } else {
      // Submit the claim
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setStoreStep(prevStep);
      router.push(`/intake/${prevStep}`);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // For now, just rely on Zustand persistence
      // Avoid Firebase write operations that cause permission errors
      console.log('Draft saved to local storage via Zustand');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // Update the veteran profile directly
      const updatedProfile = {
        ...formData,
        uhid: veteran?.uhid || `VET-${Date.now()}`,
        profileComplete: true,
        completedAt: new Date(),
        updatedAt: new Date()
      };

      await updateProfile(updatedProfile);

      // Sync to Airtable
      const response = await fetch('/api/intake/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          ...updatedProfile
        }),
      });

      if (response.ok) {
        // Profile is now complete, redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('Failed to sync to Airtable');
        // Still redirect since the profile was updated
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationChange = useCallback((isValid: boolean) => {
    console.log('Validation changed for step', currentStep, '- isValid:', isValid);
    setCanGoNext(isValid);
    // Store the validation state for persistence
    setStepValidation(currentStep, isValid);
  }, [currentStep, setStepValidation]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        );
      case 2:
        return (
          <Step2ServiceHistory
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        );
      case 3:
        return (
          <Step3Deployments
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        );
      case 4:
        return (
          <Step4Conditions
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        );
      case 5:
        return (
          <Step5Providers
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        );
      case 6:
        return (
          <Step6Documents
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        );
      case 7:
        return (
          <Step7Review
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  const completionPercentage = calculateCompletion();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <WizardHeader
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          completedSteps={completedSteps}
          completionPercentage={completionPercentage}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
            {renderCurrentStep()}
            
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              canGoNext={canGoNext}
              isLoading={isLoading}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}