import { 
  BarChart3, 
  Pill, 
  FileText, 
  Activity, 
  BookMarked,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Tool } from '@/types';
import { cn } from '@/lib/utils';

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3: BarChart3,
  Pill: Pill,
  FileText: FileText,
  Activity: Activity,
  BookMarked: BookMarked,
};

const categoryColors: Record<string, string> = {
  salary: 'bg-primary/10 text-primary',
  drugs: 'bg-success/10 text-success',
  protocols: 'bg-accent/10 text-accent',
  ecg: 'bg-destructive/10 text-destructive',
  study: 'bg-purple-500/10 text-purple-600',
  guidelines: 'bg-cyan-500/10 text-cyan-600',
};

interface ToolCardProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

export function ToolCard({ tool, onClick }: ToolCardProps) {
  const Icon = toolIcons[tool.icon] || FileText;
  const colorClass = categoryColors[tool.category] || 'bg-muted text-muted-foreground';

  return (
    <button
      onClick={() => onClick(tool)}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group animate-fade-in"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center', colorClass)}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <h3 className="font-semibold text-foreground">{tool.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
      </div>

      {/* Arrow or External link */}
      {tool.type === 'external' ? (
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ) : (
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
      )}
    </button>
  );
}
