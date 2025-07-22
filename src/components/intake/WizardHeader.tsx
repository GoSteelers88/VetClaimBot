import { Shield, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  completionPercentage: number;
}

const steps: Step[] = [
  { id: 1, title: 'Personal Info', description: 'Basic information' },
  { id: 2, title: 'Service History', description: 'Military background' },
  { id: 3, title: 'Deployments', description: 'Service locations' },
  { id: 4, title: 'Conditions', description: 'Health issues' },
  { id: 5, title: 'Providers', description: 'Healthcare providers' },
  { id: 6, title: 'Documents', description: 'Supporting files' },
  { id: 7, title: 'Review', description: 'Final review' },
];

export function WizardHeader({ currentStep, totalSteps, completedSteps, completionPercentage }: WizardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VA Claim Builder</h1>
              <p className="text-gray-600">Step-by-step guided claim preparation</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Overall Progress</div>
            <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Step Indicators */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            const isPast = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                    isCompleted || isPast
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isCurrent
                        ? "bg-blue-50 border-blue-600 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500"
                  )}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="mt-3 text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      (isCurrent || isCompleted || isPast) ? "text-gray-900" : "text-gray-500"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-4 mt-5 transition-colors",
                    (isPast || (isCompleted && step.id < currentStep))
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="md:hidden flex items-center justify-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center">
                {currentStep}
              </div>
              <div>
                <div className="text-sm font-medium text-blue-900">
                  {steps[currentStep - 1]?.title}
                </div>
                <div className="text-xs text-blue-600">
                  Step {currentStep} of {totalSteps}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}