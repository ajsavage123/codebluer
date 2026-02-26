// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];
type SectorType = Database['public']['Enums']['sector_type'];

interface Profile {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  userType: UserType | null;
  qualification: QualificationType | null;
  sector: SectorType | null;
  salary: number | null;
  experienceStartDate: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MOCK_PROFILE: Profile = {
  id: 'dev-profile-001',
  userId: 'dev-user-001',
  name: 'Dev User',
  avatarUrl: null,
  userType: 'emt' as UserType,
  qualification: 'emt_basic' as QualificationType,
  sector: 'private' as SectorType,
  salary: 45000,
  experienceStartDate: '2021-01-01',
  onboardingCompleted: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
};

export function getExperienceYears(startDate: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => MOCK_PROFILE,
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, avatarUrl }: { name?: string; avatarUrl?: string }) => {
      if (name) MOCK_PROFILE.name = name;
      if (avatarUrl) MOCK_PROFILE.avatarUrl = avatarUrl;
      return { ...MOCK_PROFILE };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

export function useUserRoles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => ['moderator'],
    enabled: !!user,
  });
}
