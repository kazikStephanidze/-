import React, { useState, useRef } from 'react';
import { 
  Watch, 
  Download, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  FileText,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { QUESTIONS_DATA } from '../data/questionsData';
import { TAXES_DATA } from '../data/taxesData';
import { TASKS_DATA } from '../data/tasksData';

interface UnifiedWatchCard {
  id: string;
  categoryTag: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  fullBodyText: string;
  taskSection?: {
    title: string;
    condition: string;
    solution: string;
    answer: string;
    howToSolve?: string;
  };
  footerInfo: string;
}

export const WatchModeView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'q1' | 'q2' | 'q3'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [watchShape, setWatchShape] = useState<'rect' | 'round' | 'full'>('rect');
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 80%, 100%, 125%, 150%
  const [textSizeMode, setTextSizeMode] = useState<'micro' | 'standard' | 'large'>('micro'); // 'micro' for dense watch crib
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Compile unified complete cards for Watch Mode
  const watchCards: UnifiedWatchCard[] = [];

  // Question 1 cards (48 items with full text)
  QUESTIONS_DATA.forEach((q) => {
    watchCards.push({
      id: `q1-${q.id}`,
      categoryTag: `Вопрос 1 • Билет №${q.id}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      title: q.title,
      subtitle: q.articles || 'Теоретический вопрос программы',
      fullBodyText: q.fullText,
      footerInfo: `Вопрос 1 из 3 • №${q.id} из 48 • Академия управления РБ`
    });
  });

  // Question 2 cards (Taxes with full verbatim notes)
  TAXES_DATA.forEach((t) => {
    watchCards.push({
      id: `q2-${t.id}`,
      categoryTag: `Вопрос 2 • ${t.shortName}`,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      title: t.name,
      subtitle: `Источник уплаты: ${t.sourceOfPayment} • Период: ${t.period}`,
      fullBodyText: t.watchDetailedText + '\n\n' + t.fullVerbatimNotes,
      footerInfo: `Вопрос 2 из 3 • Налог из конспекта • Академия управления РБ`
    });
  });

  // Question 3 cards (Tasks with how to solve explanation)
  TASKS_DATA.forEach((task, idx) => {
    watchCards.push({
      id: `q3-${task.id}`,
      categoryTag: `Вопрос 3 • Задача: ${task.category}`,
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      title: task.title,
      subtitle: `Формула: ${task.formula}`,
      fullBodyText: `${task.howToSolveExplanation}\n\nПОШАГОВЫЙ РАСЧЕТ:\n${task.steps.join('\n')}\n\nОТВЕТ: ${task.answer}\n\nШПОРА ДЛЯ ЧАСОВ:\n${task.watchDetailedCheat}`,
      footerInfo: `Вопрос 3 из 3 • Задача ${idx + 1} из ${TASKS_DATA.length} • Академия управления РБ`
    });
  });

  // Filter
  const filteredCards = watchCards.filter((c) => {
    if (activeCategory === 'q1') return c.id.startsWith('q1-');
    if (activeCategory === 'q2') return c.id.startsWith('q2-');
    if (activeCategory === 'q3') return c.id.startsWith('q3-');
    return true;
  });

  const safeIndex = Math.min(currentIndex, filteredCards.length - 1);
  const currentCard = filteredCards[safeIndex] || filteredCards[0];

  const handleNext = () => {
    if (safeIndex < filteredCards.length - 1) {
      setCurrentIndex(safeIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleCopyAll = () => {
    if (!currentCard) return;
    const text = `[${currentCard.categoryTag}] ${currentCard.title}\n${currentCard.subtitle}\n\n${currentCard.fullBodyText}\n\n${currentCard.taskSection ? `ЗАДАЧА:\n${currentCard.taskSection.condition}\nРешение: ${currentCard.taskSection.solution}\nОтвет: ${currentCard.taskSection.answer}\nПояснение: ${currentCard.taskSection.howToSolve}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High-res Canvas export for smartwatch screenshots (Retina 2x, OLED Pure Black)
  const handleDownloadPNG = async () => {
    if (!currentCard) return;
    setDownloading(true);

    try {
      const width = watchShape === 'round' ? 500 : 440;
      // Calculate dynamic height to fit FULL text without cutting
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 2; // Retina 2x
      const padding = 24;
      const maxTextWidth = width - padding * 2;

      // Font styling
      const baseFontSize = textSizeMode === 'micro' ? 12 : textSizeMode === 'standard' ? 14 : 16;
      ctx.font = `${baseFontSize}px system-ui, -apple-system, sans-serif`;

      // Helper function to measure and wrap text lines
      const wrapText = (text: string, maxWidth: number): string[] => {
        const lines: string[] = [];
        const paragraphs = text.split('\n');
        paragraphs.forEach((p) => {
          if (!p.trim()) {
            lines.push('');
            return;
          }
          const words = p.split(' ');
          let currentLine = '';
          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
              lines.push(currentLine);
              currentLine = words[i] + ' ';
            } else {
              currentLine = testLine;
            }
          }
          lines.push(currentLine);
        });
        return lines;
      };

      const titleLines = wrapText(currentCard.title, maxTextWidth);
      const bodyLines = wrapText(currentCard.fullBodyText, maxTextWidth);
      const taskLines = currentCard.taskSection
        ? wrapText(
            `ЗАДАЧА:\n${currentCard.taskSection.condition}\nРЕШЕНИЕ: ${currentCard.taskSection.solution}\nОТВЕТ: ${currentCard.taskSection.answer}\nПОЯСНЕНИЕ: ${currentCard.taskSection.howToSolve}`,
            maxTextWidth
          )
        : [];

      const lineHeight = baseFontSize + 6;
      const calculatedHeight =
        padding * 2 +
        50 + // Header tag & subtitle
        titleLines.length * (baseFontSize + 8) +
        bodyLines.length * lineHeight +
        (taskLines.length > 0 ? taskLines.length * lineHeight + 50 : 0) +
        40; // Footer

      const height = Math.max(watchShape === 'round' ? 500 : 600, calculatedHeight);

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Background OLED Pure Black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      let curY = padding + 16;

      // Category Tag Badge
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(currentCard.categoryTag.toUpperCase(), padding, curY);
      curY += 24;

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${baseFontSize + 4}px system-ui, sans-serif`;
      titleLines.forEach((tLine) => {
        ctx.fillText(tLine, padding, curY);
        curY += baseFontSize + 7;
      });
      curY += 4;

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(currentCard.subtitle, padding, curY);
      curY += 20;

      // Divider line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, curY);
      ctx.lineTo(width - padding, curY);
      ctx.stroke();
      curY += 16;

      // Full Body Text
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `${baseFontSize}px system-ui, sans-serif`;
      bodyLines.forEach((bLine) => {
        if (bLine === '') {
          curY += 8;
        } else {
          // Highlight key prefixes
          if (bLine.startsWith('•') || bLine.startsWith('✔') || bLine.startsWith('1.') || bLine.startsWith('2.')) {
            ctx.fillStyle = '#f59e0b';
          } else {
            ctx.fillStyle = '#e2e8f0';
          }
          ctx.fillText(bLine, padding, curY);
          curY += lineHeight;
        }
      });

      // Task Box if present
      if (taskLines.length > 0) {
        curY += 12;
        ctx.fillStyle = '#0c4a6e';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding - 4, curY, maxTextWidth + 8, taskLines.length * lineHeight + 20);

        curY += 18;
        ctx.fillStyle = '#38bdf8';
        ctx.font = `bold ${baseFontSize}px system-ui, sans-serif`;
        ctx.fillText('💡 ПРАКТИЧЕСКАЯ ЗАДАЧА И РЕШЕНИЕ:', padding, curY);
        curY += lineHeight;

        ctx.font = `${baseFontSize - 1}px system-ui, sans-serif`;
        ctx.fillStyle = '#f8fafc';
        taskLines.forEach((tLine) => {
          if (tLine.includes('ОТВЕТ:')) {
            ctx.fillStyle = '#34d399';
            ctx.font = `bold ${baseFontSize}px system-ui, sans-serif`;
          } else {
            ctx.fillStyle = '#f1f5f9';
            ctx.font = `${baseFontSize - 1}px system-ui, sans-serif`;
          }
          ctx.fillText(tLine, padding, curY);
          curY += lineHeight;
        });
      }

      // Footer
      curY = height - padding;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText(currentCard.footerInfo, padding, curY);

      // Download trigger
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `shpora-full-${currentCard.id}.png`;
      link.href = imageUri;
      link.click();
    } catch (e) {
      console.error('Screenshot download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  const getTextClass = () => {
    if (textSizeMode === 'micro') return 'text-[11px] leading-[1.45]';
    if (textSizeMode === 'large') return 'text-[15px] leading-[1.6]';
    return 'text-[13px] leading-[1.5]';
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Watch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Режим часов с полной информацией (НЕ обрезано!)
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Поддерживает ZOOM
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                100% полный текст для скриншотов на смарт-часы
              </h2>
            </div>
          </div>

          {/* Question Filter Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setActiveCategory('all'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Все ({watchCards.length})
            </button>
            <button
              onClick={() => { setActiveCategory('q1'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === 'q1'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              В1: 48 Вопросов (полные)
            </button>
            <button
              onClick={() => { setActiveCategory('q2'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === 'q2'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              В2: Виды налогов (конспект)
            </button>
            <button
              onClick={() => { setActiveCategory('q3'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === 'q3'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              В3: Задачи (с пояснениями)
            </button>
          </div>
        </div>

        {/* Toolbar: Text Size, Watch Format, Download */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Format Shape */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Формат:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setWatchShape('rect')}
                className={`px-3 py-1 rounded-lg transition ${
                  watchShape === 'rect' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Apple Watch
              </button>
              <button
                onClick={() => setWatchShape('round')}
                className={`px-3 py-1 rounded-lg transition ${
                  watchShape === 'round' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Galaxy Watch (Круг)
              </button>
              <button
                onClick={() => setWatchShape('full')}
                className={`px-3 py-1 rounded-lg transition ${
                  watchShape === 'full' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Полноэкранный лист
              </button>
            </div>
          </div>

          {/* Density / Font Size */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Плотность текста:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setTextSizeMode('micro')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  textSizeMode === 'micro' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
                title="Максимум текста на 1 экран, приближается жестом на часах"
              >
                Микро-шпора (под ЗУМ)
              </button>
              <button
                onClick={() => setTextSizeMode('standard')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  textSizeMode === 'standard' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Стандарт
              </button>
              <button
                onClick={() => setTextSizeMode('large')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  textSizeMode === 'large' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Крупный
              </button>
            </div>
          </div>

          {/* Interactive Zoom buttons inside web view */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <span className="text-slate-400 text-[11px]">Зум:</span>
            <button
              onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
              className="p-1 hover:text-white text-slate-400"
              title="Уменьшить"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-amber-400 font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(180, zoomLevel + 15))}
              className="p-1 hover:text-white text-slate-400"
              title="Увеличить"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Рендер...' : 'Скачать скриншот PNG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Watch Frame Area */}
      <div className="flex flex-col items-center justify-center py-2">
        {/* Navigation bar */}
        <div className="flex items-center justify-between w-full max-w-2xl mb-4 px-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-300 text-xs font-bold transition shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </button>
          <div className="text-center">
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
              Карточка {safeIndex + 1} из {filteredCards.length}
            </span>
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-300 text-xs font-bold transition shadow-sm"
          >
            Вперед <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Watch Bezel Screen */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200"
        >
          <div
            className={`transition-all duration-300 ${
              watchShape === 'round'
                ? 'w-[450px] min-h-[500px] rounded-full border-[12px] border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden p-8 flex flex-col justify-start bg-black'
                : watchShape === 'rect'
                ? 'w-[380px] sm:w-[430px] min-h-[580px] rounded-[44px] border-[14px] border-slate-800 shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-hidden p-6 bg-black relative ring-1 ring-slate-700/60'
                : 'w-full max-w-3xl bg-black border-2 border-slate-800 rounded-3xl p-6 shadow-2xl'
            }`}
          >
            {/* Top Watch Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2.5 px-1 border-b border-slate-900 pb-1">
              <span className="text-emerald-400 font-bold">● 100% OLED</span>
              <span className="text-slate-400 font-medium">Академия управления</span>
              <span className="text-amber-400 font-bold">РБ 2026</span>
            </div>

            {/* Content Container (OLED pure black #000000) */}
            <div ref={cardRef} className="space-y-2.5 text-slate-100">
              {/* Category tag */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${currentCard.badgeColor}`}
                >
                  {currentCard.categoryTag}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {safeIndex + 1}/{filteredCards.length}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  {currentCard.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {currentCard.subtitle}
                </p>
              </div>

              {/* 100% Full Unabridged Text */}
              <div
                className={`bg-slate-950/90 border border-slate-900 rounded-xl p-3 font-sans text-slate-200 whitespace-pre-wrap ${getTextClass()}`}
              >
                {currentCard.fullBodyText}
              </div>

              {/* Task Section if present */}
              {currentCard.taskSection && (
                <div className="bg-slate-950 border border-sky-500/30 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                    <span>💡 {currentCard.taskSection.title}:</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {currentCard.taskSection.condition}
                  </p>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300">
                    <span className="text-slate-400 font-sans mr-1">Решение:</span>
                    {currentCard.taskSection.solution}
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-0.5">
                    <span className="font-bold text-white">
                      Ответ: <span className="font-mono text-amber-300">{currentCard.taskSection.answer}</span>
                    </span>
                  </div>
                  {currentCard.taskSection.howToSolve && (
                    <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-900 leading-tight">
                      <span className="text-sky-300 font-semibold">Пояснение: </span>
                      {currentCard.taskSection.howToSolve}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 border-t border-slate-900 text-[9px] text-slate-500 flex items-center justify-between font-mono">
                <span>{currentCard.footerInfo}</span>
                <span className="text-emerald-400 font-bold">ПОЛНАЯ ВЫПИСКА</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel quick jump bar */}
        <div className="w-full max-w-3xl mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span>Быстрый переход к билету или налогу:</span>
            <span>{filteredCards.length} карточек</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredCards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCurrentIndex(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition ${
                  i === safeIndex
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {c.id.startsWith('q1-')
                  ? `В1-#${c.id.replace('q1-', '')}`
                  : c.id.startsWith('q2-')
                  ? `В2-${c.categoryTag.split('•')[1]?.trim().slice(0, 8)}`
                  : `В3-#${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
