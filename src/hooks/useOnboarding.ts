// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type SectorType = Database['public']['Enums']['sector_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

interface OnboardingProfileData {
  name: string;
  userType: UserType | null;
  sector: SectorType | null;
  qualification: QualificationType | null;
  salary: number | null;
  experienceStartDate: string | null;
}

export function useUpdateOnboardingProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (_data: OnboardingProfileData) => {
      // DEV BYPASS: do nothing, just resolve
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
