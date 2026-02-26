// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery } from '@tanstack/react-query';
import { Tool } from '@/types';
import { tools as mockTools } from '@/data/mockData';

export function useTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: async (): Promise<Tool[]> => mockTools,
  });
}
