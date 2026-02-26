import { useState } from 'react';
import {
    ArrowLeft, ExternalLink, Bookmark, ThumbsUp, Plus, X,
    FileText, Video, BookOpen, Smartphone, Layers, Search, Filter
} from 'lucide-react';
import { Room } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type Category = 'all' | 'protocols' | 'study' | 'video' | 'app' | 'pdf';

interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: Exclude<Category, 'all'>;
    sharedBy: string;
    sharedByBadge: string;
    upvotes: number;
    saves: number;
    createdAt: Date;
    userSaved?: boolean;
    userVoted?: boolean;
}

const MOCK_RESOURCES: Resource[] = [
    { id: 'r1', title: 'ACLS Guidelines 2024 — Quick Reference Card', description: 'Official AHA updated algorithm cards for cardiac arrest, ACS, and stroke response.', url: 'https://cpr.heart.org', category: 'pdf', sharedBy: 'Sam Rivera', sharedByBadge: 'Paramedic · 8yr', upvotes: 134, saves: 89, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), userSaved: false, userVoted: false },
    { id: 'r2', title: 'EMS Protocol Library — All 50 States', description: 'Searchable database of state-specific EMS protocols. Updated weekly.', url: 'https://www.emsclinicians.org', category: 'protocols', sharedBy: 'Jordan Chen', sharedByBadge: 'Paramedic · 5yr', upvotes: 98, saves: 67, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), userSaved: false, userVoted: false },
    { id: 'r3', title: 'NREMT Prep — Full Study Guide 2024', description: 'Comprehensive NREMT cognitive exam prep with practice questions, simulations, and topic reviews.', url: 'https://www.nremt.org', category: 'study', sharedBy: 'Riley Thompson', sharedByBadge: 'EMT Student', upvotes: 76, saves: 112, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), userSaved: true, userVoted: false },
    { id: 'r4', title: 'ECG Interpretation Masterclass — YouTube Series', description: '12-part video series by Dr. Smith covering STEMI, arrhythmias, and blocks. Free on YouTube.', url: 'https://youtube.com', category: 'video', sharedBy: 'Alex Torres', sharedByBadge: 'Paramedic Instructor', upvotes: 203, saves: 156, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), userSaved: false, userVoted: true },
    { id: 'r5', title: 'Medic Drug Handbook App', description: 'Offline drug reference app with dosage calculator, contraindications, and pediatric dosing.', url: 'https://play.google.com', category: 'app', sharedBy: 'Morgan Lee', sharedByBadge: 'EMT · 3yr', upvotes: 87, saves: 134, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), userSaved: true, userVoted: false },
    { id: 'r6', title: 'BLS Provider Handbook 2024', description: 'American Heart Association BLS provider manual with updated CPR techniques.', url: 'https://cpr.heart.org', category: 'pdf', sharedBy: 'Casey Wong', sharedByBadge: 'BLS Instructor', upvotes: 61, saves: 78, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96), userSaved: false, userVoted: false },
];

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'all', label: 'All', icon: Layers, color: 'text-foreground' },
    { id: 'protocols', label: 'Protocols', icon: FileText, color: 'text-blue-600' },
    { id: 'study', label: 'Study', icon: BookOpen, color: 'text-purple-600' },
    { id: 'video', label: 'Videos', icon: Video, color: 'text-red-500' },
    { id: 'app', label: 'Apps', icon: Smartphone, color: 'text-green-600' },
    { id: 'pdf', label: 'PDFs', icon: FileText, color: 'text-orange-500' },
];

const CAT_COLORS: Record<string, string> = {
    protocols: 'bg-blue-100 text-blue-700 border-blue-200',
    study: 'bg-purple-100 text-purple-700 border-purple-200',
    video: 'bg-red-100 text-red-700 border-red-200',
    app: 'bg-green-100 text-green-700 border-green-200',
    pdf: 'bg-orange-100 text-orange-700 border-orange-200',
};

function ResourceCard({ resource, onVote, onSave }: {
    resource: Resource;
    onVote: () => void;
    onSave: () => void;
}) {
    const catColor = CAT_COLORS[resource.category] || 'bg-muted text-muted-foreground border-muted';
    const CatIcon = CATEGORIES.find(c => c.id === resource.category)?.icon ?? FileText;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all">
            {/* Category header strip */}
            <div className={cn('flex items-center gap-2 px-4 py-2 border-b text-xs font-bold uppercase tracking-wider', catColor)}>
                <CatIcon className="w-3.5 h-3.5" />
                {resource.category}
            </div>

            <div className="p-4">
                <h3 className="font-bold text-sm text-foreground leading-snug mb-1">{resource.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{resource.description}</p>

                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {resource.sharedBy[0]}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{resource.sharedBy}</span>
                        {' · '}<span className="text-primary">{resource.sharedByBadge}</span>
                        {' · '}{formatDistanceToNow(resource.createdAt, { addSuffix: true })}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <button
                        onClick={onVote}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                            resource.userVoted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                    >
                        <ThumbsUp className={cn('w-3.5 h-3.5', resource.userVoted && 'fill-current')} />
                        {resource.upvotes}
                    </button>

                    <button
                        onClick={onSave}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                            resource.userSaved ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                    >
                        <Bookmark className={cn('w-3.5 h-3.5', resource.userSaved && 'fill-current')} />
                        Save
                    </button>

                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Open <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}

interface LibraryRoomProps {
    room: Room;
    onBack: () => void;
}

export function LibraryRoom({ room, onBack }: LibraryRoomProps) {
    const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
    const [category, setCategory] = useState<Category>('all');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', url: '', category: 'study' as Exclude<Category, 'all'> });

    const filtered = resources.filter(r => {
        const matchCat = category === 'all' || r.category === category;
        const matchSearch = !search.trim() || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    }).sort((a, b) => b.upvotes - a.upvotes);

    const toggle = (id: string, field: 'userVoted' | 'userSaved', countField: 'upvotes' | 'saves') => {
        setResources(prev => prev.map(r => r.id !== id ? r : {
            ...r,
            [field]: !r[field],
            [countField]: r[field] ? r[countField] - 1 : r[countField] + 1,
        }));
    };

    const handleShare = () => {
        if (!form.title.trim() || !form.url.trim()) return;
        const newRes: Resource = {
            id: `r-${Date.now()}`, ...form, sharedBy: 'You (Dev)',
            sharedByBadge: 'Paramedic', upvotes: 0, saves: 0,
            createdAt: new Date(), userSaved: false, userVoted: false,
        };
        setResources(prev => [newRes, ...prev]);
        setForm({ title: '', description: '', url: '', category: 'study' });
        setShowForm(false);
        toast({ title: 'Resource shared! 📚', description: 'Your resource is now visible to the community.' });
    };

    return (
        <div className="flex flex-col h-[100dvh] fixed inset-0 z-[100] bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[hsl(215,25%,25%)] to-[hsl(215,25%,38%)] text-white shadow-lg">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">📚</div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold truncate">{room.name}</h2>
                    <p className="text-xs text-white/70">{resources.length} community resources</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Share
                </button>
            </div>

            {/* Search */}
            <div className="px-4 py-2 bg-card border-b border-border">
                <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-2">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources…"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-border bg-card">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all',
                                category === cat.id
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Resources */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-3xl mb-2">📭</p>
                        <p className="font-semibold text-foreground">No resources found</p>
                        <p className="text-sm text-muted-foreground mt-1">Be the first to share one!</p>
                    </div>
                ) : (
                    filtered.map(r => (
                        <ResourceCard
                            key={r.id}
                            resource={r}
                            onVote={() => toggle(r.id, 'userVoted', 'upvotes')}
                            onSave={() => toggle(r.id, 'userSaved', 'saves')}
                        />
                    ))
                )}
            </div>

            {/* Share form modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
                    <div className="w-full bg-background rounded-t-3xl p-4 space-y-3 animate-slide-up max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-foreground">Share a Resource</h3>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Title of the resource"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        />
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="URL / Link"
                            value={form.url}
                            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                        />
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                            rows={2}
                            placeholder="Brief description…"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        />
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setForm(f => ({ ...f, category: cat.id as Exclude<Category, 'all'> }))}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all',
                                            form.category === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            disabled={!form.title.trim() || !form.url.trim()}
                            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 transition-colors hover:bg-primary/90"
                        >
                            Share Resource
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
