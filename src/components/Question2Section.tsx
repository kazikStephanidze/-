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
  BookOpen,
  FileText
} from 'lucide-react';
import { TAXES_DATA, TaxDetails } from '../data/taxesData';

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Вопрос 2 экзаменационного билета (100% полный текст)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Виды налогов Республики Беларусь: Полная выписка из конспекта и НК 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Все 12 листов тетради оцифрованы до единого слова: кто платит, кто освобожден, счета бухучета, нормирование, ставки и сроки
            </p>
          </div>
          <button
            onClick={handleCopyFull}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition self-start sm:self-center"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано!' : 'Копировать полную выписку'}
          </button>
        </div>

        {/* Horizontal Tax Badges Selector */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {TAXES_DATA.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaxId(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedTaxId === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-lg ring-1 ring-amber-400'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{t.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Complete Detailed Verbatim Notes (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  {getIcon(selectedTax.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-bold">
                      {selectedTax.sourceOfPayment}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Период: {selectedTax.period}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {selectedTax.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Complete Verbatim Transcript Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>ПОЛНАЯ ДОСЛОВНАЯ ВЫПИСКА ИЗ РУКОПИСНОГО КОНСПЕКТА (БЕЗ СОКРАЩЕНИЙ):</span>
              </div>
              <pre className="text-xs sm:text-sm font-sans text-slate-100 whitespace-pre-wrap leading-relaxed select-text">
                {selectedTax.fullVerbatimNotes}
              </pre>
            </div>

            {/* Structured Table: Rates */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Сводная таблица ставок по налогу (НК РБ 2026):
              </h4>
              <div className="overflow-hidden rounded-2xl border border-slate-800">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Срок подачи декларации:</span>
                </div>
                <p className="text-xs font-medium text-white leading-relaxed">
                  {selectedTax.declarationDeadline}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Срок уплаты налога:</span>
                </div>
                <p className="text-xs font-medium text-white leading-relaxed">
                  {selectedTax.paymentDeadline}
                </p>
              </div>
            </div>

            {/* Advance payment notice if present */}
            {selectedTax.advancePayments && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-2 mb-1 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>ОСОБЕННОСТЬ УПЛАТЫ АВАНСОВ:</span>
                </div>
                <p className="leading-relaxed text-slate-200">{selectedTax.advancePayments}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Watch Full Display Box (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-black border-2 border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-900 pb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Watch className="w-4 h-4" /> ДЛЯ СМАРТ-ЧАСОВ
              </span>
              <span className="text-slate-400">ПОЛНАЯ ШПОРА</span>
            </div>

            <div className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded w-fit uppercase">
              {selectedTax.shortName}
            </div>

            <h4 className="text-sm font-black text-white leading-tight">
              {selectedTax.name}
            </h4>

            {/* Full Dense Watch Text */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 text-[11px] leading-[1.45] text-slate-200 font-sans whitespace-pre-wrap">
              {selectedTax.watchDetailedText}
            </div>

            <div className="pt-2 text-[10px] text-slate-500 font-mono text-center">
              Текст подготовлен под приближение жестом на часах
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
