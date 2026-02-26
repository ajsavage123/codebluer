import { useEffect, useState } from 'react';
import { EmsLogo } from '@/components/icons/EmsLogo';
import { cn } from '@/lib/utils';

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Show splash for 2.5 seconds, then start exit animation
        const timer = setTimeout(() => {
            setIsExiting(true);
            // Wait for exit animation (800ms) to finish
            setTimeout(onFinish, 800);
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={cn(
            "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white transition-colors duration-700",
            isExiting ? "animate-splash-exit" : ""
        )}>
            <div className="relative">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse scale-150" />

                {/* Animated Logo */}
                <EmsLogo size="lg" className="w-24 h-24 relative z-10 animate-heartbeat-premium" />
            </div>

            {/* App Branding */}
            <div className={cn(
                "mt-8 text-center transition-all duration-1000 transform",
                isExiting ? "scale-90 opacity-0" : "scale-100 opacity-100"
            )}>
                <h1 className="text-3xl font-black text-blue-600 tracking-tighter mb-1">
                    CODEBLUER
                </h1>
                <div className="flex items-center gap-2">
                    <div className="h-[1px] w-8 bg-blue-100" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                        EMR COMMUNITY
                    </p>
                    <div className="h-[1px] w-8 bg-blue-100" />
                </div>
            </div>

            {/* Bottom Loading Indicator */}
            <div className="absolute bottom-12 flex flex-col items-center gap-3">
                <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-[loading-bar_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Establishing Secure Connection...
                </p>
            </div>

            {/* Custom Keyframes for the bar since it's one-off */}
            <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(300%); width: 30%; }
        }
      `}</style>
        </div>
    );
}
