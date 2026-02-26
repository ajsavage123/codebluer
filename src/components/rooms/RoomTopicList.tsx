import { useState } from 'react';
import { ArrowLeft, Plus, Lock, MessageSquarePlus, ChevronDown } from 'lucide-react';
import { Room, Topic } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TopicCard } from './TopicCard';
import { CreateTopicDialog } from './CreateTopicDialog';
import { useTopics, TopicSortOrder } from '@/hooks/useTopics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface RoomTopicListProps {
  room: Room;
  onBack: () => void;
  onTopicSelect?: (topic: Topic) => void;
}

export function RoomTopicList({ room, onBack, onTopicSelect }: RoomTopicListProps) {
  const [sortOrder, setSortOrder] = useState<TopicSortOrder>('newest');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const { data: topics = [], isLoading } = useTopics(room.id, sortOrder);

  const handleTopicClick = (topic: Topic) => {
    if (onTopicSelect) {
      onTopicSelect(topic);
    } else {
      setSelectedTopic(topic);
    }
  };

  const sortLabels: Record<TopicSortOrder, string> = {
    newest: 'Newest',
    oldest: 'Oldest',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0rem)]">
      {/* Header */}
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
          <p className="text-xs text-muted-foreground truncate">{room.description}</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">
          {topics.length} {topics.length === 1 ? 'Topic' : 'Topics'}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {sortLabels[sortOrder]}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOrder('newest')}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
              Oldest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
              `room-badge-${room.type}`
            )}>
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No topics yet</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mb-4">
              Be the first to start a discussion in {room.name}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Topic
            </Button>
          </div>
        ) : (
          topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={handleTopicClick}
            />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      {topics.length > 0 && (
        <div className="absolute bottom-6 right-6">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Create Topic Dialog */}
      <CreateTopicDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        roomId={room.id}
        roomIsAnonymous={room.isAnonymous}
      />
    </div>
  );
}
