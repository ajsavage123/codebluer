import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  Users, 
  Globe, 
  Award, 
  BookOpen,
  Shield
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

// Medical/Healthcare icon for intern (stethoscope-like)
function InternIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  );
}

interface UserBadgeProps {
  userType: UserType | null;
  qualification: QualificationType | null;
  experienceYears?: number;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

interface BadgeConfig {
  label: string;
  icon: React.ElementType;
  color: string;
}

export function getUserBadge(userType: UserType | null, qualification: QualificationType | null): BadgeConfig {
  switch (userType) {
    case 'student':
      return { label: 'Student', icon: GraduationCap, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    case 'intern':
      return { label: 'Intern', icon: InternIcon, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
    case 'employee':
      if (qualification === 'bsc_emt') {
        return { label: 'Paramedic', icon: Shield, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      }
      return { label: 'AEMT', icon: Shield, color: 'bg-primary/10 text-primary border-primary/20' };
    case 'hr':
      return { label: 'HR Manager', icon: Users, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
    case 'international_coordinator':
      return { label: 'Intl. Coordinator', icon: Globe, color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
    case 'instructor':
      return { label: 'Instructor', icon: Award, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    case 'faculty':
      return { label: 'Faculty', icon: BookOpen, color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
    default:
      return { label: 'Member', icon: Shield, color: 'bg-muted text-muted-foreground border-border' };
  }
}

export function formatBadgeWithExperience(
  userType: UserType | null, 
  qualification: QualificationType | null, 
  experienceYears?: number
): string {
  const badge = getUserBadge(userType, qualification);
  
  // For employee types, show experience
  if (userType === 'employee' && experienceYears !== undefined && experienceYears >= 0) {
    return `${badge.label} exp-${experienceYears}`;
  }
  
  return badge.label;
}

export function UserBadge({ 
  userType, 
  qualification, 
  experienceYears, 
  className, 
  showIcon = true,
  compact = false 
}: UserBadgeProps) {
  const badge = getUserBadge(userType, qualification);
  const Icon = badge.icon;
  
  // Format: "Paramedic exp-2" for employees, just label for others
  const badgeText = formatBadgeWithExperience(userType, qualification, experienceYears);

  if (compact) {
    return (
      <span className={cn(
        'text-xs text-muted-foreground',
        className
      )}>
        ({badgeText})
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      badge.color,
      className
    )}>
      {showIcon && <Icon className="w-3 h-3" />}
      {badgeText}
    </span>
  );
}