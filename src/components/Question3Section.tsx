import React, { useState } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  Copy, 
  Check, 
  HelpCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { TASKS_DATA } from '../data/tasksData';

export const Question3Section: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [activeTaskId, setActiveTaskId] = useState<string>('gambling-super-master');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['Все', 'Игорный бизнес', 'Налог на недвижимость', 'Экологический налог', 'Земельный налог', 'Дивиденды', 'Налог на прибыль', 'НДС', 'Агроэкотуризм'];

  const filteredTasks = TASKS_DATA.filter(
    (t) => selectedCategory === 'Все' || t.category === selectedCategory
  );

  const currentTask = TASKS_DATA.find((t) => t.id === activeTaskId) || filteredTasks[0] || TASKS_DATA[0];

  const handleCopyTask = () => {
    const text = `ЗАДАЧА: ${currentTask.title}\n\nУСЛОВИЕ:\n${currentTask.condition}\n\nКАК РЕШАТЬ САМОМУ:\n${currentTask.howToSolveExplanation}\n\nФОРМУЛА: ${currentTask.formula}\n\nРЕШЕНИЕ ПО ШАГАМ:\n${currentTask.steps.join('\n')}\n\nОТВЕТ: ${currentTask.answer}\n\nШПОРА ДЛЯ ЧАСОВ:\n${currentTask.watchDetailedCheat}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Вопрос 3 экзаменационного билета</span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight">
              Задачи экзамена по всем налогам (с полным разбором)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Разбор человеческим языком: что дано, какую формулу брать и как решать на экзамене
            </p>
          </div>
          <button
            onClick={handleCopyTask}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition self-start sm:self-center min-h-[38px]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано!' : 'Копировать задачу и разбор'}
          </button>
        </div>

        {/* Categories selector */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-bold transition cursor-pointer min-h-[36px] flex items-center ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Task Quick Selector (Horizontally scrollable at top on mobile) */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-1 font-medium">
          <span>Выберите задачу ({filteredTasks.length}):</span>
          <span className="text-sky-400 font-mono">1 тап для решения</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
          {filteredTasks.map((task, idx) => (
            <button
              key={task.id}
              onClick={() => setActiveTaskId(task.id)}
              className={`px-3.5 py-2 rounded-xl text-xs text-left whitespace-nowrap transition cursor-pointer shrink-0 min-h-[44px] flex flex-col justify-center ${
                activeTaskId === task.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md ring-1 ring-sky-300'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className={`text-[10px] font-mono uppercase ${activeTaskId === task.id ? 'text-slate-900' : 'text-sky-400'}`}>
                №{idx + 1} • {task.category}
              </span>
              <span className="truncate max-w-[200px]">{task.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Task Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Desktop Sidebar: Tasks list (hidden on mobile since horizontal scroller is used above) */}
        <div className="hidden lg:block lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Список типовых задач билетов ({filteredTasks.length}):
          </div>
          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredTasks.map((task, idx) => (
              <button
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                  activeTaskId === task.id
                    ? 'bg-sky-950/70 border-sky-400 text-white shadow-xl ring-1 ring-sky-400'
                    : 'bg-slate-900 hover:bg-slate-800/80 text-slate-400 border border-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono text-sky-400 uppercase font-bold mb-0.5">
                  №{idx + 1} • {task.category}
                </div>
                <div className="font-bold text-white text-xs leading-snug">
                  {task.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Solution & Pedagogical Explanation (Full width on mobile, 8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">
                {currentTask.category}
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-slate-400 font-medium">
                Формула: <code className="text-amber-300 font-bold">{currentTask.formula}</code>
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-white leading-tight">
              {currentTask.title}
            </h3>

            {/* Condition Box */}
            <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
              <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>УСЛОВИЕ ЗАДАЧИ:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                {currentTask.condition}
              </p>
            </div>

            {/* HOW TO SOLVE - Step by step pedagogical explanation */}
            <div className="bg-sky-950/40 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-sky-500/40 space-y-2">
              <div className="text-[11px] sm:text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>КАК ЭТО РЕШАТЬ САМОМУ (ПОЯСНЕНИЕ):</span>
              </div>
              <div className="text-xs sm:text-sm font-sans text-slate-100 whitespace-pre-wrap break-words leading-relaxed select-text">
                {currentTask.howToSolveExplanation}
              </div>
            </div>

            {/* Step-by-step Math Solution */}
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>МАТЕМАТИЧЕСКИЙ РАСЧЕТ ПО ДЕЙСТВИЯМ:</span>
              </div>
              <div className="space-y-1.5 bg-slate-950 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                {currentTask.steps.map((st, i) => (
                  <p key={i} className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed break-words">
                    {st}
                  </p>
                ))}
              </div>
            </div>

            {/* Final Answer & Watch Cheat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">ИТОГОВЫЙ ОТВЕТ:</div>
                <div className="text-sm sm:text-base md:text-lg font-black text-white font-mono mt-0.5 break-words">
                  {currentTask.answer}
                </div>
              </div>

              <div className="bg-black border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1">
                  ⌚ ДЛЯ СКРИНШОТА НА ЧАСЫ:
                </div>
                <div className="text-[11px] sm:text-xs font-mono text-slate-200 leading-snug whitespace-pre-wrap break-words">
                  {currentTask.watchDetailedCheat}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
