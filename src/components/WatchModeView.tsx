import React, { useState, useRef, useEffect } from 'react';
import { 
  Watch, 
  Download, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Smartphone,
  Sliders,
  Maximize2
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
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [textSizeMode, setTextSizeMode] = useState<'micro' | 'standard' | 'large'>('micro');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

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

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, filteredCards.length]);

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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 2; // Retina 2x
      const padding = 24;
      const maxTextWidth = width - padding * 2;

      const baseFontSize = textSizeMode === 'micro' ? 12 : textSizeMode === 'standard' ? 14 : 16;
      ctx.font = `${baseFontSize}px system-ui, -apple-system, sans-serif`;

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
        50 +
        titleLines.length * (baseFontSize + 8) +
        bodyLines.length * lineHeight +
        (taskLines.length > 0 ? taskLines.length * lineHeight + 50 : 0) +
        40;

      const height = Math.max(watchShape === 'round' ? 500 : 600, calculatedHeight);

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // OLED Pure Black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      let curY = padding + 16;

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(currentCard.categoryTag.toUpperCase(), padding, curY);
      curY += 24;

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${baseFontSize + 4}px system-ui, sans-serif`;
      titleLines.forEach((tLine) => {
        ctx.fillText(tLine, padding, curY);
        curY += baseFontSize + 7;
      });
      curY += 4;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(currentCard.subtitle, padding, curY);
      curY += 20;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, curY);
      ctx.lineTo(width - padding, curY);
      ctx.stroke();
      curY += 16;

      ctx.fillStyle = '#e2e8f0';
      ctx.font = `${baseFontSize}px system-ui, sans-serif`;
      bodyLines.forEach((bLine) => {
        if (bLine === '') {
          curY += 8;
        } else {
          if (bLine.startsWith('•') || bLine.startsWith('✔') || bLine.startsWith('1.') || bLine.startsWith('2.')) {
            ctx.fillStyle = '#f59e0b';
          } else {
            ctx.fillStyle = '#e2e8f0';
          }
          ctx.fillText(bLine, padding, curY);
          curY += lineHeight;
        }
      });

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

      curY = height - padding;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText(currentCard.footerInfo, padding, curY);

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
    if (textSizeMode === 'micro') return 'text-[11px] leading-[1.4] sm:text-xs sm:leading-[1.45]';
    if (textSizeMode === 'large') return 'text-sm sm:text-base leading-relaxed';
    return 'text-xs sm:text-[13px] leading-relaxed';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Filter & Toolbar Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl backdrop-blur-md">
        {/* Section Title & Mobile Toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Watch className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Режим часов
                </span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono font-bold">
                  Кнопки Назад / Вперед
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white truncate">
                Карточки OLED для часов и экрана
              </h2>
            </div>
          </div>

          {/* Mobile Settings Toggle Button */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Настройки</span>
          </button>
        </div>

        {/* Category Filter Switcher (Horizontal scrollable on mobile) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          <button
            onClick={() => { setActiveCategory('all'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Все ({watchCards.length})
          </button>
          <button
            onClick={() => { setActiveCategory('q1'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'q1'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            В1: 48 Вопросов (48)
          </button>
          <button
            onClick={() => { setActiveCategory('q2'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'q2'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            В2: Налоги (11)
          </button>
          <button
            onClick={() => { setActiveCategory('q3'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'q3'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            В3: Задачи (10)
          </button>
        </div>

        {/* Collapsible / Responsive Controls Toolbar */}
        <div className={`mt-3 pt-3 border-t border-slate-800 flex-wrap items-center justify-between gap-2.5 text-xs ${
          showFiltersMobile ? 'flex' : 'hidden sm:flex'
        }`}>
          {/* Format Shape */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-medium text-[11px] sm:text-xs shrink-0">Вид:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setWatchShape('rect')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg transition text-[11px] sm:text-xs text-center font-bold whitespace-nowrap ${
                  watchShape === 'rect' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                Apple Watch
              </button>
              <button
                onClick={() => setWatchShape('round')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg transition text-[11px] sm:text-xs text-center font-bold whitespace-nowrap ${
                  watchShape === 'round' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                Круглые
              </button>
              <button
                onClick={() => setWatchShape('full')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg transition text-[11px] sm:text-xs text-center font-bold whitespace-nowrap ${
                  watchShape === 'full' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                Лист
              </button>
            </div>
          </div>

          {/* Text Size */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-medium text-[11px] sm:text-xs shrink-0">Шрифт:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 w-full sm:w-auto">
              <button
                onClick={() => setTextSizeMode('micro')}
                className={`flex-1 sm:flex-none px-2 py-1 rounded-lg transition text-[11px] font-bold ${
                  textSizeMode === 'micro' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Микро
              </button>
              <button
                onClick={() => setTextSizeMode('standard')}
                className={`flex-1 sm:flex-none px-2 py-1 rounded-lg transition text-[11px] font-bold ${
                  textSizeMode === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Стандарт
              </button>
              <button
                onClick={() => setTextSizeMode('large')}
                className={`flex-1 sm:flex-none px-2 py-1 rounded-lg transition text-[11px] font-bold ${
                  textSizeMode === 'large' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Крупный
              </button>
            </div>
          </div>

          {/* Interactive Zoom buttons */}
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 w-full sm:w-auto">
            <span className="text-slate-400 text-[11px]">Зум:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                className="p-1 hover:text-white text-slate-400 touch-manipulation min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                title="Уменьшить (до 25%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="text-[11px] font-mono text-amber-400 font-bold min-w-[34px] text-center hover:underline cursor-pointer"
                title="Нажмите для сброса на 100%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={() => setZoomLevel(Math.min(160, zoomLevel + 10))}
                className="p-1 hover:text-white text-slate-400 touch-manipulation min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                title="Увеличить (до 160%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Quick scale presets */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
              <button
                onClick={() => setZoomLevel(35)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                  zoomLevel <= 35 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Микро-масштаб 35%"
              >
                35%
              </button>
              <button
                onClick={() => setZoomLevel(50)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                  zoomLevel === 50 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="50%"
              >
                50%
              </button>
              <button
                onClick={() => setZoomLevel(75)}
                className={`hidden xs:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                  zoomLevel === 75 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="75%"
              >
                75%
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                  zoomLevel === 100 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="100%"
              >
                100%
              </button>
            </div>
          </div>

          {/* Action buttons (Copy + Download) */}
          <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
            <button
              onClick={handleCopyAll}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl transition text-xs min-h-[40px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl shadow-md transition text-xs min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Рендер...' : 'PNG на часы'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Watch Frame & Content Area */}
      <div className="flex flex-col items-center justify-center">
        {/* Navigation Bar (Above Card with Big Touch Hitboxes) */}
        <div className="flex items-center justify-between w-full max-w-2xl mb-3 px-1">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-xl sm:rounded-2xl text-slate-200 text-xs font-bold transition shadow-sm min-h-[44px]"
            aria-label="Предыдущая карточка"
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">Назад</span>
          </button>

          <div className="text-center px-2">
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30 whitespace-nowrap">
              {safeIndex + 1} / {filteredCards.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-xl sm:rounded-2xl text-slate-200 text-xs font-bold transition shadow-sm min-h-[44px]"
            aria-label="Следующая карточка"
          >
            <span className="hidden xs:inline">Вперед</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Watch Container */}
        <div className="w-full flex justify-center overflow-x-hidden py-1">
          <div
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              maxWidth: '100%'
            }}
            className="transition-transform duration-200 w-full flex justify-center"
          >
            <div
              className={`transition-all duration-300 w-full ${
                watchShape === 'round'
                  ? 'max-w-[330px] xs:max-w-[360px] sm:max-w-[440px] rounded-full border-[8px] sm:border-[12px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden p-5 sm:p-8 flex flex-col justify-start bg-black text-center'
                  : watchShape === 'rect'
                  ? 'max-w-[340px] xs:max-w-[370px] sm:max-w-[430px] rounded-[32px] sm:rounded-[44px] border-[8px] sm:border-[12px] border-slate-800 shadow-[0_0_70px_rgba(0,0,0,0.95)] overflow-hidden p-4 sm:p-6 bg-black relative ring-1 ring-slate-700/60'
                  : 'max-w-3xl bg-black border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl'
              }`}
            >
              {/* Top Watch Bar */}
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-500 mb-2 px-0.5 border-b border-slate-900 pb-1">
                <span className="text-emerald-400 font-bold">● 100% OLED</span>
                <span className="text-slate-400 font-medium truncate max-w-[140px]">Академия управления</span>
                <span className="text-amber-400 font-bold shrink-0">НК 2026</span>
              </div>

              {/* Content Container (OLED pure black #000000) */}
              <div ref={cardRef} className="space-y-2 sm:space-y-2.5 text-slate-100 text-left">
                {/* Category tag */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border uppercase tracking-wider truncate ${currentCard.badgeColor}`}
                  >
                    {currentCard.categoryTag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {safeIndex + 1}/{filteredCards.length}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xs sm:text-base font-black text-white leading-tight">
                    {currentCard.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                    {currentCard.subtitle}
                  </p>
                </div>

                {/* 100% Full Unabridged Text */}
                <div
                  className={`bg-slate-950/95 border border-slate-900 rounded-xl p-2.5 sm:p-3 font-sans text-slate-200 whitespace-pre-wrap break-words ${getTextClass()}`}
                >
                  {currentCard.fullBodyText}
                </div>

                {/* Task Section if present */}
                {currentCard.taskSection && (
                  <div className="bg-slate-950 border border-sky-500/30 rounded-xl p-2.5 sm:p-3 space-y-1.5 text-xs">
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
                  <span className="truncate mr-1">{currentCard.footerInfo}</span>
                  <span className="text-emerald-400 font-bold shrink-0">ПОЛНАЯ ШПОРА</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel quick jump bar */}
        <div className="w-full max-w-3xl mt-4 sm:mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1">
            <span className="text-[11px] sm:text-xs">Быстрый переход:</span>
            <span className="text-[11px] text-amber-400/80 font-mono">{filteredCards.length} билетов</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
            {filteredCards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCurrentIndex(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] ${
                  i === safeIndex
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-sm'
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
