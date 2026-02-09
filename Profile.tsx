
import React, { useState } from 'react';
import { Language, TranslationStrings, User } from '../types';
import { SOCIAL_LINKS, CONTACT_NUMBER } from '../constants';
import { 
  UserCircle, Mail, Phone, ShieldCheck, Activity, 
  Settings, LogOut, ChevronRight, Globe, Moon, 
  Smartphone, Save, Youtube, Video, Facebook, 
  TrendingUp, Send, MessageCircle, ArrowLeft, Headphones,
  ExternalLink, CreditCard, Bell, Shield, LifeBuoy, Zap, Terminal, Plus, Hash
} from 'lucide-react';

interface ProfileProps {
  user: User;
  lang: Language;
  t: TranslationStrings;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onThemeToggle: () => void;
  onLangToggle: () => void;
  theme: 'light' | 'dark';
}

type ProfileView = 'menu' | 'contact' | 'settings' | 'admin';

const Profile: React.FC<ProfileProps> = ({ user, lang, t, setUser, onThemeToggle, onLangToggle, theme }) => {
  const [activeView, setActiveView] = useState<ProfileView>('menu');
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  
  // Admin form state
  const [manualPackName, setManualPackName] = useState('');
  const [manualDurationValue, setManualDurationValue] = useState('1');
  const [manualDurationUnit, setManualDurationUnit] = useState<'mins' | 'hours' | 'days'>('hours');

  const handleSaveSettings = () => {
    setUser({ ...user, ...formData });
    setActiveView('menu');
  };

  const handleActivateManualPackage = () => {
    if (!manualPackName || !manualDurationValue) return;
    
    let durationMs = 0;
    const value = parseInt(manualDurationValue);
    
    if (manualDurationUnit === 'mins') durationMs = value * 60 * 1000;
    else if (manualDurationUnit === 'hours') durationMs = value * 60 * 60 * 1000;
    else if (manualDurationUnit === 'days') durationMs = value * 24 * 60 * 60 * 1000;
    
    const expiryTimestamp = Date.now() + durationMs;
    
    setUser({
      ...user,
      activePackage: manualPackName,
      expiryTimestamp: expiryTimestamp
    });
    
    setActiveView('menu');
  };

  const SubPageHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <header className="p-8 flex items-center gap-6 sticky top-0 bg-white dark:bg-zinc-950 z-50">
      <button onClick={onBack} className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white active:scale-90 transition-all">
        <ArrowLeft size={20} />
      </button>
      <h2 className={`text-2xl font-black text-zinc-900 dark:text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase italic tracking-tightest'}`}>
        {title}
      </h2>
    </header>
  );

  const getSocialIcon = (iconName: string) => {
    const props = { size: 20 };
    switch (iconName) {
      case 'Youtube': return <Youtube {...props} />;
      case 'Video': return <Video {...props} />;
      case 'Facebook': return <Facebook {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Send': return <Send {...props} />;
      case 'MessageCircle': return <MessageCircle {...props} />;
      case 'Mail': return <Mail {...props} />;
      default: return <Globe {...props} />;
    }
  };

  if (activeView === 'admin') {
    return (
      <div className="animate-in slide-in-from-right duration-300 min-h-screen pb-40 bg-white dark:bg-zinc-950">
        <SubPageHeader title={lang === 'bn' ? 'অ্যাডমিন কন্ট্রোল' : 'Admin Terminal'} onBack={() => setActiveView('settings')} />
        <div className="px-8 space-y-10">
          <div className="bg-zinc-900 p-10 rounded-[3.5rem] border border-zinc-800 space-y-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                <Hash size={120} className="text-white" />
             </div>
             <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/20"><Terminal size={28} /></div>
                <div>
                   <h3 className="text-white font-black font-english uppercase tracking-tightest text-xl italic">Manual Inject</h3>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-english">Override User Entitlement</p>
                </div>
             </div>

             <div className="space-y-8 relative z-10">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 font-english">Package Designation</label>
                   <input 
                    type="text" 
                    placeholder="e.g. Premium VIP Access"
                    value={manualPackName}
                    onChange={e => setManualPackName(e.target.value)}
                    className="w-full p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-black text-white outline-none focus:border-red-600 transition-colors"
                   />
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 font-english">Quantity</label>
                      <input 
                        type="number" 
                        value={manualDurationValue}
                        onChange={e => setManualDurationValue(e.target.value)}
                        className="w-full p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-black text-white outline-none focus:border-red-600"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 font-english">Unit</label>
                      <select 
                        value={manualDurationUnit}
                        onChange={e => setManualDurationUnit(e.target.value as any)}
                        className="w-full p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-black text-white outline-none focus:border-red-600 appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                      >
                         <option value="mins">Minutes</option>
                         <option value="hours">Hours</option>
                         <option value="days">Days</option>
                      </select>
                    </div>
                </div>

                <button 
                  onClick={handleActivateManualPackage}
                  className="w-full py-6 bg-white text-zinc-950 rounded-3xl font-black font-english uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
                >
                   <Plus size={22} strokeWidth={3} />
                   Initialize Session
                </button>
             </div>
          </div>
          <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
             <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500"><Shield size={20} /></div>
             <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-english leading-relaxed">
                Changes will be reflected instantly on the global home dashboard.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // --- SUB-VIEW: CONTACT ---
  if (activeView === 'contact') {
    return (
      <div className="animate-in slide-in-from-right duration-300 min-h-screen pb-40 bg-white dark:bg-zinc-950">
        <SubPageHeader title={lang === 'bn' ? 'সাপোর্ট হাব' : 'Support Hub'} onBack={() => setActiveView('menu')} />
        <div className="px-8 space-y-10">
          <div className="grid gap-4">
             <a href={`tel:${CONTACT_NUMBER}`} className="flex items-center gap-6 p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 hover:border-red-600 transition-all group">
                <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-600/20">
                  <Phone size={28} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-english mb-1">Direct Hotline</p>
                   <p className="text-xl font-black text-zinc-900 dark:text-white font-english tracking-tight">{CONTACT_NUMBER}</p>
                </div>
                <ExternalLink size={20} className="text-zinc-300 group-hover:text-red-600" />
             </a>
             <a href="mailto:info.techitnetwork@gmail.com" className="flex items-center gap-6 p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 hover:border-red-600 transition-all group">
                <div className="w-16 h-16 bg-zinc-950 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-white shadow-xl">
                  <Mail size={28} />
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-english mb-1">Inquiry Terminal</p>
                   <p className="text-xs font-black text-zinc-900 dark:text-white font-english truncate">info.techitnetwork@gmail.com</p>
                </div>
                <ExternalLink size={20} className="text-zinc-300 group-hover:text-red-600" />
             </a>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-3 ml-2">
                <Globe size={14} className="text-red-600" />
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] font-english">Connected Communities</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {SOCIAL_LINKS.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] group hover:border-red-600 transition-all">
                    <div className="mb-4 text-zinc-400 group-hover:text-red-600 group-hover:scale-125 transition-all duration-500">
                       {getSocialIcon(link.icon)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white font-english">
                       {link.name}
                    </span>
                  </a>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SUB-VIEW: SETTINGS ---
  if (activeView === 'settings') {
    return (
      <div className="animate-in slide-in-from-right duration-300 min-h-screen pb-40 bg-white dark:bg-zinc-950">
        <SubPageHeader title={lang === 'bn' ? 'কনফিগারেশন' : 'Configuration'} onBack={() => setActiveView('menu')} />
        <div className="px-8 space-y-12">
           <div className="space-y-4">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] font-english ml-4">System Preferences</p>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden shadow-sm">
                <button onClick={onLangToggle} className="w-full flex items-center justify-between p-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center"><Globe size={22} /></div>
                    <span className="text-sm font-black uppercase tracking-widest font-english">{lang === 'bn' ? 'অ্যাপ ল্যাঙ্গুয়েজ' : 'Language'}</span>
                  </div>
                  <span className="text-[10px] font-black text-red-600 uppercase font-english">{lang === 'en' ? 'English' : 'বাংলা'}</span>
                </button>
                <button onClick={onThemeToggle} className="w-full flex items-center justify-between p-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">{theme === 'dark' ? <Moon size={22} /> : <Globe size={22} />}</div>
                    <span className="text-sm font-black uppercase tracking-widest font-english">{lang === 'bn' ? 'ভিজ্যুয়াল মোড' : 'Visual Mode'}</span>
                  </div>
                  <span className="text-[10px] font-black text-red-600 uppercase font-english">{theme.toUpperCase()}</span>
                </button>
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] font-english ml-4">Maintenance Access</p>
              <button 
                onClick={() => setActiveView('admin')}
                className="w-full flex items-center justify-between p-8 bg-zinc-950 border border-zinc-800 rounded-[3rem] group hover:border-red-600 transition-all shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/5 text-white rounded-2xl flex items-center justify-center border border-white/5"><Terminal size={22} /></div>
                  <span className="text-sm font-black uppercase tracking-widest font-english text-white">Maintenance Terminal</span>
                </div>
                <ChevronRight size={22} className="text-zinc-600" />
              </button>
           </div>

           <div className="space-y-6">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] font-english ml-4">Connected Identity</p>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-800 p-10 space-y-8 shadow-sm">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-english ml-1">Legal Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-black outline-none focus:border-red-600 transition-all text-zinc-900 dark:text-white" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-english ml-1">Contact Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-black outline-none focus:border-red-600 transition-all text-zinc-900 dark:text-white" />
                 </div>
                 <button onClick={handleSaveSettings} className="w-full py-6 bg-red-600 text-white rounded-[2.5rem] flex items-center justify-center gap-3 font-black font-english uppercase tracking-widest text-[12px] shadow-2xl shadow-red-600/20 active:scale-95 transition-all">
                    <Save size={20} />
                    {lang === 'bn' ? 'সেটিংস আপডেট' : 'Update Credentials'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- MAIN MENU VIEW ---
  return (
    <section className="min-h-screen bg-white dark:bg-zinc-950 pb-40">
      <div className="max-w-xl mx-auto px-8 pt-12 space-y-12">
        
        {/* User Card */}
        <div className="bg-zinc-900 dark:bg-zinc-900 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group border border-zinc-800">
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000 -rotate-12">
            <Shield size={200} />
          </div>
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-white border border-white/10 shadow-inner">
                <UserCircle size={56} strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] font-english">Network Identifier</p>
                <h2 className={`text-3xl font-black text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase italic tracking-tightest'}`}>
                  {user.name}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-black text-zinc-400 font-english uppercase tracking-widest">{user.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 flex items-center justify-between group-hover:bg-white/10 transition-all">
               <div className="space-y-1 text-left">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-english">Entitlement</p>
                  <p className={`text-base font-black text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase tracking-tight'}`}>{user.activePackage || 'Status: Unlinked'}</p>
               </div>
               <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/30"><Zap size={24} fill="currentColor" /></div>
            </div>
          </div>
        </div>

        {/* Dynamic App Menu */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-english">Main Navigation</p>
             <LifeBuoy size={14} className="text-zinc-400" />
          </div>
          
          <div className="grid gap-3">
             <button onClick={() => setActiveView('contact')} className="w-full flex items-center justify-between p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] group hover:border-red-600 transition-all shadow-sm">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                      <Headphones size={24} />
                   </div>
                   <div className="text-left">
                      <h4 className={`text-base font-black text-zinc-900 dark:text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase tracking-tight'}`}>{lang === 'bn' ? 'কাস্টমার সাপোর্ট' : 'Support Center'}</h4>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-english">Help terminal & socials</p>
                   </div>
                </div>
                <ChevronRight size={24} className="text-zinc-300 group-hover:text-red-600 group-hover:translate-x-2 transition-all duration-300" />
             </button>

             <button onClick={() => setActiveView('settings')} className="w-full flex items-center justify-between p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] group hover:border-red-600 transition-all shadow-sm">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                      <Settings size={24} />
                   </div>
                   <div className="text-left">
                      <h4 className={`text-base font-black text-zinc-900 dark:text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase tracking-tight'}`}>{lang === 'bn' ? 'অ্যাকাউন্ট সেটিংস' : 'Settings'}</h4>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-english">User & App config</p>
                   </div>
                </div>
                <ChevronRight size={24} className="text-zinc-300 group-hover:text-red-600 group-hover:translate-x-2 transition-all duration-300" />
             </button>

             <button onClick={() => setUser(null)} className="w-full flex items-center justify-between p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] group hover:border-red-600 transition-all shadow-sm">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                      <LogOut size={24} />
                   </div>
                   <div className="text-left">
                      <h4 className={`text-base font-black text-zinc-900 dark:text-white ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase tracking-tight'}`}>{lang === 'bn' ? 'লগ আউট' : 'Terminate Link'}</h4>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-english">Close current session</p>
                   </div>
                </div>
                <ChevronRight size={24} className="text-zinc-300 group-hover:text-red-600 group-hover:translate-x-2 transition-all duration-300" />
             </button>
          </div>
        </div>

        <div className="pt-10 space-y-4">
           <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800"></div>
           <p className="text-center text-[9px] font-black text-zinc-400 uppercase tracking-[0.6em] font-english opacity-40">
              Goti Node v3.4.5 Stable
           </p>
        </div>

      </div>
    </section>
  );
};

export default Profile;
