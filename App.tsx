
import React, { useState, useEffect, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PackageList from './components/PackageList';
import RamadanAd from './components/RamadanAd';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import QRScanner from './components/QRScanner';
import ActivePackagePanel from './components/ActivePackagePanel';
import { Language, Theme, User } from './types';
import { TRANSLATIONS, CONTACT_NUMBER } from './constants';
import { Zap, ShieldCheck, Banknote, Globe, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<Theme>('dark');
  const [currentPage, setCurrentPage] = useState<'home' | 'packages' | 'auth' | 'profile' | 'scan'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  // Initialize user from localStorage if exists
  useEffect(() => {
    const savedUser = localStorage.getItem('goti_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const timer = setTimeout(() => {
      setIsAppReady(true);
      document.body.classList.add('app-active');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('goti_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('goti_user');
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'bn' : 'en');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = (name: string, email: string, phone: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        name: name,
        email: email,
        phone: phone || CONTACT_NUMBER,
        activePackage: "Standard Trial Node",
        expiryTimestamp: Date.now() + 3600000 // 1 hour default trial
      });
      setIsLoading(false);
      setCurrentPage('home');
    }, 1200);
  };

  const handleNavigate = (page: 'home' | 'packages' | 'auth' | 'profile' | 'scan') => {
    if (page === 'profile' && !user) {
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
    const appContent = document.getElementById('app-content-inner');
    if (appContent) appContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const BenefitIcon = ({ type }: { type: string }) => {
    const iconClass = "text-red-600 transition-transform duration-500 group-hover:scale-110";
    switch(type) {
      case 'speed': return <Zap className={iconClass} size={32} />;
      case 'price': return <Banknote className={iconClass} size={32} />;
      case 'flex': return <ShieldCheck className={iconClass} size={32} />;
      default: return <Globe className={iconClass} size={32} />;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-6 bg-white dark:bg-zinc-950">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          <p className={`text-zinc-500 font-black uppercase tracking-widest text-[10px] ${lang === 'bn' ? 'font-bengali' : 'font-english'}`}>
            {lang === 'bn' ? 'সংযোগ স্থাপন করা হচ্ছে...' : 'Establishing Secure Connection...'}
          </p>
        </div>
      );
    }

    if (currentPage === 'scan') {
      return <QRScanner lang={lang} onClose={() => handleNavigate('home')} />;
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
        {(() => {
          switch (currentPage) {
            case 'home':
              return (
                <div className="space-y-0">
                  <Hero 
                    lang={lang} 
                    t={TRANSLATIONS[lang]} 
                    isLoggedIn={!!user}
                    onCta={() => handleNavigate('packages')} 
                    onLoginClick={() => handleNavigate('auth')}
                  />
                  
                  <ActivePackagePanel user={user} lang={lang} onNavigate={handleNavigate} />

                  <RamadanAd lang={lang} />

                  <section className="py-20 px-6 bg-white dark:bg-zinc-950 pb-40">
                    <div className="max-w-7xl mx-auto">
                      <div className="mb-12">
                          <span className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Core Technology</span>
                          <h2 className={`text-4xl md:text-6xl font-black leading-none text-zinc-900 dark:text-zinc-100 ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase italic tracking-tightest'}`}>
                            {lang === 'bn' ? 'কেন আমরা সেরা?' : 'Why Choose Goti?'}
                          </h2>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {(Object.entries(TRANSLATIONS[lang].benefits) as [string, { title: string; desc: string }][]).map(([key, benefit]) => (
                          <div key={key} className="bg-zinc-50 dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                            <div className="mb-8 p-4 bg-white dark:bg-zinc-800 rounded-2xl w-fit shadow-lg">
                              <BenefitIcon type={key} />
                            </div>
                            <h3 className={`text-xl font-black mb-3 text-zinc-900 dark:text-zinc-100 ${lang === 'bn' ? 'font-bengali' : 'font-english uppercase'}`}>
                              {benefit.title}
                            </h3>
                            <p className={`text-zinc-500 dark:text-zinc-400 text-sm ${lang === 'bn' ? 'font-bengali' : 'font-english'}`}>
                              {benefit.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              );
            case 'packages':
              return <div className="pb-40"><PackageList lang={lang} t={TRANSLATIONS[lang]} /></div>;
            case 'auth':
              return <Auth lang={lang} t={TRANSLATIONS[lang]} onLogin={handleLogin} />;
            case 'profile':
              return user ? (
                <div className="pb-40">
                  <Profile 
                    user={user} 
                    lang={lang} 
                    t={TRANSLATIONS[lang]} 
                    setUser={setUser} 
                    onThemeToggle={toggleTheme}
                    onLangToggle={toggleLanguage}
                    theme={theme}
                  />
                </div>
              ) : (
                <Auth lang={lang} t={TRANSLATIONS[lang]} onLogin={handleLogin} />
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'}`}>
      {currentPage !== 'scan' && (
        <Header 
          lang={lang} 
          theme={theme} 
          onLangToggle={toggleLanguage} 
          onThemeToggle={toggleTheme} 
          onNavigate={handleNavigate} 
          currentPage={currentPage}
          t={TRANSLATIONS[lang]}
        />
      )}
      
      <div id="app-content" className="flex-1 relative h-full overflow-hidden">
        <Suspense fallback={<div className="h-full flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-red-600 w-10 h-10" /></div>}>
          <div id="app-content-inner" className="h-full overflow-y-auto no-scrollbar">
            {renderContent()}
          </div>
        </Suspense>
      </div>

      {currentPage !== 'scan' && (
        <>
            <BottomNav 
              currentPage={currentPage === 'auth' ? 'profile' : currentPage} 
              onNavigate={handleNavigate} 
              lang={lang}
            />
            <Footer lang={lang} theme={theme} />
        </>
      )}
    </div>
  );
};

export default App;
