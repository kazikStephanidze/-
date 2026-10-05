import React, { useState } from 'react';
import { 
  Building2, 
  Building, 
  MapPin, 
  Trees, 
  Pickaxe, 
  Dices, 
  Receipt, 
  Percent, 
  User, 
  Coins, 
  Home,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Watch,
  FileText
} from 'lucide-react';
import { TAXES_DATA } from '../data/taxesData';

export const Question2Section: React.FC = () => {
  const [selectedTaxId, setSelectedTaxId] = useState<string>('profit-tax');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedTax = TAXES_DATA.find((t) => t.id === selectedTaxId) || TAXES_DATA[0];

  const getIcon = (id: string) => {
    switch (id) {
      case 'profit-tax': return <Building2 className="w-5 h-5 text-amber-400" />;
      case 'real-estate-tax': return <Building className="w-5 h-5 text-sky-400" />;
      case 'land-tax': return <MapPin className="w-5 h-5 text-emerald-400" />;
      case 'eco-tax': return <Trees className="w-5 h-5 text-green-400" />;
      case 'natural-resources-tax': return <Pickaxe className="w-5 h-5 text-amber-500" />;
      case 'gambling-tax': return <Dices className="w-5 h-5 text-purple-400" />;
      case 'vat': return <Receipt className="w-5 h-5 text-blue-400" />;
      case 'usn': return <Percent className="w-5 h-5 text-orange-400" />;
      case 'personal-income-tax': return <User className="w-5 h-5 text-rose-400" />;
      case 'dividends': return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'agro-tourism-tax': return <Home className="w-5 h-5 text-teal-400" />;
      default: return <Building2 className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleCopyFull = () => {
    const text = `НАЛОГ: ${selectedTax.name}\n\n${selectedTax.fullVerbatimNotes}\n\n[ДЛЯ ЧАСОВ]:\n${selectedTax.watchDetailedText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Вопрос 2 экзаменационного билета</span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight">
              Виды налогов Республики Беларусь (Выписка из конспекта и НК 2026)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Все 12 листов тетради до единого слова: кто платит, льготы, счета бухучета, ставки и сроки
            </p>
          </div>
          <button
            onClick={handleCopyFull}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition self-start sm:self-center min-h-[38px]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано!' : 'Копировать выписку'}
          </button>
        </div>

        {/* Horizontal Tax Selector (Touch-friendly & smoothly scrollable) */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {TAXES_DATA.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaxId(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                selectedTaxId === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{t.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Responsive 1-col on mobile, 12-cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Complete Detailed Verbatim Notes (8 cols) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          {/* Main Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  {getIcon(selectedTax.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-bold">
                      {selectedTax.sourceOfPayment}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                      Период: {selectedTax.period}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-black text-white mt-1 leading-snug">
                    {selectedTax.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Complete Verbatim Transcript Box */}
            <div className="bg-slate-950 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-500/30 space-y-2">
              <div className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 shrink-0" />
                <span>ПОЛНАЯ ДОСЛОВНАЯ ВЫПИСКА ИЗ РУКОПИСНОГО КОНСПЕКТА:</span>
              </div>
              <div className="text-xs sm:text-sm font-sans text-slate-100 whitespace-pre-wrap break-words leading-relaxed select-text">
                {selectedTax.fullVerbatimNotes}
              </div>
            </div>

            {/* 5 Distinct Sub-Objects of Taxation (specifically for Ecological Tax) */}
            {selectedTax.subObjects && selectedTax.subObjects.length > 0 && (
              <div className="bg-slate-950 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider">
                      Все 5 объектов налогообложения (разбивка по подпунктам):
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 self-start sm:self-auto font-bold">
                    Отдельная декларация по каждому объекту
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  {selectedTax.subObjects.map((sub) => (
                    <div 
                      key={sub.number}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2 hover:border-emerald-500/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                            {sub.number}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-white leading-snug">
                            {sub.title}
                          </h5>
                        </div>
                        {sub.number === 3 && (
                          <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded shrink-0">
                            Из скриншота конспекта
                          </span>
                        )}
                      </div>

                      {/* Tax Base */}
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-0.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                          Налогооблагаемая база (НО база):
                        </span>
                        <p className="text-slate-200 text-xs leading-relaxed">
                          {sub.taxBase}
                        </p>
                      </div>

                      {/* Non-Objects */}
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-rose-950/40 text-xs space-y-0.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-rose-400 block">
                          НЕ является объектом налогообложения (льготы / исключения):
                        </span>
                        <ul className="space-y-1 text-slate-300 text-xs pt-0.5">
                          {sub.nonObjects.map((noObj, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold shrink-0">•</span>
                              <span className="leading-snug">{noObj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {sub.notes && (
                        <div className="text-[11px] text-slate-400 pt-0.5 leading-snug">
                          <span className="text-slate-500 font-mono uppercase text-[10px] mr-1">Примечание:</span>
                          {sub.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Rates: Cards for Mobile, Table for Tablets/Desktop */}
            <div>
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Сводная таблица ставок по налогу (НК РБ 2026):
              </h4>

              {/* Mobile Rate Cards (<640px) */}
              <div className="sm:hidden space-y-2">
                {selectedTax.rates.map((rate, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white leading-snug">{rate.title}</span>
                      <span className="font-mono font-black text-amber-400 text-xs px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20 shrink-0">
                        {rate.value}
                      </span>
                    </div>
                    {rate.note && (
                      <p className="text-[11px] text-slate-400 leading-snug pt-0.5">{rate.note}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Tablet/Desktop Table (>=640px) */}
              <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="p-3.5">Категория / Субъект</th>
                      <th className="p-3.5 text-right">Ставка</th>
                      <th className="p-3.5">Комментарий / Примечание</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {selectedTax.rates.map((rate, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-slate-200">{rate.title}</td>
                        <td className="p-3.5 text-right font-mono font-black text-amber-400 text-sm whitespace-nowrap">
                          {rate.value}
                        </td>
                        <td className="p-3.5 text-slate-300 text-[11px]">{rate.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deadlines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Срок подачи декларации:</span>
                </div>
                <p className="text-xs font-medium text-white leading-relaxed">
                  {selectedTax.declarationDeadline}
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Срок уплаты налога:</span>
                </div>
                <p className="text-xs font-medium text-white leading-relaxed">
                  {selectedTax.paymentDeadline}
                </p>
              </div>
            </div>

            {/* Advance payment notice if present */}
            {selectedTax.advancePayments && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>ОСОБЕННОСТЬ УПЛАТЫ АВАНСОВ:</span>
                </div>
                <p className="leading-relaxed text-slate-200 text-xs">{selectedTax.advancePayments}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Watch Display Box (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-black border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500 border-b border-slate-900 pb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Watch className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ДЛЯ СМАРТ-ЧАСОВ
              </span>
              <span className="text-slate-400">ПОЛНАЯ ШПОРА</span>
            </div>

            <div className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded w-fit uppercase">
              {selectedTax.shortName}
            </div>

            <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
              {selectedTax.name}
            </h4>

            {/* Full Dense Watch Text */}
            <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-900 text-[11px] leading-[1.45] text-slate-200 font-sans whitespace-pre-wrap break-words">
              {selectedTax.watchDetailedText}
            </div>

            <div className="pt-1 text-[10px] text-slate-500 font-mono text-center">
              Текст подготовлен под приближение жестом на часах
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
