// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from '@/types';
import { mockMessages } from '@/data/mockData';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

export interface MessageUser {
  id: string;
  name?: string;
  avatar?: string;
  gender?: 'male' | 'female';
  userType: UserType | null;
  qualification: QualificationType | null;
  experienceYears: number;
}

export interface EnrichedMessage extends Omit<Message, 'user'> {
  user?: MessageUser;
}

// In-memory store of all messages (pre-seeded with mock data)
const USER_PROFESSIONS: Record<string, { type: string, qual: string }> = {
  'user-1': { type: 'paramedic', qual: 'advance_paramedic' },
  'user-2': { type: 'paramedic', qual: 'paramedic' },
  'user-3': { type: 'emt', qual: 'emt' },
  'user-4': { type: 'hr', qual: 'hr' },
  'user-5': { type: 'emt', qual: 'advance_emt' },
  'user-6': { type: 'instructor', qual: 'instructor' },
  'user-7': { type: 'emr', qual: 'emr' },
  'user-8': { type: 'emt', qual: 'emt' },
};

let _allMessages: EnrichedMessage[] = mockMessages.map(m => {
  const prof = USER_PROFESSIONS[m.userId] || { type: 'emt', qual: 'emt' };
  return {
    ...m,
    user: m.user
      ? {
        id: m.user.id,
        name: m.user.name ?? undefined,
        avatar: m.user.avatar,
        gender: m.user.gender,
        userType: prof.type as any,
        qualification: prof.qual as any,
        experienceYears: 3,
      }
      : undefined,
  };
});

export function useMessages(roomId: string) {
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: async (): Promise<EnrichedMessage[]> =>
      _allMessages.filter(m => m.roomId === roomId),
    enabled: !!roomId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      content,
      isAnonymous = false,
      replyTo,
    }: {
      roomId: string;
      content: string;
      isAnonymous?: boolean;
      topicId?: string;
      replyTo?: string;
    }) => {
      const newMsg: EnrichedMessage = {
        id: `msg-${Date.now()}`,
        roomId,
        userId: 'user-1',
        content,
        isAnonymous,
        likes: 0,
        replies: 0,
        isPinned: false,
        createdAt: new Date(),
        replyTo,
        user: {
          id: 'user-1',
          name: 'Alex Rivera',
          userType: 'paramedic' as any,
          qualification: 'advance_paramedic' as any,
          experienceYears: 5,
        },
      };
      _allMessages = [..._allMessages, newMsg];
      return newMsg;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useLikeMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      _allMessages = _allMessages.map(m =>
        m.id === messageId ? { ...m, likes: m.likes + 1 } : m
      );
      return { action: 'liked' };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['message-likes'] });
    },
  });
}

export function useMessageLikes(messageIds: string[]) {
  return useQuery({
    queryKey: ['message-likes', messageIds],
    queryFn: async () => {
      const likesMap: Record<string, { count: number; userLiked: boolean }> = {};
      messageIds.forEach(id => {
        const msg = _allMessages.find(m => m.id === id);
        likesMap[id] = { count: msg?.likes ?? 0, userLiked: false };
      });
      return likesMap;
    },
    enabled: messageIds.length > 0,
  });
}
