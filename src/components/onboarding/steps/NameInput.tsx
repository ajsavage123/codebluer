import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';

interface NameInputProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

export function NameInput({ data, setData }: NameInputProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <User className="w-10 h-10 text-primary" />
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-foreground">What's your name?</h1>
        <p className="text-muted-foreground mt-2">
          This will be displayed on your profile
        </p>
      </div>

      <div className="text-left">
        <Label htmlFor="name" className="sr-only">Your name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={data.name}
          onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
          className="text-center text-lg h-12"
          maxLength={50}
          autoFocus
        />
      </div>
    </div>
  );
}
