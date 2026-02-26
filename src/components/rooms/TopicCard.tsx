import { Pin, Lock, MessageCircle, User } from 'lucide-react';
import { Topic } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TopicCardProps {
  topic: Topic;
  onClick: (topic: Topic) => void;
}

export function TopicCard({ topic, onClick }: TopicCardProps) {
  const showAnonymous = topic.isAnonymous;

  return (
    <button
      onClick={() => onClick(topic)}
      className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
          showAnonymous 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-primary/10 text-primary'
        )}>
          {showAnonymous ? '?' : (topic.user?.name?.[0] || <User className="w-4 h-4" />)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {topic.isPinned && (
              <Pin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            )}
            {topic.isLocked && (
              <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
              {topic.title}
            </h3>
          </div>

          {topic.content && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {topic.content}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {showAnonymous ? 'Anonymous' : (topic.user?.name || 'User')}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(topic.createdAt, { addSuffix: true })}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
