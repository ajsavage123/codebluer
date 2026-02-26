// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SalaryPost } from '@/types';
import { mockSalaryData } from '@/data/mockData';

let _salaryPosts: SalaryPost[] = [...mockSalaryData];

export function useSalaryData() {
  return useQuery({
    queryKey: ['salary-posts'],
    queryFn: async (): Promise<SalaryPost[]> => _salaryPosts,
  });
}

export function useSubmitSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (salary: Omit<SalaryPost, 'id' | 'createdAt'>): Promise<SalaryPost> => {
      const newPost: SalaryPost = {
        ...salary,
        id: `s-${Date.now()}`,
        createdAt: new Date(),
        currency: salary.currency || 'INR',
      };
      _salaryPosts = [newPost, ..._salaryPosts];
      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-posts'] });
    },
  });
}

// Alias for backward compat
export const useSubmitSalaryData = useSubmitSalary;
