import { cn } from '@/lib/utils';

interface EmsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmsLogo({ className, size = 'md' }: EmsLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      {/* Star of Life inspired design */}
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" className="fill-primary" />
        
        {/* Cross/Star pattern */}
        <path
          d="M50 10 L50 90 M10 50 L90 50"
          className="stroke-primary-foreground"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Diagonal lines for star effect */}
        <path
          d="M22 22 L78 78 M78 22 L22 78"
          className="stroke-primary-foreground"
          strokeWidth="10"
          strokeLinecap="round"
        />
        
        {/* Center circle */}
        <circle cx="50" cy="50" r="12" className="fill-primary-foreground" />
        
        {/* Inner accent */}
        <circle cx="50" cy="50" r="6" className="fill-primary" />
      </svg>
    </div>
  );
}
