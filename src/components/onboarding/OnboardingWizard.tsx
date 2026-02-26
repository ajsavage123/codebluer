import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateOnboardingProfile } from '@/hooks/useOnboarding';
import { toast } from '@/hooks/use-toast';
import { RoleSelection } from './steps/RoleSelection';
import { EmployeeDetails } from './steps/EmployeeDetails';
import { StudentDetails } from './steps/StudentDetails';
import { NameInput } from './steps/NameInput';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];
type SectorType = Database['public']['Enums']['sector_type'];

export interface OnboardingData {
  name: string;
  userType: UserType | null;
  isIntern: boolean;
  sector: SectorType | null;
  experienceYears: number;
  qualification: QualificationType | null;
  salary: number | null;
}

const STEP_LABELS = ['Your Name', 'Your Role', 'Details'];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfile = useUpdateOnboardingProfile();
  
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    userType: null,
    isIntern: false,
    sector: null,
    experienceYears: 0,
    qualification: null,
    salary: null,
  });

  const totalSteps = data.userType === 'employee' || data.userType === 'student' ? 3 : 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 0:
        return data.name.trim().length >= 2;
      case 1:
        return data.userType !== null;
      case 2:
        if (data.userType === 'employee') {
          return data.sector && data.qualification && data.salary !== null;
        }
        if (data.userType === 'student') {
          return true; // isIntern is already set
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const calculateExperienceStartDate = (years: number): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date.toISOString().split('T')[0];
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      // Determine final user type (handle intern case)
      let finalUserType = data.userType;
      if (data.userType === 'student' && data.isIntern) {
        finalUserType = 'intern';
      }

      await updateProfile.mutateAsync({
        name: data.name,
        userType: finalUserType,
        sector: data.userType === 'employee' ? data.sector : null,
        qualification: data.userType === 'employee' ? data.qualification : null,
        salary: data.userType === 'employee' ? data.salary : null,
        experienceStartDate: data.userType === 'employee' 
          ? calculateExperienceStartDate(data.experienceYears) 
          : null,
      });

      toast({ title: 'Welcome!', description: 'Your profile is all set up.' });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <NameInput data={data} setData={setData} />;
      case 1:
        return <RoleSelection data={data} setData={setData} />;
      case 2:
        if (data.userType === 'employee') {
          return <EmployeeDetails data={data} setData={setData} />;
        }
        if (data.userType === 'student') {
          return <StudentDetails data={data} setData={setData} />;
        }
        return null;
      default:
        return null;
    }
  };

  const isLastStep = step === totalSteps - 1;
  const showDetailsStep = data.userType === 'employee' || data.userType === 'student';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="p-4 border-b border-border">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-foreground">
              {STEP_LABELS[step] || 'Complete'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-border">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {isLastStep ? (
            <Button 
              onClick={handleComplete}
              disabled={!canProceed() || updateProfile.isPending}
              className="flex-1"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
