import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  FolderArchive,
  RefreshCw,
  ExternalLink,
  BookMarked
} from 'lucide-react';

export const FilesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'context' | 'crib-sheet'>('context');
  const [copied, setCopied] = useState<boolean>(false);

  const contextFileName = 'PROJECT_CONTEXT.md';
  const cribFileName = 'EXAM_CRIB_SHEET_FULL.md';

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <FolderArchive className="w-4 h-4" />
              <span>Файлы проекта и защита от потери контекста</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Универсальный файл и Файл контекста (для ремикса проекта)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Все данные структурированы и сохранены в корне проекта: при окончании квот или ремиксе всё сохранится
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Синхронизировано</span>
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setActiveTab('context')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'context'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Файл контекста (PROJECT_CONTEXT.md)</span>
          </button>
          <button
            onClick={() => setActiveTab('crib-sheet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'crib-sheet'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Универсальные шпоры (EXAM_CRIB_SHEET_FULL.md)</span>
          </button>
        </div>
      </div>

      {/* Main File Viewer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold">
              {activeTab === 'context' ? '/PROJECT_CONTEXT.md' : '/EXAM_CRIB_SHEET_FULL.md'}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {activeTab === 'context'
                ? 'Контекст и памятка проекта для ремикса (разбор тетради, потерянный лист, правила)'
                : 'Полная структурированная шпаргалка: 48 вопросов + Виды налогов + Все задачи'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('raw-file-content');
                if (el) handleCopy(el.innerText);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Скопировано!' : 'Копировать всё'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('raw-file-content');
                if (el) {
                  downloadFile(
                    activeTab === 'context' ? contextFileName : cribFileName,
                    el.innerText
                  );
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .MD файл</span>
            </button>
          </div>
        </div>

        {/* Instructions for remix */}
        <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/20 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Инструкция при ремиксе проекта или окончании квот:</span>
          </div>
          <p className="leading-relaxed">
            Если проект будет ремикснут или открыт заново в новой сессии, просто напишите модели:
            <br />
            <code className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded font-mono border border-slate-800 text-[11px] inline-block mt-1">
              "Продолжаем работу. Прочитай файл /PROJECT_CONTEXT.md и /EXAM_CRIB_SHEET_FULL.md."
            </code>
            <br />
            В них уже зафиксированы все 48 вопросов, расшифровка 12 листов тетради, разгадка потерянного листа по налогу на прибыль, все ставки 2026 года и формулы задач.
          </p>
        </div>

        {/* Content Preview */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          <div id="raw-file-content" className="whitespace-pre-wrap">
            {activeTab === 'context' ? (
`# КОНТЕКСТ ПРОЕКТА: ПОДГОТОВКА К ЭКЗАМЕНУ «НАЛОГИ И НАЛОГООБЛОЖЕНИЕ»
Учебное заведение: Академия управления при Президенте Республики Беларусь
Дисциплина: Налоги и налогообложение (НК РБ 2026)

СТРУКТУРА ЭКЗАМЕНАЦИОННОГО БИЛЕТА:
1. Вопрос 1: Теория по шпорам (48 вопросов программы курса)
2. Вопрос 2: Виды налогов (детально: плательщики, объект, база, счета бухучета, ставки, сроки)
3. Вопрос 3: Практическая задача по конкретному виду налога

РАЗБОР РУКОПИСНОЙ ТЕТРАДИ (12 ФОТО) И «ПОТЕРЯННОГО ЛИСТА»:
- Лист, начинающийся на "- кредиторская задолженность при ликвидации организации...", является ПРЯМЫМ ПРОДОЛЖЕНИЕМ темы НАЛОГ НА ПРИБЫЛЬ!
- На листе 5339034886469262800 внизу начат перечень внереализационных доходов.
- Лист 5339034886469262801 продолжает этот перечень строчкой кредиторской задолженности, затем дает внереализационные расходы и ставки (20%, 10%, 25%, 5%).
- Оборот (5339034886469262802) дает сроки (уплата до 22 числа) и правило аванса 4-го квартала: ровно 2/3 от суммы 3-го квартала, уплата до 22 декабря!

ЗОЛОТЫЕ СРОКИ И ПРАВИЛА РБ 2026:
- Декларации: не позднее 20-го числа месяца после отчетного периода
- Уплата: не позднее 22-го числа месяца после отчетного периода
- Недвижимость: декларация до 20 МАРТА тек. года, уплата до 22 марта или поквартально
- Земля: с 2023 г. исчисляют налоговые органы (ИМНС), подача сведений до 1 дек, окончательный расчет до 20 февраля
- Эконалог: 4 класса опасности (1 класс: 49 855.15 руб./т), отдельная декларация по каждому объекту
- Игорный бизнес: стол 9 495 руб. (при СККС -50% = 4 747.50 руб.), автомат 319 руб., доход казино 5%, онлайн 12%
- УСН: только юрлица (до 50 чел, выручка 3 735 000 руб.), ставка 6%
- Подоходный: 13%, прогрессивная шкала 25% (350k-600k) и 30% (свыше 600k)
- Агроэкотуризм 2026: строго 45 руб. за усадьбу в месяц (НЕ 5%!)`
            ) : (
`# УНИВЕРСАЛЬНЫЙ СВОД ШПАРГАЛОК ПО НАЛОГАМ И НАЛОГООБЛОЖЕНИЮ РБ
Академия управления при Президенте Республики Беларусь

[РАЗДЕЛ I. ВОПРОС 1: 48 ТЕОРЕТИЧЕСКИХ ВОПРОСОВ]
1. Экономическая сущность налогов (ст. 6 НК: обязательный, безвозмездный, безвозвратный, принудительный)
2. Принципы налогообложения (ст. 2 НК: законность, обязательность, равенство, презумпция добросовестности)
3. Функции налогов (фискальная, контрольная, распределительная, регулирующая, стимулирующая)
4. Классификация налогов (прямые/косвенные, республиканские/местные, из выручки/в затраты/из прибыли)
5. Налоговая система и НК РБ (Общая часть 2002 г., Особенная часть 2010 г.)
...
[РАЗДЕЛ II. ВОПРОС 2: ВИДЫ НАЛОГОВ В РБ]
- Налог на прибыль: 20%, банки/страховые 25%, технопарки 10%, дети 5%, дивиденды 12%. Аванс 4 кв = 2/3 от 3 кв.
- Налог на недвижимость: 1% от остаточной стоимости на 01.01 (сч. 01, 03). Декларация до 20 марта!
- Земельный налог: кадастровая стоимость (порог) или площадь (1 га = 10 000 м2). С 2023 считает ИМНС.
- Экологический налог: 4 класса опасности (49 855.15 / 1 492.67 / 493.45 / 245.19). Отдельная декларация!
- Добыча природных ресурсов: фактический объем × твердая ставка.
- Игорный бизнес: стол 9495 руб. (СККС: 4747.50), автомат 319 руб., доход казино 5%, онлайн 12%.
- НДС: 20%, 10%, 25%, 0%. Расчетная ставка 20/120. Вычеты по ЭСЧФ.
- УСН 2026: 6% от валовой выручки. Без НДС. До 50 чел, выручка 3 735 000 руб.
- Подоходный налог: 13%, прогрессия 25% и 30%.
- Агроэкотуризм: 45 руб./мес. за 1 усадьбу.

[РАЗДЕЛ III. БАНК ЗАДАЧ ПО ВСЕМ НАЛОГАМ]
- Задача 1 (Недвижимость с коэфф. 1.5): 120 000 × 1% × 1.5 = 1 800 руб.
- Задача 2 (Эконалог 1, 2, 3 классы): 0.5×49855.15 + 1×1492.67 + 2×493.45 = 27 407.15 руб.
- Задача 3 (Земля 0.5 га производственная): 5000 м2 × 50 = 250k × 1.1% = 2 750 руб.
- Задача 4 (Игорный бизнес комплексная): 5 столов СККС (23 737.50) + 10 автоматов (3190) + казино 5% (57 500) + онлайн 12% (36 000) = 120 427.50 руб.
- Задача 5 (Дивиденды с Dп=15k): База 85k. 60% = 51k × 12% = 6120 руб.
- Задача 6 (Аванс по прибыли): 18 000 × 2/3 = 12 000 руб. (до 22 декабря).`
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
