import { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState('center'); // 'center' | 'transition' | 'done'

  useEffect(() => {
    // Stage 1: Hold centered emblem & load (1.6s)
    const timer1 = setTimeout(() => {
      setStage('transition');
    }, 1600);

    // Stage 2: Complete shrink & move to corner (0.7s transition)
    const timer2 = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center transition-all duration-700 ease-in-out ${
        stage === 'transition' ? 'bg-slate-950/0 backdrop-blur-0' : 'bg-slate-950 backdrop-blur-md'
      }`}
    >
      {/* Background radial glow */}
      <div
        className={`absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl transition-opacity duration-500 ${
          stage === 'transition' ? 'opacity-0' : 'opacity-100 animate-pulse'
        }`}
      />

      {/* Main Logo & Crest Container that morphs and flies to corner */}
      <div
        className={`flex items-center gap-3 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform ${
          stage === 'transition'
            ? 'fixed top-3 left-4 translate-x-0 translate-y-0 scale-[0.45] opacity-90 origin-top-left'
            : 'scale-125 translate-y-0 opacity-100'
        }`}
      >
        {/* Emblem Crest */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-blue-600 to-primary-dark flex items-center justify-center shadow-2xl shadow-primary/50 border-2 border-white/80 animate-bounce-subtle">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-lg">
            <Sparkles size={12} className="animate-spin-slow" />
          </div>
        </div>

        {/* Text Details (fades out as it flies to top-left) */}
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="bg-blue-500/20 text-blue-300 font-bold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase border border-blue-400/30">
              GVMC Smart City
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight mt-0.5">
            Park Maintenance System
          </h1>
          <p className={`text-xs text-slate-400 transition-opacity duration-300 ${stage === 'transition' ? 'opacity-0' : 'opacity-100'}`}>
            Greater Visakhapatnam Municipal Corporation
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div
        className={`absolute bottom-12 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden transition-all duration-500 ${
          stage === 'transition' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 animate-loading-bar rounded-full" />
      </div>
    </div>
  );
}
