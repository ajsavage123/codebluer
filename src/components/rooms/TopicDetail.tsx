import { useState } from 'react';
import { ArrowLeft, Pin, Lock, Heart, MessageCircle, Send, CheckCircle, ChevronDown, User } from 'lucide-react';
import { Topic, Room, Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useTopic } from '@/hooks/useTopics';
import { useSendMessage, useLikeMessage, useMessageLikes } from '@/hooks/useMessages';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopicDetailProps {
  topicId: string;
  room: Room;
  onBack: () => void;
}

type ReplySortOrder = 'oldest' | 'newest';

interface DbMessage {
  id: string;
  room_id: string;
  topic_id: string | null;
  user_id: string | null;
  content: string;
  is_anonymous: boolean;
  likes: number;
  replies: number;
  is_pinned: boolean;
  reply_to: string | null;
  created_at: string;
  updated_at: string;
}

interface DbProfile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
}

interface MessageWithProfile extends DbMessage {
  profiles: DbProfile | null;
}

const mapDbMessage = (msg: MessageWithProfile): Message => ({
  id: msg.id,
  roomId: msg.room_id,
  userId: msg.user_id || '',
  content: msg.content,
  isAnonymous: msg.is_anonymous,
  likes: msg.likes,
  replies: msg.replies,
  isPinned: msg.is_pinned,
  createdAt: new Date(msg.created_at),
  replyTo: msg.reply_to ?? undefined,
  user: msg.profiles ? {
    id: msg.profiles.user_id,
    name: msg.profiles.name ?? undefined,
    role: 'user' as const,
    avatar: msg.profiles.avatar_url ?? undefined,
    createdAt: new Date(),
  } : undefined,
});

export function TopicDetail({ topicId, room, onBack }: TopicDetailProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<ReplySortOrder>('oldest');
  const queryClient = useQueryClient();
  
  const { data: topic, isLoading: topicLoading } = useTopic(topicId);
  const sendMessage = useSendMessage();
  const likeMessage = useLikeMessage();

  // Fetch replies for this topic
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['topic-replies', topicId, sortOrder],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            user_id,
            name,
            avatar_url
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: sortOrder === 'oldest' });

      if (error) throw error;
      return (data as unknown as MessageWithProfile[]).map(mapDbMessage);
    },
    enabled: !!topicId,
  });

  const messageIds = replies.map(m => m.id);
  const { data: likesData = {} } = useMessageLikes(messageIds);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    
    if (!trimmed) {
      toast({
        title: 'Invalid message',
        description: 'Message cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    if (trimmed.length > 5000) {
      toast({
        title: 'Message too long',
        description: 'Messages must be less than 5000 characters',
        variant: 'destructive',
      });
      return;
    }

    if (topic?.isLocked) {
      toast({
        title: 'Topic locked',
        description: 'This topic is locked and cannot receive new replies',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMessage.mutateAsync({
        roomId: room.id,
        content: trimmed,
        isAnonymous: room.isAnonymous || false,
        topicId: topicId,
      });
      setNewMessage('');
      // Invalidate replies query
      queryClient.invalidateQueries({ queryKey: ['topic-replies', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics', room.id] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleLike = async (messageId: string) => {
    try {
      await likeMessage.mutateAsync({ messageId, roomId: room.id });
      queryClient.invalidateQueries({ queryKey: ['topic-replies', topicId] });
    } catch (error) {
      // Silent fail for likes
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortLabels: Record<ReplySortOrder, string> = {
    oldest: 'Oldest First',
    newest: 'Newest First',
  };

  if (topicLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Topic not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  const showAnonymous = topic.isAnonymous;

  return (
    <div className="flex flex-col h-[calc(100vh-0rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {topic.isPinned && <Pin className="w-4 h-4 text-accent flex-shrink-0" />}
            {topic.isLocked && <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            <h2 className="font-semibold text-foreground truncate">{topic.title}</h2>
          </div>
          <p className="text-xs text-muted-foreground">{room.name}</p>
        </div>
      </div>

      {/* Topic Content + Replies */}
      <div className="flex-1 overflow-y-auto">
        {/* Original Topic Post */}
        <div className="p-4 border-b border-border bg-card/50">
          <div className="flex items-start gap-3">
            <div className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
              showAnonymous 
                ? 'bg-muted text-muted-foreground' 
                : 'bg-primary/10 text-primary'
            )}>
              {showAnonymous ? '?' : (topic.user?.name?.[0] || <User className="w-4 h-4" />)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "font-semibold text-sm",
                  showAnonymous ? "text-muted-foreground" : "text-foreground"
                )}>
                  {showAnonymous ? 'Anonymous' : (topic.user?.name || 'User')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{topic.title}</h3>
              {topic.content && (
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {topic.content}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {topic.replyCount} {topic.replyCount === 1 ? 'Reply' : 'Replies'}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {sortLabels[sortOrder]}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                Newest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Replies */}
        <div className="p-4 space-y-4">
          {repliesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            replies.map((message) => (
              <ReplyBubble
                key={message.id}
                message={message}
                isAnonymousRoom={room.isAnonymous}
                onLike={() => handleLike(message.id)}
                likeCount={likesData[message.id]?.count ?? 0}
                userLiked={likesData[message.id]?.userLiked ?? false}
              />
            ))
          )}
        </div>
      </div>

      {/* Reply Input */}
      {!topic.isLocked ? (
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={5000}
                placeholder={room.isAnonymous ? "Reply anonymously..." : "Write a reply..."}
                className="w-full h-11 px-4 pr-12 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button 
              size="icon" 
              className="h-11 w-11 rounded-xl"
              disabled={!newMessage.trim() || sendMessage.isPending}
              onClick={handleSend}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          {room.isAnonymous && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Your identity is hidden in this room
            </p>
          )}
        </div>
      ) : (
        <div className="p-4 border-t border-border bg-muted/50 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span className="text-sm">This topic is locked</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ReplyBubbleProps {
  message: Message;
  isAnonymousRoom?: boolean;
  onLike: () => void;
  likeCount: number;
  userLiked: boolean;
}

function ReplyBubble({ message, isAnonymousRoom, onLike, likeCount, userLiked }: ReplyBubbleProps) {
  const user = message.user;
  const showAnonymous = isAnonymousRoom || message.isAnonymous;

  return (
    <div className="group animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold',
          showAnonymous 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-primary/10 text-primary'
        )}>
          {showAnonymous ? '?' : (user?.name?.[0] || 'U')}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {showAnonymous ? (
              <span className="font-medium text-muted-foreground text-sm">Anonymous</span>
            ) : (
              <>
                <span className="font-semibold text-foreground text-sm">{user?.name || 'User'}</span>
                {user?.role === 'verified' && (
                  <span className="verified-badge">
                    <CheckCircle className="w-2.5 h-2.5" />
                  </span>
                )}
              </>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-foreground text-sm leading-relaxed">{message.content}</p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={onLike}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                userLiked 
                  ? "text-destructive" 
                  : "text-muted-foreground hover:text-destructive"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", userLiked && "fill-current")} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
