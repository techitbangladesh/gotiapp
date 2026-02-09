
import React, { useState, useEffect, useMemo } from 'react';
import { User, Language } from '../types';
import { Zap, Clock, AlertCircle, RefreshCw, ShoppingBag, ShieldCheck, Activity } from 'lucide-react';

interface ActivePackagePanelProps {
  user: User | null;
  lang: Language;
  onNavigate: (page: any) => void;
}

const ActivePackagePanel: React.FC<ActivePackagePanelProps> = ({ user, lang, onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [initialDuration, setInitialDuration] = useState<number>(0);

  useEffect(() => {
    if (!user?.expiryTimestamp) return;

    const calculateTime = () => {
      const now = Date.now();
      const diff = user.expiryTimestamp! - now;
      
      if (diff <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
        setIsExpired(false);
        // Track the total duration for the progress bar if not set
        if (initialDuration === 0) {
          // Assume common durations if unknown, or just use a relative window
          setInitialDuration(Math.max(diff, 3600000)); 
        }
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [user, initialDuration]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const status = useMemo(() => {
    if (isExpired) return 'expired';
    if (timeLeft < 120) return 'danger'; // 2 mins
    if (timeLeft < 600) return 'warning'; // 10 mins
    return 'active';
  }, [timeLeft, isExpired]);

  const getStatusConfig = () => {
    switch (status) {
      case 'danger': return { 
        colors: 'text-red-600 bg-red-600/10 border-red-600/20',
        timer: 'text-red-600 animate-pulse',
        bar: 'bg-red-600',
        label: lang === 'bn' ? 'জরুরী' : 'Critical'
      };
      case 'warning': return { 
        colors: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        timer: 'text-orange-500',
        bar: 'bg-orange-500',
        label: lang === 'bn' ? 'মেয়াদ শেষ পর্যায়ে' : 'Expiring Soon'
      };
      case 'expired': return { 
        colors: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
        timer: 'text-zinc-400',
        bar: 'bg-zinc-800',
        label: lang === 'bn' ? 'মেয়াদ শেষ' : 'Package Expired'
      };
      default: return { 
        colors: 'text-green-500 bg-green-500/10 border-green-500/20',
        timer: 'text-zinc-900 dark:text-white',
        bar: 'bg-green-500',
        label: lang === 'bn' ? 'সক্রিয়' : 'Active'
      };
    }
  };

  const config = getStatusConfig();
  const progress = initialDuration > 0 ? Math.min(100, (timeLeft * 1000 / initialDuration) * 100) : 100;

  if (!user || !user.activePackage) {
    return (
      <div className="px-6 py-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 flex flex-col items-center gap-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center text-zinc-300">
             <AlertCircle size={32} />
          </div>
          <div className="space-y-1">
             <h3 className={`text-xl font-black text-zinc-900 dark:text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase'}`}>
               {lang === 'bn' ? 'সক্রিয় প্যাকেজ নেই' : 'No Active Package'}
             </h3>
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-english">
               Please purchase a plan to connect
             </p>
          </div>
          <button 
            onClick={() => onNavigate('packages')}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            {lang === 'bn' ? 'প্যাকেজ দেখুন' : 'Browse Packages'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
           <Zap size={140} />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600/5 dark:bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                 <Activity size={24} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-english mb-0.5">Live Connection</p>
                <h3 className={`text-lg font-black text-zinc-900 dark:text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase tracking-tight'}`}>
                  {user.activePackage}
                </h3>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${config.colors}`}>
               <div className={`w-2 h-2 rounded-full ${status === 'expired' ? 'bg-zinc-500' : 'bg-current animate-pulse'}`}></div>
               {config.label}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6 space-y-4 border-y border-zinc-50 dark:border-zinc-800">
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-english">Time Remaining</p>
             <div 
               className={`text-6xl font-black font-english tracking-tightest tabular-nums leading-none ${config.timer}`}
               aria-label={`Remaining time: ${formatTime(timeLeft)}`}
             >
                {formatTime(timeLeft)}
             </div>
             
             {/* Dynamic Progress Bar */}
             <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${config.bar}`}
                  style={{ width: `${isExpired ? 0 : progress}%` }}
                ></div>
             </div>
          </div>

          <div className="flex gap-3">
            {!isExpired ? (
              <button 
                onClick={() => onNavigate('profile')}
                className="flex-1 py-5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} className="text-red-600" />
                {lang === 'bn' ? 'বিস্তারিত' : 'Dashboard'}
              </button>
            ) : null}
            <button 
              onClick={() => onNavigate('packages')}
              className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${isExpired ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-black/10'}`}
            >
              <RefreshCw size={18} />
              {isExpired ? (lang === 'bn' ? 'প্যাক রিনিউ' : 'Renew Plan') : (lang === 'bn' ? 'টপ-আপ' : 'Extend Link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePackagePanel;
