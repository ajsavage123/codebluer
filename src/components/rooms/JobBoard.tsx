import { useState } from 'react';
import { ArrowLeft, Lock, PlusCircle } from 'lucide-react';
import { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobs, useVoteJob, useDeleteJob } from '@/hooks/useJobs';
import { JobCard } from './JobCard';
import { JobPostForm } from './JobPostForm';
import { JobDiscussion } from './JobDiscussion';

interface JobBoardProps {
    room: Room;
    onBack: () => void;
}

export function JobBoard({ room, onBack }: JobBoardProps) {
    const { data: jobs = [], isLoading } = useJobs(room.id);
    const voteJob = useVoteJob();
    const deleteJob = useDeleteJob();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Sort pinned posts first, then by newest
    const sortedJobs = [...jobs].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const handleDiscuss = (jobId: string) => {
        setSelectedJobId(jobId);
        // We will implement the sliding discussion panel next
        console.log("Opening discussion for", jobId);
    };

    return (
        <div className="flex flex-col h-[100dvh] fixed inset-0 z-[100] bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shadow-md shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={onBack} className="text-primary-foreground hover:bg-primary-foreground/10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate">{room.name}</h2>
                    <p className="text-xs opacity-80">Structured Job Postings</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{jobs.length} Opportunities</span>
                </div>
                <Button
                    size="sm"
                    className="h-8 rounded-full shadow-sm bg-primary/10 text-primary hover:bg-primary/20 border-0"
                    onClick={() => setIsFormOpen(true)}
                >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-semibold">Post a Job</span>
                </Button>
            </div>

            {/* Jobs List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
                ) : sortedJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-primary/60" />
                        </div>
                        <p className="font-semibold text-foreground mb-1">No jobs posted yet</p>
                        <p className="text-sm text-muted-foreground max-w-[240px]">Be the first to share an opportunity in {room.name}</p>
                    </div>
                ) : (
                    sortedJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onVote={(type) => voteJob.mutate({ jobId: job.id, roomId: room.id, voteType: type })}
                            onDiscuss={() => handleDiscuss(job.id)}
                            onDelete={() => deleteJob.mutate({ jobId: job.id, roomId: room.id })}
                        />
                    ))
                )}
            </div>

            {/* Post Modal */}
            {isFormOpen && (
                <JobPostForm roomId={room.id} onClose={() => setIsFormOpen(false)} />
            )}

            {/* Discussion Panel */}
            {selectedJobId && (
                <JobDiscussion
                    job={jobs.find(j => j.id === selectedJobId)!}
                    onVoteJob={(type) => voteJob.mutate({ jobId: selectedJobId, roomId: room.id, voteType: type })}
                    onClose={() => setSelectedJobId(null)}
                />
            )}
        </div>
    );
}
