// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MessageVoteData {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: 'up' | 'down' | null;
}

// In-memory vote store
const _votesStore: Record<string, MessageVoteData> = {};

export function useMessageVotes(messageIds: string[]) {
  return useQuery({
    queryKey: ['message-votes', messageIds],
    queryFn: async () => {
      const votesMap: Record<string, MessageVoteData> = {};
      messageIds.forEach(id => {
        votesMap[id] = _votesStore[id] ?? { upvotes: 0, downvotes: 0, score: 0, userVote: null };
      });
      return votesMap;
    },
    enabled: messageIds.length > 0,
  });
}

export function useVoteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      voteType,
    }: {
      messageId: string;
      roomId: string;
      voteType: 'up' | 'down';
    }) => {
      const current = _votesStore[messageId] ?? { upvotes: 0, downvotes: 0, score: 0, userVote: null };

      if (current.userVote === voteType) {
        // Toggle off
        if (voteType === 'up') current.upvotes = Math.max(0, current.upvotes - 1);
        else current.downvotes = Math.max(0, current.downvotes - 1);
        current.userVote = null;
      } else {
        // Undo previous vote if any
        if (current.userVote === 'up') current.upvotes = Math.max(0, current.upvotes - 1);
        if (current.userVote === 'down') current.downvotes = Math.max(0, current.downvotes - 1);
        // Apply new vote
        if (voteType === 'up') current.upvotes++;
        else current.downvotes++;
        current.userVote = voteType;
      }

      current.score = current.upvotes - current.downvotes;
      _votesStore[messageId] = current;
      return { action: 'voted' };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['message-votes'] });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['trending-messages'] });
    },
  });
}
