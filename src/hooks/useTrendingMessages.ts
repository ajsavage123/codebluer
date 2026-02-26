// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery } from '@tanstack/react-query';
import type { Database } from '@/integrations/supabase/types';
import { mockMessages, systemRooms } from '@/data/mockData';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

export interface TrendingMessage {
  id: string;
  content: string;
  roomId: string;
  roomName: string;
  roomType: string;
  isAnonymous: boolean;
  isPinned: boolean;
  createdAt: Date;
  upvotes: number;
  score: number;
  user?: {
    id: string;
    name?: string;
    userType: UserType | null;
    qualification: QualificationType | null;
    experienceYears: number;
  };
}

const roomMap = systemRooms.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {} as Record<string, typeof systemRooms[0]>);

const mockTrending: TrendingMessage[] = mockMessages.map((m, i) => {
  const room = roomMap[m.roomId];
  return {
    id: m.id,
    content: m.content,
    roomId: m.roomId,
    roomName: room?.name ?? 'General',
    roomType: room?.type ?? 'general',
    isAnonymous: m.isAnonymous,
    isPinned: m.isPinned,
    createdAt: m.createdAt,
    upvotes: m.likes,
    // Score: upvotes*3 + replies*2 + pinned bonus - time decay
    score: Math.round(
      m.likes * 3 +
      m.replies * 2 +
      (m.isPinned ? 50 : 0)
    ),
    user: m.user
      ? {
        id: m.user.id,
        name: m.user.name ?? undefined,
        userType: 'emt' as UserType,
        qualification: 'emt_basic' as QualificationType,
        experienceYears: 3 + i,
      }
      : undefined,
  };
});

export function useTrendingMessages(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-messages', limit],
    queryFn: async (): Promise<TrendingMessage[]> =>
      [...mockTrending]
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          if (a.score !== b.score) return b.score - a.score;
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, limit),
    refetchInterval: 30000,
  });
}
