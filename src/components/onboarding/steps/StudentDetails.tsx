import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';

// Medical/Healthcare icon for intern
function InternIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  );
}

interface StudentDetailsProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

export function StudentDetails({ data, setData }: StudentDetailsProps) {
  const options = [
    {
      isIntern: false,
      label: 'Student',
      description: 'Currently pursuing my EMS education',
      icon: GraduationCap,
    },
    {
      isIntern: true,
      label: 'Intern',
      description: 'Doing my internship/clinical rotations',
      icon: InternIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">What stage are you at?</h1>
        <p className="text-muted-foreground mt-2">
          This helps us show you relevant content
        </p>
      </div>

      <div className="grid gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = data.isIntern === option.isIntern;

          return (
            <button
              key={option.label}
              onClick={() => setData(prev => ({ ...prev, isIntern: option.isIntern }))}
              className={cn(
                'flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className={cn(
                  'text-lg font-semibold',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {option.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}