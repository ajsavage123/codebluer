// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Topic } from '@/types';

export type TopicSortOrder = 'newest' | 'oldest';

// In-memory topics store keyed by roomId
let _topics: Topic[] = [];

export function useTopics(roomId: string, sortOrder: TopicSortOrder = 'newest') {
  return useQuery({
    queryKey: ['topics', roomId, sortOrder],
    queryFn: async (): Promise<Topic[]> => {
      const roomTopics = _topics.filter(t => t.roomId === roomId);
      return roomTopics.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const diff = b.createdAt.getTime() - a.createdAt.getTime();
        return sortOrder === 'newest' ? diff : -diff;
      });
    },
    enabled: !!roomId,
  });
}

export function useTopic(topicId: string) {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async (): Promise<Topic | null> =>
      _topics.find(t => t.id === topicId) ?? null,
    enabled: !!topicId,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      title,
      content,
      isAnonymous = false,
    }: {
      roomId: string;
      title: string;
      content?: string;
      isAnonymous?: boolean;
    }) => {
      const now = new Date();
      const newTopic: Topic = {
        id: `topic-${Date.now()}`,
        roomId,
        title: title.trim(),
        content: content?.trim(),
        createdBy: isAnonymous ? undefined : 'dev-user-001',
        isAnonymous,
        isPinned: false,
        isLocked: false,
        replyCount: 0,
        createdAt: now,
        updatedAt: now,
        user: isAnonymous
          ? undefined
          : { id: 'dev-user-001', name: 'Dev User', role: 'user', createdAt: now },
      };
      _topics = [newTopic, ..._topics];
      return newTopic;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics', variables.roomId] });
    },
  });
}

export function useTopicMessages(topicId: string) {
  return useQuery({
    queryKey: ['topic-messages', topicId],
    queryFn: async () => [],
    enabled: !!topicId,
  });
}
