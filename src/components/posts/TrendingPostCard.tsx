import { TrendingUp, Heart, MessageCircle, Bookmark, CheckCircle } from 'lucide-react';
import { TrendingPost } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TrendingPostCardProps {
  post: TrendingPost;
  rank: number;
}

export function TrendingPostCard({ post, rank }: TrendingPostCardProps) {
  const { message, room } = post;
  const user = message.user;

  return (
    <article className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Rank badge */}
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent font-bold text-sm">
          #{rank}
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {user?.name ? (
              <>
                <span className="font-semibold text-foreground truncate">{user.name}</span>
                {user.role === 'verified' && (
                  <span className="verified-badge">
                    <CheckCircle className="w-2.5 h-2.5" />
                  </span>
                )}
              </>
            ) : (
              <span className="font-medium text-muted-foreground">Anonymous</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-medium',
              `room-badge-${room.type}`
            )}>
              {room.name}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(message.createdAt, { addSuffix: true })}</span>
          </div>
        </div>

        {/* Trending indicator */}
        <div className="flex items-center gap-1 text-accent">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <p className="text-foreground leading-relaxed mb-4">{message.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <button className="flex items-center gap-1.5 hover:text-destructive transition-colors group">
          <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{message.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{message.replies}</span>
        </button>
        <button className="ml-auto hover:text-primary transition-colors">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
