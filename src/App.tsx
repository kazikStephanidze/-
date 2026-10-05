import React, { useState } from 'react';
import { 
  Watch, 
  BookOpen, 
  Building2, 
  Calculator, 
  GraduationCap,
  Clock,
  Calendar,
  X,
  ChevronUp
} from 'lucide-react';
import { WatchModeView } from './components/WatchModeView';
import { Question1Section } from './components/Question1Section';
import { Question2Section } from './components/Question2Section';
import { Question3Section } from './components/Question3Section';

export default function App() {
  const [activeTab, setActiveTab] = useState<'watch' | 'q1' | 'q2' | 'q3'>('watch');
  const [showDatesSheet, setShowDatesSheet] = useState<boolean>(false);

  const tabs = [
    { id: 'watch', label: 'Часы (OLED)', icon: Watch, accent: 'text-amber-400', activeBg: 'bg-amber-500 text-slate-950' },
    { id: 'q1', label: 'В1: 48 Билетов', icon: BookOpen, accent: 'text-emerald-400', activeBg: 'bg-emerald-500 text-slate-950' },
    { id: 'q2', label: 'В2: Налоги РБ', icon: Building2, accent: 'text-amber-400', activeBg: 'bg-amber-500 text-slate-950' },
    { id: 'q3', label: 'В3: Задачи', icon: Calculator, accent: 'text-sky-400', activeBg: 'bg-sky-500 text-slate-950' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Header / Branding (Optimized for Mobile & Desktop) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-2">
            {/* Logo and Academic Info */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black text-lg sm:text-xl shrink-0">
                <Watch className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1 truncate">
                    <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">Академия управления</span>
                  </span>
                  <span className="hidden xs:inline-block w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] text-emerald-400 font-mono shrink-0">
                    НК 2026
                  </span>
                </div>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight truncate">
                  Шпоры: Налоги и налогообложение
                </h1>
              </div>
            </div>

            {/* Quick Status and Exam Dates Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setShowDatesSheet(!showDatesSheet)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition"
                title="Показать ключевые даты экзамена"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Даты</span>
                <span className="text-[10px] font-mono bg-amber-500/20 px-1 py-0.2 rounded">20-22</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs for Tablet / Desktop (Hidden on small mobile where bottom bar is used) */}
          <nav className="hidden md:flex mt-3 gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? `${tab.activeBg} shadow-md`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Floating Exam Dates Drawer / Dropdown */}
      {showDatesSheet && (
        <div className="sticky top-[53px] sm:top-[61px] z-30 bg-amber-950/95 border-b border-amber-500/40 px-3 sm:px-6 py-2.5 backdrop-blur-lg shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-200">
              <span className="font-bold text-amber-300 flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5" /> ДАТЫ:
              </span>
              <span>Декларации — <strong>до 20-го</strong></span>
              <span className="hidden sm:inline text-amber-500/40">•</span>
              <span>Уплата — <strong>до 22-го</strong></span>
              <span className="hidden sm:inline text-amber-500/40">•</span>
              <span>Аванс 4 кв по прибыли — <strong>2/3 от 3-го кв (до 22 дек)</strong></span>
              <span className="hidden md:inline text-amber-500/40">•</span>
              <span className="hidden md:inline">Недвижимость — <strong>декларация до 20 марта</strong></span>
            </div>
            <button
              onClick={() => setShowDatesSheet(false)}
              className="p-1 rounded-lg hover:bg-amber-900/50 text-amber-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Content with Mobile Bottom Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-28 md:pb-8">
        {activeTab === 'watch' && <WatchModeView />}
        {activeTab === 'q1' && <Question1Section />}
        {activeTab === 'q2' && <Question2Section />}
        {activeTab === 'q3' && <Question3Section />}
      </main>

      {/* Desktop Golden Exam Bar at Bottom */}
      <aside className="hidden md:block bg-slate-900 border-t border-slate-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-amber-400">⚡ ЭКЗАМЕНАЦИОННЫЕ ДАТЫ:</span>
            <span>Декларации — <strong>до 20-го числа</strong></span>
            <span>•</span>
            <span>Уплата налогов — <strong>до 22-го числа</strong></span>
            <span>•</span>
            <span>Аванс 4 кв по прибыли — <strong>2/3 от 3-го кв (до 22 дек)</strong></span>
            <span>•</span>
            <span>Недвижимость — <strong>декларация до 20 марта</strong></span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Академия управления РБ • 2026
          </div>
        </div>
      </aside>

      {/* Fixed Bottom Mobile Tab Bar (Thumb-Zone Navigation) */}
      <nav 
        aria-label="Мобильная навигация" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.7)] pb-safe"
      >
        <div className="grid grid-cols-4 items-center h-16 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition active:scale-95 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-10 h-7 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? tab.id === 'watch'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : tab.id === 'q1'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : tab.id === 'q2'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                    isActive ? 'text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {tab.id === 'watch' ? 'Часы' : tab.id === 'q1' ? 'В1: Билеты' : tab.id === 'q2' ? 'В2: Налоги' : 'В3: Задачи'}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
