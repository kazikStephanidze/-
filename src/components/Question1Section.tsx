import React, { useState } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, Copy, Check, FileText } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Вопрос 1 экзаменационного билета (100% полный текст)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Полные ответы на 48 теоретических вопросов программы
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Дословный текст утвержденных ответов Академии управления без сокращений из утвержденных шпор
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/30 whitespace-nowrap font-bold">
              Все 48 билетов в базе
            </span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по номеру (напр. 38) или фразе (Лаффер, проверка, НДС)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="sm:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap font-bold transition ${
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
      <div className="space-y-3">
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
                className={`rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'bg-slate-900 border-emerald-500/40 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-emerald-400 text-sm shrink-0">
                      {q.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {q.category}
                        </span>
                        {q.articles && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            {q.articles}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                        {q.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(q);
                      }}
                      title="Скопировать ответ"
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      {copiedId === q.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details - Only full text, NO tasks */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          ПОЛНЫЙ ТЕКСТ ОТВЕТА (ДОСЛОВНО ИЗ УТВЕРЖДЕННЫХ ШПОР):
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans whitespace-pre-wrap selection:bg-emerald-900">
                        {q.fullText}
                      </div>
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
