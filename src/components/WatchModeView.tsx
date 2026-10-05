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
  ChevronUp,
  Apple,
  ShieldCheck,
  ExternalLink,
  Share2,
  Send,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import { QUESTIONS_DATA } from '../data/questionsData';
import { TAXES_DATA } from '../data/taxesData';
import { TASKS_DATA } from '../data/tasksData';
import { 
  UnifiedWatchCard, 
  WatchSlide, 
  WatchDeviceType,
  WATCH_CONFIGS,
  splitCardIntoWatchSlides, 
  renderWatchSlideToCanvas, 
  downloadWatchScreensZip 
} from '../utils/watchSlideRenderer';

export const WatchModeView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'q1' | 'q2' | 'q3'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [deviceMode, setDeviceMode] = useState<WatchDeviceType>('gw4_44'); // Default Galaxy Watch 4 44mm
  const [exportQuality, setExportQuality] = useState<2 | 1>(2); // Default 2x Ultra HD for laser-sharp text
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [textSizeMode, setTextSizeMode] = useState<'micro' | 'standard' | 'large'>('standard');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedZipLink, setCopiedZipLink] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);
  const [showFullText, setShowFullText] = useState<boolean>(false);
  const [showZipModal, setShowZipModal] = useState<boolean>(false);
  
  // Completed ZIP state for Telegram Mini App and manual saving
  const [completedZip, setCompletedZip] = useState<{
    blob: Blob;
    filename: string;
    url: string;
    serverDownloadUrl?: string;
    count: number;
  } | null>(null);

  // Single PNG preview/save modal for Telegram users
  const [previewImageModal, setPreviewImageModal] = useState<{
    dataUrl: string;
    filename: string;
    blob: Blob;
    serverUrl?: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect Telegram Mini App Webview
  const isTelegram = useMemo(() => {
    return typeof window !== 'undefined' && Boolean(
      (window as any).Telegram?.WebApp?.initData || 
      /Telegram/i.test(navigator.userAgent)
    );
  }, []);

  // Initialize Telegram WebApp if present
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      try {
        (window as any).Telegram.WebApp.ready();
        (window as any).Telegram.WebApp.expand();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Open site in system browser (Safari/Chrome) to bypass Telegram in-app webview limitations
  const handleOpenExternalBrowser = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      if ((window as any).Telegram?.WebApp?.openLink) {
        (window as any).Telegram.WebApp.openLink(currentUrl, { try_instant_view: false });
      } else {
        window.open(currentUrl, '_blank');
      }
    }
  };

  // Active device config
  const currentConfig = WATCH_CONFIGS[deviceMode] || WATCH_CONFIGS.gw4_44;
  const currentExportWidth = currentConfig.width * exportQuality;
  const currentExportHeight = currentConfig.height * exportQuality;

  // ZIP download progress state
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number; percent: number; text: string }>({
    current: 0,
    total: 0,
    percent: 0,
    text: ''
  });

  // 1. Build unified card registry with focused, high-yield cheat sheets (strictly <= 160-175 screens, under 200!)
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
        fullBodyText: t.watchDetailedText,
        footerInfo: `В2 • Налоги РБ • ${t.shortName}`
      });
    });

    // Question 3: Calculation Tasks (~25 slides)
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

  // 3. Compute distinct slides for current card
  const currentCardSlides: WatchSlide[] = useMemo(() => {
    if (!currentCard) return [];
    return splitCardIntoWatchSlides(currentCard, deviceMode, textSizeMode);
  }, [currentCard, deviceMode, textSizeMode]);

  const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, currentCardSlides.length - 1));
  const currentSlide: WatchSlide | undefined = currentCardSlides[safeSlideIndex];

  // Reset slide index when switching cards or device
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [safeIndex, activeCategory, deviceMode]);

  // Render current slide directly to canvas ref with 2x Retina supersampling (zero blurriness!)
  useEffect(() => {
    if (canvasRef.current && currentSlide) {
      const supersample = 2;
      const renderedCanvas = renderWatchSlideToCanvas(currentSlide, deviceMode, textSizeMode, supersample);
      const targetCtx = canvasRef.current.getContext('2d');
      if (targetCtx) {
        canvasRef.current.width = currentConfig.width * supersample;
        canvasRef.current.height = currentConfig.height * supersample;
        targetCtx.clearRect(0, 0, currentConfig.width * supersample, currentConfig.height * supersample);
        targetCtx.drawImage(renderedCanvas, 0, 0);
      }
    }
  }, [currentSlide, deviceMode, textSizeMode, currentConfig.width, currentConfig.height]);

  // Total slides count across all cards in current view
  const totalSlidesInView = useMemo(() => {
    return filteredCards.reduce((acc, c) => {
      return acc + splitCardIntoWatchSlides(c, deviceMode, textSizeMode).length;
    }, 0);
  }, [filteredCards, deviceMode, textSizeMode]);

  // Total slides across the ENTIRE full curriculum
  const totalAllSlides = useMemo(() => {
    return allCards.reduce((acc, c) => {
      return acc + splitCardIntoWatchSlides(c, deviceMode, textSizeMode).length;
    }, 0);
  }, [allCards, deviceMode, textSizeMode]);

  // Navigation handlers (Simulating Rotating Bezel / Apple Digital Crown!)
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
        const prevSlides = splitCardIntoWatchSlides(prevCard, deviceMode, textSizeMode);
        setCurrentIndex(safeIndex - 1);
        setActiveSlideIndex(Math.max(0, prevSlides.length - 1));
      } else {
        const lastCard = filteredCards[filteredCards.length - 1];
        const lastSlides = splitCardIntoWatchSlides(lastCard, deviceMode, textSizeMode);
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

  // Keyboard navigation
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

  // Download single PNG with Telegram & Web Share API support
  const handleDownloadCurrentPNG = async () => {
    if (!currentSlide) return;
    const canvas = renderWatchSlideToCanvas(currentSlide, deviceMode, textSizeMode, exportQuality);
    const filename = `${deviceMode}_${currentSlide.cardId}_slide${currentSlide.pageIndex + 1}of${currentSlide.totalPages}_${currentExportWidth}x${currentExportHeight}_UltraHD.png`;
    const dataUrl = canvas.toDataURL('image/png');

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      let serverUrl: string | undefined = undefined;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'image/png',
            'X-Filename': encodeURIComponent(filename),
          },
          body: blob,
        });
        if (res.ok) {
          const data = await res.json();
          serverUrl = data.imageUrl;
        }
      } catch (e) {
        console.warn('Image upload note:', e);
      }

      // Open image preview modal (allows easy saving to Photos on mobile & Telegram)
      setPreviewImageModal({
        dataUrl,
        filename,
        blob,
        serverUrl,
      });

      // Standard desktop download trigger
      if (!isTelegram) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = serverUrl || url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    }, 'image/png');
  };

  // Trigger ZIP download for specific category or full set in 2x Ultra HD
  const startZipExport = async (categoryFilter: 'all' | 'q1' | 'q2' | 'q3') => {
    let targetCards = allCards;
    let archiveTitle = deviceMode === 'apple_44' ? 'AppleWatch44mm_VSE_SHPORY' : 'GalaxyWatch4_Classic_VSE_SHPORY';

    if (categoryFilter === 'q1') {
      targetCards = allCards.filter(c => c.id.startsWith('q1-'));
      archiveTitle = `${deviceMode}_Vopros1_48Biletov`;
    } else if (categoryFilter === 'q2') {
      targetCards = allCards.filter(c => c.id.startsWith('q2-'));
      archiveTitle = `${deviceMode}_Vopros2_Nalogi`;
    } else if (categoryFilter === 'q3') {
      targetCards = allCards.filter(c => c.id.startsWith('q3-'));
      archiveTitle = `${deviceMode}_Vopros3_Zadachi`;
    }

    setIsExportingZip(true);
    setCompletedZip(null);
    setZipProgress({ current: 0, total: targetCards.length, percent: 0, text: 'Подготовка Ultra HD скринов...' });

    try {
      const result = await downloadWatchScreensZip(
        targetCards,
        deviceMode,
        textSizeMode,
        archiveTitle,
        exportQuality,
        (current, total, statusText) => {
          const percent = Math.round((current / total) * 100);
          setZipProgress({ current, total, percent, text: statusText });
        }
      );

      if (result) {
        setCompletedZip({
          blob: result.blob,
          filename: result.filename,
          url: result.url,
          serverDownloadUrl: result.serverDownloadUrl,
          count: targetCards.length
        });
      }
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  // 1. Download via Telegram client native download API
  const handleTelegramDownload = () => {
    if (!completedZip) return;
    const downloadLink = completedZip.serverDownloadUrl || completedZip.url;

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.downloadFile && completedZip.serverDownloadUrl) {
      try {
        tg.downloadFile(
          { url: completedZip.serverDownloadUrl, file_name: completedZip.filename },
          (status: boolean) => {
            console.log('Telegram download response:', status);
          }
        );
        return;
      } catch (e) {
        console.warn('tg.downloadFile failed:', e);
      }
    }

    // Fallback: open link directly
    if (tg?.openLink) {
      tg.openLink(downloadLink, { try_instant_view: false });
    } else {
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = completedZip.filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // 2. Open download in external mobile browser (Safari / Chrome)
  const handleOpenDirectBrowserDownload = () => {
    if (!completedZip) return;
    const targetUrl = completedZip.serverDownloadUrl || completedZip.url;
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.openLink) {
      tg.openLink(targetUrl, { try_instant_view: false });
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  // 3. Send direct download link to Telegram Saved Messages (Избранное)
  const handleSendToTelegramChat = () => {
    if (!completedZip) return;
    const link = completedZip.serverDownloadUrl || window.location.href;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Шпаргалка для смарт-часов (${completedZip.filename})`)}`;
    
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else if (tg?.openLink) {
      tg.openLink(shareUrl, { try_instant_view: false });
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  // 4. Copy direct ZIP download URL to clipboard
  const handleCopyZipLink = () => {
    if (!completedZip) return;
    const link = completedZip.serverDownloadUrl || completedZip.url;
    navigator.clipboard.writeText(link);
    setCopiedZipLink(true);
    setTimeout(() => setCopiedZipLink(false), 3000);
  };

  // 5. System Share Sheet (iOS / Android)
  const handleSystemShare = async () => {
    if (!completedZip) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        const file = new File([completedZip.blob], completedZip.filename, { type: 'application/zip' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Шпоры ${currentConfig.shortName}`,
            text: `Архив ${completedZip.count} скринов для часов (${completedZip.filename})`
          });
          return;
        }
      }
    } catch (e) {
      console.log('File share cancelled or not allowed:', e);
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Шпоры ${currentConfig.shortName}`,
          text: `Архив скринов для часов: ${completedZip.filename}`,
          url: completedZip.serverDownloadUrl || completedZip.url
        });
        return;
      }
    } catch (e) {
      console.log('URL share cancelled:', e);
    }

    // Direct download trigger fallback
    handleTelegramDownload();
  };

  // Telegram MainButton integration: sync with completed ZIP
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.MainButton) return;

    if (showZipModal && completedZip) {
      tg.MainButton.setText('СКАЧАТЬ АРХИВ (ZIP)');
      tg.MainButton.show();
      tg.MainButton.enable();
      const onMainBtnClick = () => {
        handleTelegramDownload();
      };
      tg.MainButton.onClick(onMainBtnClick);
      return () => {
        tg.MainButton.offClick(onMainBtnClick);
        tg.MainButton.hide();
      };
    } else {
      tg.MainButton.hide();
    }
  }, [showZipModal, completedZip]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Telegram Mini App Warning / Helper Banner if inside Telegram */}
      {isTelegram && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-3 sm:p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <div>
              <span className="font-bold text-white">Вы открыли приложение внутри Telegram.</span>
              <p className="text-[11px] text-amber-300/90 mt-0.5">
                Telegram блокирует прямое сохранение файлов в память. Для скачивания архива используйте кнопку «Сохранить / Поделиться» или откройте в Safari/Chrome:
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenExternalBrowser}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl whitespace-nowrap cursor-pointer active:scale-95 transition shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Открыть в браузере</span>
          </button>
        </div>
      )}

      {/* 1. TOP CONTROL BAR */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Title, Model Indicator, and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0 ${
              deviceMode === 'apple_44'
                ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-rose-500/20'
                : 'bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-amber-500/20'
            }`}>
              {deviceMode === 'apple_44' ? <Apple className="w-5 h-5" /> : <Watch className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  deviceMode === 'apple_44' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {currentConfig.name}
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  {currentExportWidth} × {currentExportHeight} px (Ultra HD 2x)
                </span>
                <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Всего: {totalAllSlides} скринов (до 200)
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white">
                Шпоры для {deviceMode === 'apple_44' ? 'Apple Watch 44мм' : 'Galaxy Watch 4'}: кристальная четкость
              </h2>
            </div>
          </div>

          {/* Master ZIP Download Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowZipModal(true); setCompletedZip(null); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
              title="Скачать все скрины в архиве ZIP высокого разрешения"
            >
              <FileArchive className="w-4 h-4" />
              <span>Скачать ZIP ({totalAllSlides} шт. • Ultra HD)</span>
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

        {/* Device Settings Bar (Model, Quality, Text Size, Zoom) */}
        <div className={`mt-3 pt-3 border-t border-slate-800/80 flex-wrap items-center justify-between gap-2.5 text-xs ${
          showFiltersMobile ? 'flex' : 'hidden sm:flex'
        }`}>
          {/* Target Watch Model Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Модель часов:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setDeviceMode('apple_44')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  deviceMode === 'apple_44' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Apple className="w-3 h-3" />
                <span>Apple Watch 44мм</span>
              </button>
              <button
                onClick={() => setDeviceMode('gw4_44')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                  deviceMode === 'gw4_44' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Galaxy Watch 4 (44мм)
              </button>
              <button
                onClick={() => setDeviceMode('gw4_40')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                  deviceMode === 'gw4_40' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                GW4 40мм
              </button>
            </div>
          </div>

          {/* Export Quality Toggle (Ultra HD 2x vs Standard 1x) */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Качество:</span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 w-full sm:w-auto">
              <button
                onClick={() => setExportQuality(2)}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  exportQuality === 2 ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="2x Retina Ultra HD — максимальная резкость и читаемость"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Ultra HD (2x)</span>
              </button>
              <button
                onClick={() => setExportQuality(1)}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  exportQuality === 1 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="1x стандартное разрешение дисплея"
              >
                1x Стандарт
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
                13px
              </button>
              <button
                onClick={() => setTextSizeMode('standard')}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  textSizeMode === 'standard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                15px
              </button>
              <button
                onClick={() => setTextSizeMode('large')}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  textSizeMode === 'large' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                17px
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

      {/* 2. PHYSICAL WATCH CASING & HARDWARE CONTROLS */}
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

        {/* Watch Container with Zoom Scale */}
        <div className="w-full flex justify-center overflow-x-hidden py-2">
          <div
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              maxWidth: '100%'
            }}
            className="transition-transform duration-200 flex flex-col items-center"
          >
            {/* A. APPLE WATCH 44MM PHYSICAL BODY (Rectangular Rounded OLED, Digital Crown) */}
            {deviceMode === 'apple_44' ? (
              <div className="relative flex items-center justify-center p-3 select-none">
                <div 
                  className="relative rounded-[48px] bg-[#0c1017] border-[16px] border-[#1b2230] shadow-[0_0_90px_rgba(0,0,0,0.95),inset_0_0_20px_rgba(0,0,0,0.85)] ring-1 ring-slate-700/60 flex items-center justify-center w-[310px] h-[378px] xs:w-[340px] xs:h-[414px] sm:w-[380px] sm:h-[462px]"
                >
                  {/* Apple Watch Digital Crown */}
                  <div 
                    className="absolute -right-[14px] top-[20%] w-[12px] h-[48px] bg-gradient-to-r from-[#2a3446] to-[#161d2a] rounded-r-lg border-y border-r border-slate-600 shadow-xl cursor-pointer hover:brightness-125 transition flex items-center justify-center active:scale-95 group"
                    title="Коронка Digital Crown Apple Watch (кликните для следующего экрана)"
                    onClick={handleNextSlide}
                  >
                    <div className="w-[3px] h-[32px] rounded-full bg-rose-500/80 group-hover:bg-rose-400 transition" />
                  </div>

                  {/* Apple Watch Side Button */}
                  <div 
                    className="absolute -right-[11px] bottom-[28%] w-[8px] h-[46px] bg-[#222a38] rounded-r-md border-r border-slate-600 shadow-md cursor-pointer hover:bg-slate-600 transition active:scale-95"
                    title="Боковая кнопка Apple Watch (предыдущий экран)"
                    onClick={handlePrevSlide}
                  />

                  {/* Left Side: Speaker Slots */}
                  <div className="absolute -left-[10px] top-[36%] w-[4px] h-[32px] bg-[#05070a] rounded-l-sm border-l border-slate-700 pointer-events-none" />

                  {/* Navigation click zones */}
                  <button
                    onClick={handlePrevSlide}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-18 bg-slate-800/80 hover:bg-rose-500 text-slate-300 hover:text-white rounded-l-2xl border border-slate-700 flex items-center justify-center transition shadow-lg z-30 cursor-pointer active:scale-95 group"
                    title="Digital Crown вверх (Предыдущий экран)"
                  >
                    <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-18 bg-slate-800/80 hover:bg-rose-500 text-slate-300 hover:text-white rounded-r-2xl border border-slate-700 flex items-center justify-center transition shadow-lg z-30 cursor-pointer active:scale-95 group"
                    title="Digital Crown вниз (Следующий экран)"
                  >
                    <RotateCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  </button>

                  {/* AMOLED Display: Exact 368x448 Retina 2x Canvas */}
                  <div className="w-full h-full rounded-[34px] bg-black overflow-hidden relative flex items-center justify-center p-0 select-none">
                    <canvas
                      ref={canvasRef}
                      style={{ width: '100%', height: '100%' }}
                      className="w-full h-full rounded-[34px] object-contain pointer-events-none shadow-inner"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* B. GALAXY WATCH 4 CLASSIC PHYSICAL BODY (True 1:1 Circle with Hardware Bezel) */
              <div className="relative flex items-center justify-center p-3 select-none">
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

                  {/* Bezel Ring Tick Markers */}
                  <div className="absolute inset-1 rounded-full border border-slate-700/40 pointer-events-none" />
                  <div className="absolute top-1 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">▲ 60</div>
                  <div className="absolute bottom-1 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">30</div>
                  <div className="absolute left-2 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">45</div>
                  <div className="absolute right-2 text-[8px] font-mono text-slate-500 font-bold pointer-events-none">15</div>

                  {/* Bezel rotation buttons */}
                  <button
                    onClick={handlePrevSlide}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-20 bg-slate-800/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-l-full border border-slate-700 flex items-center justify-center transition shadow-lg z-30 cursor-pointer active:scale-95 group"
                    title="Повернуть колесико назад (Предыдущий экран)"
                  >
                    <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-20 bg-slate-800/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-r-full border border-slate-700 flex items-center justify-center transition shadow-lg z-30 cursor-pointer active:scale-95 group"
                    title="Повернуть колесико вперед (Следующий экран)"
                  >
                    <RotateCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  </button>

                  {/* AMOLED Circular Display */}
                  <div className="w-full h-full rounded-full bg-black overflow-hidden relative flex items-center justify-center p-0 select-none">
                    <canvas
                      ref={canvasRef}
                      style={{ width: '100%', height: '100%' }}
                      className="w-full h-full rounded-full object-contain pointer-events-none shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Helper Text below Watch Face */}
            <div className="mt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>{deviceMode === 'apple_44' ? 'Digital Crown вверх: Пред.' : 'Колесико влево: Пред.'}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <span>{deviceMode === 'apple_44' ? 'Digital Crown вниз: След.' : 'Колесико вправо: След.'}</span>
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              </span>
            </div>
          </div>
        </div>

        {/* 3. SLIDES PAGINATION STRIP */}
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
                      ? deviceMode === 'apple_44'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-amber-500 text-slate-950 shadow-sm'
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
              title={`Скачать скрин в Ultra HD (${currentExportWidth}×${currentExportHeight} px)`}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Скрин ({exportQuality === 2 ? 'Ultra HD' : 'PNG'})</span>
            </button>

            <button
              onClick={() => { setShowZipModal(true); setCompletedZip(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl shadow-lg transition min-h-[38px] cursor-pointer active:scale-95 ${
                deviceMode === 'apple_44'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-950/40'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/40'
              }`}
            >
              <FileArchive className="w-4 h-4" />
              <span>Скачать в ZIP</span>
            </button>
          </div>
        </div>

        {/* 5. COLLAPSIBLE FULL TEXT CARD */}
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
                    ? deviceMode === 'apple_44'
                      ? 'bg-rose-500 text-white ring-2 ring-rose-400 shadow-sm'
                      : 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-sm'
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

      {/* 7. MODAL: ZIP DOWNLOAD CENTER WITH TELEGRAM WEBAPP COMPATIBILITY */}
      {showZipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  deviceMode === 'apple_44'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Экспорт скринов для {currentConfig.shortName} в ZIP
                  </h3>
                  <p className="text-xs text-slate-400">
                    Качество: <span className="text-emerald-400 font-bold">{currentExportWidth}×{currentExportHeight} px (Ultra HD)</span> • Всего {totalAllSlides} шт.
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

            {/* State A: Active Exporting Progress Bar */}
            {isExportingZip && (
              <div className="py-6 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-bold">Генерация Ultra HD скринов ({currentExportWidth}×{currentExportHeight} px)...</span>
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
            )}

            {/* State B: Archive Successfully Completed Screen (Telegram Mini App compatible!) */}
            {!isExportingZip && completedZip && (
              <div className="py-2 space-y-3.5 text-center animate-in fade-in duration-150">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <div>
                  <h4 className="text-base font-black text-white">Все скрины сгенерированы!</h4>
                  <p className="text-xs text-slate-300 font-mono mt-0.5 truncate max-w-xs mx-auto">
                    {completedZip.filename}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    Архив готов к загрузке в Ultra HD качестве (Retina 2x)
                  </p>
                </div>

                {/* Primary Telegram / Mobile Download Buttons */}
                <div className="space-y-2 pt-1 text-left">
                  {/* Button 1: Download via Telegram client API or direct download */}
                  <button
                    onClick={handleTelegramDownload}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-98 text-slate-950 font-black rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-950/50 transition cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="font-black text-xs sm:text-sm">Скачать архив в Telegram</div>
                        <div className="text-[10px] text-slate-900/80 font-normal">Нативное скачивание файла в память</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full font-bold">.ZIP</span>
                  </button>

                  {/* Button 2: Direct link in Safari / Chrome */}
                  <button
                    onClick={handleOpenDirectBrowserDownload}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-2xl flex items-center justify-between shadow-lg shadow-amber-950/40 transition cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="font-black text-xs sm:text-sm">Открыть в Safari / Chrome</div>
                        <div className="text-[10px] text-slate-900/80 font-normal">Мгновенное скачивание браузером в Загрузки</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full font-bold">Браузер</span>
                  </button>

                  {/* Button 3: Send download link to Telegram Saved Messages */}
                  <button
                    onClick={handleSendToTelegramChat}
                    className="w-full py-2.5 px-4 bg-sky-950/70 hover:bg-sky-900/80 active:scale-98 text-sky-200 border border-sky-500/40 font-bold rounded-2xl flex items-center justify-between transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <div className="font-bold">Отправить в Избранное (Saved Messages)</div>
                        <div className="text-[10px] text-sky-300/70">Ссылка в вашем Telegram для скачивания на любом устройстве</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">TG</span>
                  </button>

                  {/* Action Row: Copy Link & Share Sheet */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleCopyZipLink}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer text-xs"
                    >
                      {copiedZipLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                      <span>{copiedZipLink ? 'Скопировано!' : 'Копировать ссылку'}</span>
                    </button>

                    <button
                      onClick={handleSystemShare}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer text-xs"
                    >
                      <Share2 className="w-4 h-4 text-slate-300" />
                      <span>Поделиться</span>
                    </button>
                  </div>
                </div>

                {/* Helpful Instruction Box for Telegram Users */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/90 text-[11px] text-slate-400 text-left space-y-1.5">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Совет для Telegram на смартфоне:</span>
                  </p>
                  <p className="leading-relaxed">
                    Если встроенный просмотрщик Telegram блокирует прямую запись файлов:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                    <li>
                      Нажмите <span className="text-amber-400 font-bold">«Открыть в Safari / Chrome»</span> — браузер скачает ZIP сразу в системные Загрузки / Файлы.
                    </li>
                    <li>
                      Или нажмите <span className="text-sky-400 font-bold">«Отправить в Избранное»</span> — отправьте сообщение себе и откройте ссылку в чате.
                    </li>
                  </ol>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => setCompletedZip(null)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    ← Выбрать другую категорию
                  </button>
                </div>
              </div>
            )}

            {/* State C: Export Selection Options (Before generation) */}
            {!isExportingZip && !completedZip && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Все скрины экспортируются в повышенном разрешении <span className="text-amber-400 font-mono font-bold">{currentExportWidth}×{currentExportHeight} px (Retina 2x)</span>. Четкий рендеринг без пикселей и мыла!
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
                      48 билетов теории + 10 налогов + практические задачи в 2x Ultra HD
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

                {/* Option 3: Question 3 Only */}
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

      {/* 8. MODAL: SINGLE PNG IMAGE PREVIEW & SAVE SHEET (Mobile & Telegram friendly) */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl space-y-3.5 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Скрин для часов</h3>
              </div>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rendered image preview */}
            <div className="relative mx-auto flex items-center justify-center p-2 bg-slate-950 rounded-2xl border border-slate-800/80 shadow-inner">
              <img
                src={previewImageModal.dataUrl}
                alt={previewImageModal.filename}
                className="w-56 h-56 object-contain rounded-full shadow-lg"
              />
            </div>

            <p className="text-[11px] text-amber-300 font-medium">
              💡 Зажмите картинку пальцем, чтобы сохранить в «Фото» или переслать в чат!
            </p>

            <div className="space-y-2 pt-1">
              {/* Native share sheet */}
              <button
                onClick={async () => {
                  try {
                    if (typeof navigator !== 'undefined' && navigator.canShare) {
                      const file = new File([previewImageModal.blob], previewImageModal.filename, { type: 'image/png' });
                      if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: 'Скрин для часов',
                        });
                        return;
                      }
                    }
                  } catch (e) {}

                  // Fallback
                  const a = document.createElement('a');
                  a.href = previewImageModal.serverUrl || previewImageModal.dataUrl;
                  a.download = previewImageModal.filename;
                  a.target = '_blank';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 text-xs transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Сохранить в Фото / Поделиться</span>
              </button>

              {/* Direct Link in Safari/Chrome */}
              {previewImageModal.serverUrl && (
                <button
                  onClick={() => {
                    const tg = (window as any).Telegram?.WebApp;
                    if (tg?.openLink) {
                      tg.openLink(previewImageModal.serverUrl, { try_instant_view: false });
                    } else {
                      window.open(previewImageModal.serverUrl, '_blank');
                    }
                  }}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 text-xs border border-slate-700 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Открыть оригинал в браузере</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
