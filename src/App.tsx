import React, { useState } from 'react';
import { 
  Watch, 
  BookOpen, 
  Building2, 
  Calculator, 
  FileText, 
  FolderArchive,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { WatchModeView } from './components/WatchModeView';
import { Question1Section } from './components/Question1Section';
import { Question2Section } from './components/Question2Section';
import { Question3Section } from './components/Question3Section';

export default function App() {
  const [activeTab, setActiveTab] = useState<'watch' | 'q1' | 'q2' | 'q3'>('watch');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Header / Branding */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Logo and Academic Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-xl shrink-0">
                <Watch className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Академия управления при Президенте РБ
                  </span>
                  <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-600" />
                  <span className="hidden sm:inline-block text-[11px] text-emerald-400 font-mono">
                    НК РБ 2026
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  Шпоры на часы: Налоги и налогообложение
                </h1>
              </div>
            </div>

            {/* Quick Status Badges */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Билет из 3 вопросов</span>
              </div>
              <button
                onClick={() => setActiveTab('watch')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition shadow-sm ${
                  activeTab === 'watch'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <Watch className="w-3.5 h-3.5" />
                <span>Режим часов (OLED)</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="mt-3.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
            <button
              onClick={() => setActiveTab('watch')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'watch'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Watch className="w-4 h-4" />
              <span>⌚ ДЛЯ СМАРТ-ЧАСОВ (Скриншоты)</span>
            </button>

            <button
              onClick={() => setActiveTab('q1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'q1'
                  ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Вопрос 1: 48 Вопросов (Шпоры)</span>
            </button>

            <button
              onClick={() => setActiveTab('q2')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'q2'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Вопрос 2: Виды налогов (Конспект)</span>
            </button>

            <button
              onClick={() => setActiveTab('q3')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'q3'
                  ? 'bg-sky-500 text-slate-950 shadow-md ring-1 ring-sky-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Вопрос 3: Задачи и Решатель</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'watch' && <WatchModeView />}
        {activeTab === 'q1' && <Question1Section />}
        {activeTab === 'q2' && <Question2Section />}
        {activeTab === 'q3' && <Question3Section />}
      </main>

      {/* Golden Exam Cheat Bar at Bottom */}
      <aside className="bg-slate-900 border-t border-slate-800 py-3 px-4">
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
    </div>
  );
}
