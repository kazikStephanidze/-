import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Watch, 
  Download, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Layers,
  Sparkles,
  Sliders,
  RotateCw,
  RotateCcw,
  FileArchive,
  Search,
  X,
  CheckCircle2,
  FolderArchive,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QUESTIONS_DATA } from '../data/questionsData';
import { TAXES_DATA } from '../data/taxesData';
import { TASKS_DATA } from '../data/tasksData';
import { 
  UnifiedWatchCard, 
  WatchSlide, 
  splitCardIntoWatchSlides, 
  renderWatchSlideToCanvas, 
  downloadWatchScreensZip 
} from '../utils/watchSlideRenderer';

type DeviceMode = 'gw4_44' | 'gw4_40';

export const WatchModeView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'q1' | 'q2' | 'q3'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('gw4_44'); // 450x450 by default
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [textSizeMode, setTextSizeMode] = useState<'micro' | 'standard' | 'large'>('standard');
  const [copied, setCopied] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);
  const [showFullText, setShowFullText] = useState<boolean>(false);
  const [showZipModal, setShowZipModal] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ZIP download progress state
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number; percent: number; text: string }>({
    current: 0,
    total: 0,
    percent: 0,
    text: ''
  });

  const resolution: 450 | 396 = deviceMode === 'gw4_40' ? 396 : 450;

  // 1. Build unified card registry with focused, high-yield cheat sheets (keeps total screens <= 160, strictly under 200!)
  const allCards: UnifiedWatchCard[] = useMemo(() => {
    const list: UnifiedWatchCard[] = [];

    // Question 1: 48 Theory Tickets (~75 slides)
    QUESTIONS_DATA.forEach((q) => {
      list.push({
        id: `q1-${q.id}`,
        categoryTag: `В1 • Билет №${q.id}`,
        badgeColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
        title: q.title,
        subtitle: q.articles || 'Теоретический вопрос программы',
        fullBodyText: q.fullText,
        footerInfo: `В1 • Билет №${q.id} из 48 • Академия управления`
      });
    });

    // Question 2: Taxes using concise watch cheat sheet (~35 slides)
    TAXES_DATA.forEach((t) => {
      list.push({
        id: `q2-${t.id}`,
        categoryTag: `В2 • ${t.shortName}`,
        badgeColor: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
        title: t.name,
        subtitle: `Источник: ${t.sourceOfPayment} • База: ${t.taxBase.slice(0, 60)}...`,
        // Use watchDetailedText so taxes stay concise, bold, and strictly within the 200 screen limit
        fullBodyText: t.watchDetailedText,
        footerInfo: `В2 • Налоги РБ • ${t.shortName}`
      });
    });

    // Question 3: Calculation Tasks (~30 slides)
    TASKS_DATA.forEach((task, idx) => {
      list.push({
        id: `q3-${task.id}`,
        categoryTag: `В3 • Задача: ${task.category}`,
        badgeColor: 'text-sky-400 bg-sky-500/20 border-sky-500/40',
        title: task.title,
        subtitle: `Формула: ${task.formula}`,
        fullBodyText: `УСЛОВИЕ: ${task.condition}\n\nФОРМУЛА: ${task.formula}\n\nРАСЧЕТ:\n${task.steps.join('\n')}\n\nОТВЕТ: ${task.answer}`,
        taskSection: {
          title: task.title,
          condition: task.condition,
          solution: task.steps.join('\n'),
          answer: task.answer,
          howToSolve: task.howToSolveExplanation
        },
        footerInfo: `В3 • Задача ${idx + 1} из ${TASKS_DATA.length}`
      });
    });

    return list;
  }, []);

  // 2. Filter cards
  const filteredCards = useMemo(() => {
    let result = allCards;
    if (activeCategory === 'q1') result = result.filter(c => c.id.startsWith('q1-'));
    if (activeCategory === 'q2') result = result.filter(c => c.id.startsWith('q2-'));
    if (activeCategory === 'q3') result = result.filter(c => c.id.startsWith('q3-'));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.categoryTag.toLowerCase().includes(q) || 
        c.fullBodyText.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allCards, activeCategory, searchQuery]);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
  const currentCard: UnifiedWatchCard | undefined = filteredCards[safeIndex] || filteredCards[0];

  // 3. Compute distinct circular slides for current card (strict fit, zero clipping)
  const currentCardSlides: WatchSlide[] = useMemo(() => {
    if (!currentCard) return [];
    return splitCardIntoWatchSlides(currentCard, resolution, textSizeMode);
  }, [currentCard, resolution, textSizeMode]);

  const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, currentCardSlides.length - 1));
  const currentSlide: WatchSlide | undefined = currentCardSlides[safeSlideIndex];

  // Reset slide index when switching cards
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [safeIndex, activeCategory]);

  // Render current slide directly to canvas ref for 100% pixel-perfect WYSIWYG with 2x Retina supersampling (zero blurriness!)
  useEffect(() => {
    if (canvasRef.current && currentSlide) {
      const supersample = 2;
      const renderedCanvas = renderWatchSlideToCanvas(currentSlide, resolution, textSizeMode, supersample);
      const targetCtx = canvasRef.current.getContext('2d');
      if (targetCtx) {
        canvasRef.current.width = resolution * supersample;
        canvasRef.current.height = resolution * supersample;
        targetCtx.clearRect(0, 0, resolution * supersample, resolution * supersample);
        targetCtx.drawImage(renderedCanvas, 0, 0);
      }
    }
  }, [currentSlide, resolution, textSizeMode]);

  // Total slides count across all cards in current view (strictly <= 160)
  const totalSlidesInView = useMemo(() => {
    return filteredCards.reduce((acc, c) => {
      return acc + splitCardIntoWatchSlides(c, resolution, textSizeMode).length;
    }, 0);
  }, [filteredCards, resolution, textSizeMode]);

  // Total slides across the ENTIRE full curriculum
  const totalAllSlides = useMemo(() => {
    return allCards.reduce((acc, c) => {
      return acc + splitCardIntoWatchSlides(c, resolution, textSizeMode).length;
    }, 0);
  }, [allCards, resolution, textSizeMode]);

  // Navigation handlers (Simulating Galaxy Watch 4 Classic Rotating Bezel!)
  const handleNextSlide = () => {
    if (safeSlideIndex < currentCardSlides.length - 1) {
      setActiveSlideIndex(safeSlideIndex + 1);
    } else {
      if (safeIndex < filteredCards.length - 1) {
        setCurrentIndex(safeIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setActiveSlideIndex(0);
    }
  };

  const handlePrevSlide = () => {
    if (safeSlideIndex > 0) {
      setActiveSlideIndex(safeSlideIndex - 1);
    } else {
      if (safeIndex > 0) {
        const prevCard = filteredCards[safeIndex - 1];
        const prevSlides = splitCardIntoWatchSlides(prevCard, resolution, textSizeMode);
        setCurrentIndex(safeIndex - 1);
        setActiveSlideIndex(Math.max(0, prevSlides.length - 1));
      } else {
        const lastCard = filteredCards[filteredCards.length - 1];
        const lastSlides = splitCardIntoWatchSlides(lastCard, resolution, textSizeMode);
        setCurrentIndex(filteredCards.length - 1);
        setActiveSlideIndex(Math.max(0, lastSlides.length - 1));
      }
    }
  };

  const handleNextTicket = () => {
    setActiveSlideIndex(0);
    if (safeIndex < filteredCards.length - 1) {
      setCurrentIndex(safeIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevTicket = () => {
    setActiveSlideIndex(0);
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  // Keyboard navigation (Arrow keys & Wheel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextTicket();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevTicket();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, safeSlideIndex, currentCardSlides.length, filteredCards.length]);

  // Copy full text
  const handleCopy = () => {
    if (!currentCard) return;
    navigator.clipboard.writeText(`${currentCard.categoryTag}\n${currentCard.title}\n\n${currentCard.fullBodyText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download single 450x450 PNG
  const handleDownloadCurrentPNG = () => {
    if (!currentSlide) return;
    const canvas = renderWatchSlideToCanvas(currentSlide, resolution, textSizeMode, 1);
    const link = document.createElement('a');
    link.download = `gw4_${currentSlide.cardId}_slide${currentSlide.pageIndex + 1}of${currentSlide.totalPages}_${resolution}x${resolution}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Trigger ZIP download for specific category or full set
  const startZipExport = async (categoryFilter: 'all' | 'q1' | 'q2' | 'q3') => {
    let targetCards = allCards;
    let archiveTitle = 'GalaxyWatch4_Classic_VSE_SHPORY';

    if (categoryFilter === 'q1') {
      targetCards = allCards.filter(c => c.id.startsWith('q1-'));
      archiveTitle = 'GalaxyWatch4_Vopros1_48Biletov';
    } else if (categoryFilter === 'q2') {
      targetCards = allCards.filter(c => c.id.startsWith('q2-'));
      archiveTitle = 'GalaxyWatch4_Vopros2_Nalogi';
    } else if (categoryFilter === 'q3') {
      targetCards = allCards.filter(c => c.id.startsWith('q3-'));
      archiveTitle = 'GalaxyWatch4_Vopros3_Zadachi';
    }

    setIsExportingZip(true);
    setZipProgress({ current: 0, total: targetCards.length, percent: 0, text: 'Подготовка скринов...' });

    try {
      await downloadWatchScreensZip(
        targetCards,
        resolution,
        textSizeMode,
        archiveTitle,
        (current, total, statusText) => {
          const percent = Math.round((current / total) * 100);
          setZipProgress({ current, total, percent, text: statusText });
        }
      );
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsExportingZip(false);
      setShowZipModal(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Title, Model Indicator, and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Watch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Galaxy Watch 4 Classic
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  {resolution} × {resolution} px
                </span>
                <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Всего: {totalAllSlides} скринов (до 200)
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white">
                Шпоры для часов: четкий текст, крупный шрифт, не обрезается
              </h2>
            </div>
          </div>

          {/* Master ZIP Download Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowZipModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
              title="Скачать все скрины архивом в ZIP"
            >
              <FileArchive className="w-4 h-4" />
              <span>Скачать ZIP ({totalAllSlides} шт.)</span>
            </button>

            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 active:scale-95"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          <button
            onClick={() => { setActiveCategory('all'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Все билеты ({allCards.length})
          </button>
          <button
            onClick={() => { setActiveCategory('q1'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'q1'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            В1: 48 Билетов
          </button>
          <button
            onClick={() => { setActiveCategory('q2'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'q2'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            В2: Налоги
          </button>
          <button
            onClick={() => { setActiveCategory('q3'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] flex items-center ${
              activeCategory === 'q3'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            В3: Задачи
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
            placeholder="Поиск по номеру билета, налогу или формуле..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Device Settings Bar (Resolution, Text Size, Zoom) */}
        <div className={`mt-3 pt-3 border-t border-slate-800/80 flex-wrap items-center justify-between gap-2.5 text-xs ${
          showFiltersMobile ? 'flex' : 'hidden sm:flex'
        }`}>
          {/* Resolution / Watch Model */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Размер экрана:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 w-full sm:w-auto">
              <button
                onClick={() => setDeviceMode('gw4_44')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  deviceMode === 'gw4_44' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                44/46мм (450×450)
              </button>
              <button
                onClick={() => setDeviceMode('gw4_40')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  deviceMode === 'gw4_40' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                40/42мм (396×396)
              </button>
            </div>
          </div>

          {/* Text Size */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Шрифт:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 w-full sm:w-auto">
              <button
                onClick={() => setTextSizeMode('micro')}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  textSizeMode === 'micro' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Компактный (13px)
              </button>
              <button
                onClick={() => setTextSizeMode('standard')}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  textSizeMode === 'standard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Крупный (15px)
              </button>
              <button
                onClick={() => setTextSizeMode('large')}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  textSizeMode === 'large' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Максимум (17px)
              </button>
            </div>
          </div>

          {/* Visual Zoom */}
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 w-full sm:w-auto">
            <span className="text-slate-400 text-[11px]">Зум:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                className="p-1 hover:text-white text-slate-400 min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                title="Уменьшить зум"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="text-[11px] font-mono text-amber-400 font-bold min-w-[36px] text-center hover:underline cursor-pointer"
                title="Сбросить зум на 100%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={() => setZoomLevel(Math.min(160, zoomLevel + 10))}
                className="p-1 hover:text-white text-slate-400 min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                title="Увеличить зум"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ROTATING BEZEL SIMULATOR & WATCH SCREEN */}
      <div className="flex flex-col items-center justify-center">
        {/* Navigation Toolbar above Watch Face */}
        <div className="flex items-center justify-between w-full max-w-xl mb-3 px-2">
          {/* Previous Ticket */}
          <button
            onClick={handlePrevTicket}
            className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-xl text-slate-300 text-xs font-bold transition min-h-[40px] cursor-pointer"
            title="Предыдущий билет (Стрелка вверх)"
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">Пред. билет</span>
          </button>

          {/* Ticket Counter & Slide Pill */}
          <div className="text-center px-2 flex flex-col items-center">
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 whitespace-nowrap">
              Билет {safeIndex + 1} из {filteredCards.length}
            </span>
            {currentCardSlides.length > 1 && (
              <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                Экран {safeSlideIndex + 1} из {currentCardSlides.length}
              </span>
            )}
          </div>

          {/* Next Ticket */}
          <button
            onClick={handleNextTicket}
            className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-xl text-slate-300 text-xs font-bold transition min-h-[40px] cursor-pointer"
            title="Следующий билет (Стрелка вниз)"
          >
            <span className="hidden xs:inline">След. билет</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Watch Physical Case Container with Classic Rotating Bezel simulation */}
        <div className="w-full flex justify-center overflow-x-hidden py-2">
          <div
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              maxWidth: '100%'
            }}
            className="transition-transform duration-200 flex flex-col items-center"
          >
            {/* Galaxy Watch 4 Classic Physical Case */}
            <div className="relative flex items-center justify-center p-3 select-none">
              {/* Outer Stainless Steel Bezel with Hardware Ridges & Turning Controls */}
              <div 
                className="relative rounded-full aspect-square bg-[#0a0e17] border-[18px] border-[#1e2736] shadow-[0_0_90px_rgba(0,0,0,0.95),inset_0_0_20px_rgba(0,0,0,0.85)] ring-1 ring-slate-700/60 flex items-center justify-center w-[340px] h-[340px] xs:w-[390px] xs:h-[390px] sm:w-[460px] sm:h-[460px]"
              >
                {/* Physical Top Hardware Button (Home) */}
                <div 
                  className="absolute -right-[15px] top-[26%] w-[8px] h-[36px] bg-[#2a3446] rounded-r-md border-r-2 border-rose-500 shadow-md cursor-pointer hover:bg-slate-600 transition"
                  title="Кнопка Home (первый слайд)"
                  onClick={() => setActiveSlideIndex(0)}
                />

                {/* Physical Bottom Hardware Button (Back) */}
                <div 
                  className="absolute -right-[15px] bottom-[26%] w-[8px] h-[36px] bg-[#2a3446] rounded-r-md shadow-md cursor-pointer hover:bg-slate-600 transition"
                  title="Кнопка Back (предыдущий слайд)"
                  onClick={handlePrevSlide}
                />

                {/* Bezel Ring Tick Markers (Galaxy Watch 4 Classic authentic style) */}
                <div className="absolute inset-1 rounded-full border border-slate-700/40 pointer-events-none" />
                <div className="absolute top-1 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">▲ 60</div>
                <div className="absolute bottom-1 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">30</div>
                <div className="absolute left-2 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">45</div>
                <div className="absolute right-2 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">15</div>

                {/* INTERACTIVE ROTATING BEZEL CLICK ZONES */}
                {/* Left Bezel Half: Click to Turn Bezel Counter-Clockwise (Prev Screen) */}
                <button
                  onClick={handlePrevSlide}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-20 bg-slate-800/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-l-full border border-slate-700 flex items-center justify-center transition shadow-lg z-30 cursor-pointer active:scale-95 group"
                  title="Повернуть колесико назад (Предыдущий экран)"
                >
                  <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                </button>

                {/* Right Bezel Half: Click to Turn Bezel Clockwise (Next Screen) */}
                <button
                  onClick={handleNextSlide}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-20 bg-slate-800/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-r-full border border-slate-700 flex items-center justify-center transition shadow-lg z-30 cursor-pointer active:scale-95 group"
                  title="Повернуть колесико вперед (Следующий экран)"
                >
                  <RotateCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </button>

                {/* AMOLED Circular Display (Pure #000000, Retina 2x Super-Sampled Canvas for Razor Sharpness) */}
                <div className="w-full h-full rounded-full bg-black overflow-hidden relative flex items-center justify-center p-0 select-none">
                  <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: '100%' }}
                    className="w-full h-full rounded-full object-contain pointer-events-none shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Quick Helper Text below Watch Face */}
            <div className="mt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Колесико влево: Пред. экран</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <span>Колесико вправо: След. экран</span>
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              </span>
            </div>
          </div>
        </div>

        {/* 3. SLIDES PAGINATION STRIP (When a ticket has multiple screens) */}
        {currentCardSlides.length > 1 && (
          <div className="w-full max-w-xl mt-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Экраны этого билета ({currentCardSlides.length}):</span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {currentCardSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
                    activeSlideIndex === idx
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Экран {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. ACTIONS BAR: Copy & Single PNG Download */}
        <div className="w-full max-w-xl mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 border border-slate-800 rounded-xl transition min-h-[38px] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button
              onClick={() => setShowFullText(!showFullText)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-800 rounded-xl transition min-h-[38px] cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{showFullText ? 'Скрыть текст' : 'Весь текст'}</span>
              {showFullText ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCurrentPNG}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 rounded-xl transition min-h-[38px] cursor-pointer"
              title="Скачать текущий скрин в PNG"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Скрин (PNG)</span>
            </button>

            <button
              onClick={() => setShowZipModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 text-white font-bold rounded-xl shadow-lg transition min-h-[38px] cursor-pointer"
            >
              <FileArchive className="w-4 h-4" />
              <span>Скачать в ZIP</span>
            </button>
          </div>
        </div>

        {/* 5. COLLAPSIBLE FULL TEXT CARD (For easy reading/copying) */}
        {showFullText && currentCard && (
          <div className="w-full max-w-xl mt-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl text-left space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-amber-400">{currentCard.categoryTag}</span>
              <span className="text-[11px] text-slate-400">{currentCard.subtitle}</span>
            </div>
            <h4 className="text-sm font-black text-white">{currentCard.title}</h4>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {currentCard.fullBodyText}
            </div>
          </div>
        )}

        {/* 6. QUICK TICKET JUMPER */}
        <div className="w-full max-w-3xl mt-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1">
            <span className="text-[11px] sm:text-xs">Быстрый переход к билету:</span>
            <span className="text-[11px] text-amber-400 font-mono">{filteredCards.length} билетов в списке</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
            {filteredCards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setCurrentIndex(i); setActiveSlideIndex(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer min-h-[36px] ${
                  i === safeIndex
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {c.id.startsWith('q1-')
                  ? `В1-#${c.id.replace('q1-', '')}`
                  : c.id.startsWith('q2-')
                  ? `В2-${c.categoryTag.split('•')[1]?.trim().slice(0, 7)}`
                  : `В3-#${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7. MODAL: ZIP DOWNLOAD CENTER WITH REAL PROGRESS */}
      {showZipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Экспорт скринов для часов в ZIP
                  </h3>
                  <p className="text-xs text-slate-400">
                    Всего {totalAllSlides} скринов (лимит до 200 шт. строго соблюден)
                  </p>
                </div>
              </div>

              {!isExportingZip && (
                <button
                  onClick={() => setShowZipModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Active Exporting Progress Bar */}
            {isExportingZip ? (
              <div className="py-6 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-bold">Генерация архива для часов...</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    style={{ width: `${zipProgress.percent}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-100"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <span>Скрин {zipProgress.current} из {zipProgress.total}</span>
                  <span className="text-amber-400 font-bold">{zipProgress.percent}%</span>
                </div>

                <p className="text-[11px] text-slate-400 italic truncate max-w-sm mx-auto">
                  {zipProgress.text}
                </p>
              </div>
            ) : (
              /* Export Options */
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Все скрины отрендерены в четком высоком контрасте, не обрезаются снизу и укладываются в лимит до 200 картинок.
                </p>

                {/* Option 1: Full Pack */}
                <button
                  onClick={() => startZipExport('all')}
                  className="w-full text-left p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 hover:border-amber-400 rounded-2xl transition cursor-pointer active:scale-98 flex items-center justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-amber-300 group-hover:text-amber-200">
                        ⚡ Полный комплект (В1 + В2 + В3)
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        {totalAllSlides} скринов (до 200)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      48 билетов теории + 10 налогов + практические задачи
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-amber-400 shrink-0" />
                </button>

                {/* Option 2: Question 1 Only */}
                <button
                  onClick={() => startZipExport('q1')}
                  className="w-full text-left p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-98 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-400">
                      📘 Вопрос 1: 48 билетов программы
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Теория и статьи НК РБ 2026 (все 48 билетов)
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                {/* Option 3: Question 2 Only */}
                <button
                  onClick={() => startZipExport('q2')}
                  className="w-full text-left p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-98 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400">
                      📙 Вопрос 2: Налоги (шпоры для часов)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      НДС, налог на прибыль, недвижимость, экологический и др.
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                {/* Option 4: Question 3 Only */}
                <button
                  onClick={() => startZipExport('q3')}
                  className="w-full text-left p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl transition cursor-pointer active:scale-98 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-sky-400">
                      📗 Вопрос 3: Задачи с решениями
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Условия, формулы и пошаговые алгоритмы расчета
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
