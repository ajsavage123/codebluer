import { useState } from 'react';
import { ArrowLeft, Pin, Heart, MessageCircle, MoreVertical, Send, Lock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useMessages, useSendMessage, useLikeMessage, useMessageLikes, EnrichedMessage } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { formatBadgeWithExperience } from '@/components/profile/UserBadge';

interface RoomChatProps {
  room: Room;
  onBack: () => void;
}

export function RoomChat({ room, onBack }: RoomChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<EnrichedMessage | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(room.id);
  const sendMessage = useSendMessage();
  const likeMessage = useLikeMessage();
  
  // Get message IDs for likes query
  const messageIds = messages.map(m => m.id);
  const { data: likesData = {} } = useMessageLikes(messageIds);

  // Organize messages into threads (parent messages and their replies)
  const parentMessages = messages.filter(m => !m.replyTo);
  const repliesByParent = messages.reduce((acc, m) => {
    if (m.replyTo) {
      if (!acc[m.replyTo]) acc[m.replyTo] = [];
      acc[m.replyTo].push(m);
    }
    return acc;
  }, {} as Record<string, EnrichedMessage[]>);

  const toggleThread = (messageId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

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

    try {
      await sendMessage.mutateAsync({
        roomId: room.id,
        content: trimmed,
        isAnonymous: room.isAnonymous || false,
        replyTo: replyingTo?.id,
      });
      setNewMessage('');
      setReplyingTo(null);
      
      // Auto-expand the thread if we just replied
      if (replyingTo) {
        setExpandedThreads(prev => new Set(prev).add(replyingTo.id));
      }
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

  const handleReply = (message: EnrichedMessage) => {
    setReplyingTo(message);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0rem)]">
      {/* Room Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground truncate">{room.name}</h2>
            {room.isAnonymous && (
              <span className="anonymous-badge">
                <Lock className="w-3 h-3" />
                Anonymous
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{room.memberCount.toLocaleString()} members</p>
        </div>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-16 w-2/3 ml-auto" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
              `room-badge-${room.type}`
            )}>
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Start the conversation</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Be the first to share something in {room.name}
            </p>
          </div>
        ) : (
          parentMessages.map((message) => {
            const replies = repliesByParent[message.id] || [];
            const replyCount = replies.length;
            const isExpanded = expandedThreads.has(message.id);
            
            return (
              <div key={message.id} className="space-y-2">
                <MessageBubble 
                  message={message} 
                  isAnonymousRoom={room.isAnonymous}
                  onLike={() => handleLike(message.id)}
                  onReply={() => handleReply(message)}
                  likeCount={likesData[message.id]?.count ?? 0}
                  userLiked={likesData[message.id]?.userLiked ?? false}
                  replyCount={replyCount}
                />
                
                {/* Thread Replies */}
                {replyCount > 0 && (
                  <div className="ml-12">
                    <button
                      onClick={() => toggleThread(message.id)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mb-2"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
                        </>
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="space-y-3 pl-3 border-l-2 border-border">
                        {replies.map((reply) => (
                          <MessageBubble
                            key={reply.id}
                            message={reply}
                            isAnonymousRoom={room.isAnonymous}
                            onLike={() => handleLike(reply.id)}
                            onReply={() => handleReply(message)}
                            likeCount={likesData[reply.id]?.count ?? 0}
                            userLiked={likesData[reply.id]?.userLiked ?? false}
                            isReply
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Replying to</p>
            <p className="text-sm text-foreground truncate">
              {replyingTo.isAnonymous ? 'Anonymous' : (replyingTo.user?.name || 'User')}: {replyingTo.content}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => setReplyingTo(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={5000}
              placeholder={
                replyingTo 
                  ? "Write a reply..." 
                  : (room.isAnonymous ? "Post anonymously..." : "Type a message...")
              }
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
    </div>
  );
}

interface MessageBubbleProps {
  message: EnrichedMessage;
  isAnonymousRoom?: boolean;
  onLike: () => void;
  onReply: () => void;
  likeCount: number;
  userLiked: boolean;
  replyCount?: number;
  isReply?: boolean;
}

function MessageBubble({ 
  message, 
  isAnonymousRoom, 
  onLike, 
  onReply,
  likeCount, 
  userLiked,
  replyCount = 0,
  isReply = false
}: MessageBubbleProps) {
  const messageUser = message.user;
  const showAnonymous = isAnonymousRoom || message.isAnonymous;
  
  // Get badge text for employees
  const badgeText = messageUser ? formatBadgeWithExperience(
    messageUser.userType,
    messageUser.qualification,
    messageUser.experienceYears
  ) : null;

  return (
    <div className={cn(
      'group animate-fade-in',
      message.isPinned && 'relative'
    )}>
      {message.isPinned && (
        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-accent rounded-full" />
      )}
      
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 rounded-full flex items-center justify-center text-sm font-semibold',
          isReply ? 'w-7 h-7' : 'w-9 h-9',
          showAnonymous 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-primary/10 text-primary'
        )}>
          {showAnonymous ? '?' : (messageUser?.name?.[0] || 'U')}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {showAnonymous ? (
              <span className={cn("font-medium text-muted-foreground", isReply ? "text-xs" : "text-sm")}>Anonymous</span>
            ) : (
              <>
                <span className={cn("font-semibold text-foreground", isReply ? "text-xs" : "text-sm")}>
                  {messageUser?.name || 'User'}
                </span>
                {badgeText && badgeText !== 'Member' && (
                  <span className="text-xs text-muted-foreground">
                    ({badgeText})
                  </span>
                )}
              </>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
            </span>
            {message.isPinned && (
              <Pin className="w-3 h-3 text-accent" />
            )}
          </div>
          
          <p className={cn("text-foreground leading-relaxed", isReply ? "text-xs" : "text-sm")}>{message.content}</p>
          
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
            {!isReply && (
              <button 
                onClick={onReply}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{replyCount > 0 ? replyCount : 'Reply'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
