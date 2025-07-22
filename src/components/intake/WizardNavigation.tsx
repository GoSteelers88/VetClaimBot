import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  showSave?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  isLoading = false,
  onPrevious,
  onNext,
  onSave,
  showSave = true
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isLoading}
        className="flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      {/* Save Draft Button */}
      {showSave && !isLastStep && (
        <Button
          variant="ghost"
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      )}

      {/* Next/Submit Button */}
      <Button
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className="flex items-center bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isLastStep ? 'Submitting...' : 'Saving...'}
          </>
        ) : (
          <>
            {isLastStep ? 'Submit Claim' : 'Next Step'}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
          </>
        )}
      </Button>
    </div>
  );
}