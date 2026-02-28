import { useState } from 'react';
import { JobPost } from '@/types';
import {
    MapPin, Clock, CalendarDays, IndianRupee,
    ChevronUp, ChevronDown, MessageCircle, Building2, UserCircle2, Share2, Pin, ExternalLink, Phone, Trash2, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface JobCardProps {
    job: JobPost;
    onVote: (type: 'up' | 'down') => void;
    onDiscuss: () => void;
    onDelete?: () => void;
}

export function JobCard({ job, onVote, onDiscuss, onDelete }: JobCardProps) {
    const timeAgo = formatDistanceToNow(job.createdAt, { addSuffix: true });
    // Assuming currentUser ID is 'user-1' for demo as that is what useCreateJob uses
    const isOwner = job.userId === 'user-1';

    // For demo purposes, we'll just track if the user clicked locally to show visual feedback
    const [localVote, setLocalVote] = useState<'up' | 'down' | null>(null);

    const handleVote = (type: 'up' | 'down') => {
        if (localVote === type) {
            setLocalVote(null); // Toggle off
        } else {
            setLocalVote(type);
        }
        onVote(type);
    };

    return (
        <div className={cn(
            'bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow',
            job.isPinned && 'ring-2 ring-primary/40'
        )}>
            {job.isPinned && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border-b border-primary/20">
                    <Pin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">Pinned Opportunity</span>
                </div>
            )}

            <div className="p-4 relative">
                {/* Delete Button at Top Right */}
                {isOwner && onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="absolute top-4 right-4 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                        title="Delete Post"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}

                {/* Header: Company & Role */}
                <div className="flex justify-between items-start mb-4 pr-10">
                    <div className="flex gap-3 items-start">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground leading-tight text-lg">{job.role}</h3>
                            <p className="text-sm font-medium text-primary mt-0.5 flex items-center gap-1.5">
                                {job.companyName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 opacity-70">
                                <UserCircle2 className="w-3.5 h-3.5" />
                                <span className="text-xs">Posted by {job.user?.name || 'Anonymous'} • {timeAgo}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20 text-green-700">
                        <IndianRupee className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-semibold truncate">{job.salaryOffering}</span>
                    </div>
                    <div className="flex flex-col justify-center bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                        <div className="flex flex-row gap-1 items-center mb-0.5 opacity-60">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Hours</span>
                        </div>
                        <span className="text-sm font-medium truncate">{job.workingHours || '-'}</span>
                    </div>
                    <div className="flex flex-col justify-center bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                        <div className="flex flex-row gap-1 items-center mb-0.5 opacity-60">
                            <CalendarDays className="w-3 h-3 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Days</span>
                        </div>
                        <span className="text-sm font-medium truncate">{job.workingDays || '-'}</span>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</h4>
                    <p className="text-sm text-foreground/90 leading-relaxed max-w-full break-words break-all whitespace-pre-wrap">
                        {job.description}
                    </p>
                </div>

                {/* Contact & Apply Link */}
                {(job.applyLink || job.contactInfo) && (
                    <div className="mb-4 space-y-2 pt-3 border-t border-border/50">
                        {job.applyLink && (
                            <a
                                href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-primary hover:underline font-medium hover:text-primary/80 transition-colors break-all"
                            >
                                <ExternalLink className="w-4 h-4 shrink-0" />
                                <span className="truncate">{job.applyLink}</span>
                            </a>
                        )}
                        {job.contactInfo && (
                            <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium break-all">
                                {job.contactInfo.includes('@') ? (
                                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : (
                                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                                {job.contactInfo}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                    {/* Voting */}
                    <div className="flex flex-row items-center gap-1 bg-muted/50 rounded-full border border-border p-0.5">
                        <button
                            onClick={() => handleVote('up')}
                            className={cn(
                                'p-1.5 rounded-full transition-colors',
                                localVote === 'up'
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            )}
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className={cn(
                            'text-sm font-bold min-w-[20px] text-center',
                            job.likes > 0 ? 'text-primary' : job.likes < 0 ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                            {job.likes + (localVote === 'up' ? 1 : localVote === 'down' ? -1 : 0)}
                        </span>
                        <button
                            onClick={() => handleVote('down')}
                            className={cn(
                                'p-1.5 rounded-full transition-colors',
                                localVote === 'down'
                                    ? 'text-destructive bg-destructive/10'
                                    : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
                            )}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-nowrap shrink-0">
                        <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground shrink-0">
                            <Share2 className="w-4 h-4 mr-1.5 shrink-0" />
                            <span className="text-xs font-medium shrink-0">Share</span>
                        </Button>
                        <Button
                            onClick={onDiscuss}
                            size="sm"
                            className="h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-shadow shrink-0"
                        >
                            <MessageCircle className="w-4 h-4 mr-1.5 shrink-0" />
                            <span className="text-xs font-semibold whitespace-nowrap shrink-0">Discuss ({job.replies})</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
