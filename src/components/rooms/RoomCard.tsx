import {
  MessageCircle,
  DollarSign,
  Briefcase,
  Shield,
  Rocket,
  Award,
  GraduationCap,
  BookOpen,
  Users,
  ChevronRight,
  Lock
} from 'lucide-react';
import { Room, RoomType } from '@/types';
import { cn } from '@/lib/utils';

const roomIcons: Record<RoomType, React.ComponentType<{ className?: string }>> = {
  general: MessageCircle,
  salary: DollarSign,
  career: Briefcase,
  leadership: Shield,
  entrepreneurship: Rocket,
  certifications: Award,
  students: GraduationCap,
  library: BookOpen,
};

const roomColors: Record<RoomType, string> = {
  general: 'bg-blue-100 text-blue-600',
  salary: 'bg-emerald-100 text-emerald-600',
  career: 'bg-purple-100 text-purple-600',
  leadership: 'bg-orange-100 text-orange-600',
  entrepreneurship: 'bg-pink-100 text-pink-600',
  certifications: 'bg-cyan-100 text-cyan-600',
  students: 'bg-yellow-100 text-yellow-600',
  library: 'bg-slate-100 text-slate-600',
};

interface RoomCardProps {
  room: Room;
  onClick: (room: Room) => void;
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  const Icon = roomIcons[room.type];
  const colorClass = roomColors[room.type];
  const isHot = room.messageCount > 5000;

  return (
    <button
      onClick={() => onClick(room)}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 group animate-fade-in active:scale-[0.98]"
    >
      {/* Icon with optional live dot */}
      <div className="relative flex-shrink-0">
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
        {isHot && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-background animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-foreground truncate">{room.name}</h3>
          {room.isAnonymous && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
              <Lock className="w-2.5 h-2.5" />
              Anon
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mb-1.5">{room.description}</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {room.memberCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="w-3 h-3" />
            {room.messageCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </button>
  );
}
