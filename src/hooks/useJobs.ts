import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobPost } from '@/types';
import { mockJobPosts } from '@/data/mockData';

// In-memory store of all jobs (pre-seeded with mock data)
let _allJobs: JobPost[] = [...mockJobPosts];

export function useJobs(roomId: string) {
    return useQuery({
        queryKey: ['jobs', roomId],
        queryFn: async (): Promise<JobPost[]> =>
            _allJobs.filter(m => m.roomId === roomId),
        enabled: !!roomId,
    });
}

export function useCreateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newJobData: Omit<JobPost, 'id' | 'createdAt' | 'likes' | 'replies' | 'isPinned' | 'user'>) => {
            const newJob: JobPost = {
                ...newJobData,
                id: `job-${Date.now()}`,
                likes: 0,
                replies: 0,
                isPinned: false,
                createdAt: new Date(),
                user: {
                    id: 'user-1', // Mock current user
                    name: 'Alex Rivera',
                    role: 'verified',
                    createdAt: new Date('2024-01-15'),
                },
            };
            _allJobs = [newJob, ..._allJobs]; // Add to beginning
            return newJob;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jobs', variables.roomId] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
}

export function useVoteJob() {
    const queryClient = useQueryClient();

    // Simplified voting for jobs (just tracking count for now, similar to likes)
    return useMutation({
        mutationFn: async ({ jobId, roomId, voteType }: { jobId: string; roomId: string; voteType: 'up' | 'down' }) => {
            _allJobs = _allJobs.map(job => {
                if (job.id === jobId) {
                    const change = voteType === 'up' ? 1 : -1;
                    return { ...job, likes: job.likes + change };
                }
                return job;
            });
            return { action: voteType };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jobs', variables.roomId] });
        },
    });
}

export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, roomId }: { jobId: string; roomId: string }) => {
            _allJobs = _allJobs.filter(job => job.id !== jobId);
            return { action: 'deleted' };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jobs', variables.roomId] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
}
