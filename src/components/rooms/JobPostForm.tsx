import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Briefcase, MapPin, Building2, CalendarDays, Clock, IndianRupee, Subtitles, Link as LinkIcon, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateJob } from '@/hooks/useJobs';
import { toast } from '@/hooks/use-toast';

interface JobPostFormProps {
    roomId: string;
    onClose: () => void;
}

export function JobPostForm({ roomId, onClose }: JobPostFormProps) {
    const createJob = useCreateJob();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        role: 'Paramedic',
        location: '',
        workingDays: '',
        workingHours: '',
        salaryOffering: '',
        description: '',
        applyLink: '',
        contactInfo: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.companyName || !formData.location || !formData.salaryOffering || !formData.description) {
            toast({ title: 'Missing fields', description: 'Please fill out all required fields.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await createJob.mutateAsync({
                roomId,
                userId: 'user-1', // Setting a default mock user id
                ...formData,
            });
            toast({ title: 'Success', description: 'Job posted successfully!' });
            onClose();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to post job. Please try again.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-semibold text-foreground">Post an Opportunity</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                <form id="job-post-form" onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5">

                    {/* Company */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            Company / Hospital Name *
                        </label>
                        <input
                            required
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="e.g. Apollo Hospitals"
                            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    </div>

                    {/* Role & Location Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                Role *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] pr-8"
                            >
                                <option value="Paramedic">Paramedic</option>
                                <option value="EMT">EMT</option>
                                <option value="EMR">EMR</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Dispatcher">Dispatcher</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                Location *
                            </label>
                            <input
                                required
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Mumbai, MH"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Schedule Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                Working Days / Month
                            </label>
                            <input
                                name="workingDays"
                                value={formData.workingDays}
                                onChange={handleChange}
                                placeholder="e.g. 24 days"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Hrs / Shift
                            </label>
                            <input
                                name="workingHours"
                                value={formData.workingHours}
                                onChange={handleChange}
                                placeholder="e.g. 12 hours"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-green-600" />
                            Salary Offering *
                        </label>
                        <input
                            required
                            name="salaryOffering"
                            value={formData.salaryOffering}
                            onChange={handleChange}
                            placeholder="e.g. ₹35k - ₹40k / month"
                            className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 text-green-800 placeholder:text-green-700/50 font-medium"
                        />
                    </div>

                    {/* Contact Info & Link */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                Application Link
                            </label>
                            <input
                                name="applyLink"
                                value={formData.applyLink}
                                onChange={handleChange}
                                placeholder="e.g. LinkedIn URL"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                Contact Details
                            </label>
                            <input
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleChange}
                                placeholder="Email or Phone no"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <Subtitles className="w-4 h-4 text-muted-foreground" />
                            Full Details & Requirements *
                        </label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="List responsibilities, required experience, certifications, etc."
                            rows={5}
                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[120px]"
                        />
                    </div>

                </form>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border mt-auto shadow-[0_-10px_40px_-5px_var(--bg-background)]">
                <Button
                    type="submit"
                    form="job-post-form"
                    disabled={isSubmitting}
                    className="w-full max-w-md mx-auto h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all"
                >
                    {isSubmitting ? 'Posting...' : 'Publish Job Post'}
                </Button>
            </div>
        </div>
    );
}
