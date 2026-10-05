import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Eye, 
  Copy, 
  Check,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { NOTEBOOK_PAGES, NOTEBOOK_EXPLANATION } from '../data/notebookData';

export const NotebookDecoderSection: React.FC = () => {
  const [selectedPageId, setSelectedPageId] = useState<string>('p3'); // Start with the lost sheet!
  const [copied, setCopied] = useState<boolean>(false);

  const selectedPage = NOTEBOOK_PAGES.find((p) => p.id === selectedPageId) || NOTEBOOK_PAGES[2];

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(selectedPage.transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Big Attention Banner for the Lost Sheet Solution */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Главная разгадка вопроса студента</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {NOTEBOOK_EXPLANATION.lostSheetTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Лист, начинающийся строкой <span className="text-amber-300 font-mono font-bold">«- кредиторская задолженность при ликвидации...»</span>, 
              и следующий за ним оборот с цифрами расчетов — это <strong>ПРЯМОЕ ПРОДОЛЖЕНИЕ ТЕМЫ «НАЛОГ НА ПРИБЫЛЬ»</strong> (завершение внереализационных доходов, внереализационные расходы, ставки и аванс 4-го квартала 2/3 от 3-го квартала)!
            </p>
          </div>
          <div className="bg-purple-900/40 border border-purple-500/30 p-3.5 rounded-2xl shrink-0 text-center">
            <div className="text-[10px] text-purple-300 font-mono uppercase font-bold">Принадлежность листа:</div>
            <div className="text-base font-black text-white mt-0.5">Глава 16 НК РБ</div>
            <div className="text-xs text-amber-400 font-semibold">Налог на прибыль</div>
          </div>
        </div>

        {/* Breakdown Box */}
        <div className="mt-5 bg-slate-950/80 border border-purple-500/20 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-3">
          <div className="font-bold text-amber-400 flex items-center gap-2 text-xs uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Почему возникло сомнение и как связываются листы:</span>
          </div>
          <p>
            На листе <strong>5339034886469262800</strong> в самом низу начался перечень <em>«Внереализационные доходы»</em>:
            штрафы контрагентов, проценты по займам, проценты банка на остаток счета, излишки инвентаризации... и лист оборвался.
          </p>
          <p>
            На следующем листе <strong>5339034886469262801</strong> первой же строкой идет пятый пункт этого же перечня:
            <span className="text-emerald-400 font-mono font-bold"> «- кредиторская задолженность при ликвидации организации...»</span> 
            (согласно ст. 174 НК РБ списание безнадежной кредиторки при ликвидации кредитора относится к внереализационным доходам).
          </p>
          <p>
            Сразу под ней на этом же листе записаны <em>«К внереализационным расходам относятся: 1) штрафы, 2) судебные расходы, 3) дебиторка с истекшим сроком, 4) дебиторка при ликвидации, 5) нереальная к взысканию»</em>, 
            а далее — ставки налога на прибыль (20%, 10%, 25%, 5%).
          </p>
          <p>
            А на обороте (<strong>5339034886469262802</strong>) записаны сроки: оплата до 22 числа и важнейшее правило: 
            <span className="text-amber-300 font-mono font-bold"> «За 4-й квартал уплачивается авансовый платеж в размере 2/3 от суммы платежа за 3 квартал»</span>!
          </p>
        </div>
      </div>

      {/* Complete Notebook Chronology Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm sm:text-base font-bold text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Точный хронологический порядок всех 12 листов тетради:</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {NOTEBOOK_EXPLANATION.chronologySummary.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                item.includes('ТОТ САМЫЙ ЛИСТ')
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 font-semibold'
                  : 'bg-slate-950 border-slate-800/80 text-slate-300'
              }`}
            >
              <span className="text-amber-400 font-mono font-bold">{idx + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Sheet Selector & Transcription View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: list of all 12 photos */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Выберите лист конспекта для просмотра:
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {NOTEBOOK_PAGES.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedPageId === page.id
                    ? page.id === 'p3' || page.id === 'p4'
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg'
                      : 'bg-slate-800 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-amber-400">{page.taxTheme}</span>
                  <span className="text-slate-500">{page.imageFileName.slice(0, 10)}...</span>
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {page.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detailed Transcription */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {selectedPage.taxTheme}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Файл: {selectedPage.imageFileName}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedPage.title}
                </h3>
              </div>

              <button
                onClick={handleCopyTranscript}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Скопировано!' : 'Копировать текст листа'}
              </button>
            </div>

            {/* Explanation card */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-sky-400 mr-1.5">Суть и контекст листа:</span>
              {selectedPage.explanation}
            </div>

            {/* High-fidelity Transcription Box */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Точная расшифровка рукописного текста (построчно):
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-emerald-900 selection:text-white">
                {selectedPage.transcription}
              </pre>
            </div>

            {/* Key takeaway bullets */}
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Ключевые факты с этого листа для экзамена:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPage.highlightPoints.map((pt, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg font-medium"
                  >
                    ✔ {pt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
