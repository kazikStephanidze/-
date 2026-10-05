import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  HelpCircle,
  BookOpen,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { TASKS_DATA, DetailedExamTask } from '../data/tasksData';

export const Question3Section: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [activeTaskId, setActiveTaskId] = useState<string>('gambling-super-master');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['Все', 'Игорный бизнес', 'Налог на недвижимость', 'Экологический налог', 'Земельный налог', 'Дивиденды', 'Налог на прибыль', 'НДС', 'Агроэкотуризм'];

  const filteredTasks = TASKS_DATA.filter(
    (t) => selectedCategory === 'Все' || t.category === selectedCategory
  );

  const currentTask = TASKS_DATA.find((t) => t.id === activeTaskId) || TASKS_DATA[0];

  const handleCopyTask = () => {
    const text = `ЗАДАЧА: ${currentTask.title}\n\nУСЛОВИЕ:\n${currentTask.condition}\n\nКАК РЕШАТЬ САМОМУ:\n${currentTask.howToSolveExplanation}\n\nФОРМУЛА: ${currentTask.formula}\n\nРЕШЕНИЕ ПО ШАГАМ:\n${currentTask.steps.join('\n')}\n\nОТВЕТ: ${currentTask.answer}\n\nШПОРА ДЛЯ ЧАСОВ:\n${currentTask.watchDetailedCheat}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/20 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4" />
              <span>Вопрос 3 экзаменационного билета (Задачи с полным разбором)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Конкретные примеры задач по всем видам налогов с пояснениями
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Подробнейший разбор человеческим языком: что дано, какую формулу брать и как решать самому на экзамене
            </p>
          </div>
          <button
            onClick={handleCopyTask}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition self-start sm:self-center"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано!' : 'Копировать задачу и разбор'}
          </button>
        </div>

        {/* Categories selector */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap font-bold transition ${
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

      {/* Main Grid: Task Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tasks list buttons (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Список типовых задач билетов ({filteredTasks.length}):
          </div>
          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition ${
                  activeTaskId === task.id
                    ? 'bg-sky-950/70 border-sky-400 text-white shadow-xl ring-1 ring-sky-400'
                    : 'bg-slate-900 hover:bg-slate-800/80 text-slate-400 border border-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono text-sky-400 uppercase font-bold mb-0.5">
                  {task.category}
                </div>
                <div className="font-bold text-white text-xs leading-snug">
                  {task.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Solution & How to Solve (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">
                {currentTask.category}
              </span>
              <span className="text-xs font-mono text-slate-400 font-medium">
                Формула: <code className="text-amber-300">{currentTask.formula}</code>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              {currentTask.title}
            </h3>

            {/* Condition Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>УСЛОВИЕ ЗАДАЧИ:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                {currentTask.condition}
              </p>
            </div>

            {/* HOW TO SOLVE - Step by step pedagogical explanation */}
            <div className="bg-sky-950/40 p-5 rounded-2xl border border-sky-500/40 space-y-2">
              <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>КАК ЭТО РЕШАТЬ САМОМУ (ПОЯСНЕНИЕ ДЛЯ ЧАЙНИКОВ):</span>
              </div>
              <pre className="text-xs sm:text-sm font-sans text-slate-100 whitespace-pre-wrap leading-relaxed select-text">
                {currentTask.howToSolveExplanation}
              </pre>
            </div>

            {/* Step-by-step Math Solution */}
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>МАТЕМАТИЧЕСКИЙ РАСЧЕТ ПО ДЕЙСТВИЯМ:</span>
              </div>
              <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {currentTask.steps.map((st, i) => (
                  <p key={i} className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                    {st}
                  </p>
                ))}
              </div>
            </div>

            {/* Final Answer & Watch Cheat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">ИТОГОВЫЙ ОТВЕТ:</div>
                <div className="text-base sm:text-lg font-black text-white font-mono mt-1">
                  {currentTask.answer}
                </div>
              </div>

              <div className="bg-black border border-slate-800 rounded-2xl p-4">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1">
                  ⌚ ДЛЯ СКРИНШОТА НА ЧАСЫ:
                </div>
                <div className="text-xs font-mono text-slate-200 leading-snug whitespace-pre-wrap">
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
