import React, { useState } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, Copy, Check, FileText, X } from 'lucide-react';
import { QUESTIONS_DATA, QuestionItem } from '../data/questionsData';

export const Question1Section: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = ['Все', 'Общая теория', 'Налоговая система', 'Контроль и администрирование', 'Виды налогов', 'Спецрежимы'];

  const filteredQuestions = QUESTIONS_DATA.filter((q) => {
    const matchesCategory = selectedCategory === 'Все' || q.category === selectedCategory;
    const matchesSearch = 
      q.id.toString() === searchTerm.trim() ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.fullText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.articles && q.articles.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (q: QuestionItem) => {
    const text = `Вопрос ${q.id}: ${q.title}${q.articles ? ` (${q.articles})` : ''}\n\n${q.fullText}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Вопрос 1 экзаменационного билета</span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight">
              48 теоретических вопросов программы (100% текст)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Полный текст утвержденных ответов Академии управления без сокращений
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 whitespace-nowrap font-bold">
              Все 48 билетов
            </span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-4 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по номеру (напр. 38) или слову (Лаффер, НДС)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition min-h-[42px]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-bold transition cursor-pointer min-h-[36px] flex items-center ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            Вопрос по вашему запросу не найден.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900 border-emerald-500/40 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-3.5 sm:p-5 cursor-pointer flex items-center justify-between gap-2.5 sm:gap-4 select-none"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-emerald-400 text-xs sm:text-sm shrink-0">
                      {q.id}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {q.category}
                        </span>
                        {q.articles && (
                          <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 truncate max-w-[180px]">
                            {q.articles}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-base font-bold text-white mt-1 leading-snug line-clamp-2 sm:line-clamp-none">
                        {q.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(q);
                      }}
                      title="Скопировать ответ"
                      className="p-2 sm:p-2.5 text-slate-400 hover:text-white active:scale-90 hover:bg-slate-800 rounded-xl transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                    >
                      {copiedId === q.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3 pb-4 sm:px-6 sm:pb-6 pt-1 border-t border-slate-800/80 space-y-3">
                    <div className="bg-slate-950 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          ПОЛНЫЙ ТЕКСТ ОТВЕТА (ДОСЛОВНО ИЗ УТВЕРЖДЕННЫХ ШПОР):
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans whitespace-pre-wrap break-words selection:bg-emerald-900 select-text">
                        {q.fullText}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleCopy(q)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium"
                      >
                        {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === q.id ? 'Скопировано в буфер!' : 'Скопировать весь билет'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
