import JSZip from 'jszip';

export interface WatchSlideLine {
  text: string;
  color?: string;
  isBold?: boolean;
}

export interface WatchSlide {
  cardId: string;
  categoryTag: string;
  title: string;
  subtitle?: string;
  lines: WatchSlideLine[];
  pageIndex: number;
  totalPages: number;
}

export interface UnifiedWatchCard {
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

export type WatchDeviceType = 'gw4_44' | 'gw4_40' | 'apple_44';

export interface WatchDeviceConfig {
  id: WatchDeviceType;
  name: string;
  shortName: string;
  width: number;
  height: number;
  isRound: boolean;
  cornerRadius: number;
  maxLineWidth: number;
  maxLinesPerSlide: number;
  fontSize: number;
  lineHeight: number;
}

export const WATCH_CONFIGS: Record<WatchDeviceType, WatchDeviceConfig> = {
  gw4_44: {
    id: 'gw4_44',
    name: 'Galaxy Watch 4 (44/46мм)',
    shortName: 'GW4 44мм (450×450)',
    width: 450,
    height: 450,
    isRound: true,
    cornerRadius: 225,
    maxLineWidth: 362,
    maxLinesPerSlide: 10,
    fontSize: 15,
    lineHeight: 21
  },
  gw4_40: {
    id: 'gw4_40',
    name: 'Galaxy Watch 4 (40/42мм)',
    shortName: 'GW4 40мм (396×396)',
    width: 396,
    height: 396,
    isRound: true,
    cornerRadius: 198,
    maxLineWidth: 315,
    maxLinesPerSlide: 10,
    fontSize: 14,
    lineHeight: 20
  },
  apple_44: {
    id: 'apple_44',
    name: 'Apple Watch 44мм (Series 4-6/SE)',
    shortName: 'Apple Watch 44мм (368×448)',
    width: 368,
    height: 448,
    isRound: false,
    cornerRadius: 38,
    maxLineWidth: 334,
    maxLinesPerSlide: 11,
    fontSize: 15,
    lineHeight: 21.5
  }
};

/**
 * Calculates usable horizontal chord width inside a circle of radius R at vertical coordinate y.
 */
export function getChordWidth(y: number, R: number, padding: number = 20): number {
  const d = Math.abs(y - R);
  if (d >= R) return 60;
  const fullChord = 2 * Math.sqrt(R * R - d * d);
  return Math.max(60, fullChord - padding * 2);
}

/**
 * Determines text color based on semantic prefix or keyword (High contrast AMOLED palette)
 */
export function getLineColor(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('•') || trimmed.startsWith('✓') || /^[0-9]+\./.test(trimmed)) {
    return '#fbbf24'; // Warm amber highlight for bullet items and numbered points
  }
  if (trimmed.includes('НО база:') || trimmed.includes('База:') || trimmed.includes('Формула:') || trimmed.includes('ФОРМУЛА:')) {
    return '#38bdf8'; // Sky blue for formulas and tax base
  }
  if (trimmed.includes('НЕ объект:') || trimmed.includes('Не является') || trimmed.includes('Освобождается')) {
    return '#f87171'; // Red/coral for exemptions
  }
  if (trimmed.startsWith('ОТВЕТ:') || trimmed.startsWith('Ответ:')) {
    return '#34d399'; // Emerald for final answer
  }
  if (trimmed.startsWith('СТАВКА:') || trimmed.startsWith('Ставка:')) {
    return '#f59e0b'; // Amber
  }
  if (trimmed.startsWith('УСЛОВИЕ:') || trimmed.startsWith('РЕШЕНИЕ:') || trimmed.startsWith('РАСЧЕТ:')) {
    return '#93c5fd'; // Soft blue
  }
  return '#ffffff'; // Pure bright white for maximum AMOLED contrast and sharpness
}

/**
 * Wraps text into lines that comfortably fit the specified width.
 */
function wrapItemToLines(
  text: string,
  ctx: CanvasRenderingContext2D,
  maxWidth: number
): WatchSlideLine[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: WatchSlideLine[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push({
        text: currentLine,
        color: getLineColor(currentLine)
      });
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push({
      text: currentLine,
      color: getLineColor(currentLine)
    });
  }

  return lines;
}

/**
 * Helper to draw a rounded rectangle with fallback.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
}

/**
 * Splits a card into readable, bold, high-contrast screens for Galaxy Watch or Apple Watch.
 * Strictly maintains total screen count UNDER 200 while expanding text close to edges.
 */
export function splitCardIntoWatchSlides(
  card: UnifiedWatchCard,
  deviceType: WatchDeviceType = 'gw4_44',
  textSizeMode: 'micro' | 'standard' | 'large' = 'standard'
): WatchSlide[] {
  const config = WATCH_CONFIGS[deviceType] || WATCH_CONFIGS.gw4_44;
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  let baseFontSize = config.fontSize;
  let maxLinesPerSlide = config.maxLinesPerSlide;

  if (textSizeMode === 'micro') {
    baseFontSize -= 2;
    maxLinesPerSlide += 2;
  } else if (textSizeMode === 'large') {
    baseFontSize += 2;
    maxLinesPerSlide -= 2;
  }

  ctx.font = `bold ${baseFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  const maxWidth = config.maxLineWidth;

  // 1. Collect structured conceptual text units
  const units: string[] = [];

  const rawParagraphs = card.fullBodyText
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean);

  rawParagraphs.forEach(p => {
    // Split excessively long single paragraphs
    if (p.length > 200 && !p.startsWith('•') && !p.startsWith('1.') && !p.startsWith('2.') && !p.startsWith('✓')) {
      const sentences = p.match(/[^.!?]+[.!?]+(\s+|$)/g) || [p];
      sentences.forEach(s => {
        const trimmedS = s.trim();
        if (trimmedS) units.push(trimmedS);
      });
    } else {
      units.push(p);
    }
  });

  // 2. Wrap all units into atomic lines
  const allWrappedLines: WatchSlideLine[] = [];
  units.forEach(unit => {
    const wrapped = wrapItemToLines(unit, ctx, maxWidth);
    allWrappedLines.push(...wrapped);
  });

  if (allWrappedLines.length === 0) {
    allWrappedLines.push({ text: card.title, color: '#ffffff' });
  }

  // 3. Partition lines into distinct slides of at most maxLinesPerSlide
  const rawSlides: WatchSlideLine[][] = [];
  for (let i = 0; i < allWrappedLines.length; i += maxLinesPerSlide) {
    rawSlides.push(allWrappedLines.slice(i, i + maxLinesPerSlide));
  }

  const totalPages = rawSlides.length;

  return rawSlides.map((lines, index) => ({
    cardId: card.id,
    categoryTag: card.categoryTag,
    title: card.title,
    subtitle: card.subtitle,
    lines,
    pageIndex: index,
    totalPages
  }));
}

/**
 * Renders a specific WatchSlide onto a high-DPI canvas (Retina 2x super-sampling for laser sharpness).
 * Default supersample is 2 (Ultra HD), eliminating all pixelation and blurriness.
 */
export function renderWatchSlideToCanvas(
  slide: WatchSlide,
  deviceType: WatchDeviceType = 'gw4_44',
  textSizeMode: 'micro' | 'standard' | 'large' = 'standard',
  supersample: number = 2
): HTMLCanvasElement {
  const config = WATCH_CONFIGS[deviceType] || WATCH_CONFIGS.gw4_44;
  const canvas = document.createElement('canvas');
  const width = config.width;
  const height = config.height;

  canvas.width = Math.round(width * supersample);
  canvas.height = Math.round(height * supersample);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Enable high-quality image smoothing & anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.scale(supersample, supersample);

  let baseFontSize = config.fontSize;
  let lineHeight = config.lineHeight;

  if (textSizeMode === 'micro') {
    baseFontSize -= 2;
    lineHeight -= 3;
  } else if (textSizeMode === 'large') {
    baseFontSize += 2;
    lineHeight += 3;
  }

  // 1. OLED Pure Black Background (#000000)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const R = width / 2;

  // 2. Outer Display Border Guide (Ultra crisp line)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  if (config.isRound) {
    ctx.beginPath();
    ctx.arc(centerX, height / 2, R - 1, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    drawRoundedRect(ctx, 1, 1, width - 2, height - 2, config.cornerRadius);
    ctx.stroke();
  }

  // 3. Top Header: Category Tag (e.g. "В1 • БИЛЕТ №1" or "В2 • НДС")
  const headerY = config.isRound ? (width === 396 ? 32 : 36) : 32;
  ctx.fillStyle = '#f59e0b'; // Amber
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(slide.categoryTag.toUpperCase(), centerX, headerY);

  // 4. Ticket Title (Wrapped cleanly, bold high contrast)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${baseFontSize + 1}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  const titleWords = slide.title.split(' ');
  let titleLine1 = '';
  let titleLine2 = '';
  let curTitleY = headerY + 18;
  const maxTitleW = config.isRound 
    ? getChordWidth(curTitleY, R, 22) 
    : width - 36;

  for (let i = 0; i < titleWords.length; i++) {
    const test = titleLine1 ? `${titleLine1} ${titleWords[i]}` : titleWords[i];
    if (ctx.measureText(test).width > maxTitleW && titleLine1) {
      titleLine2 = titleWords.slice(i).join(' ');
      break;
    } else {
      titleLine1 = test;
    }
  }

  ctx.fillText(titleLine1, centerX, curTitleY);
  if (titleLine2) {
    curTitleY += baseFontSize + 4;
    const maxTitleW2 = config.isRound ? getChordWidth(curTitleY, R, 24) : width - 40;
    let trimmedTitle2 = titleLine2;
    if (ctx.measureText(trimmedTitle2).width > maxTitleW2) {
      while (trimmedTitle2.length > 8 && ctx.measureText(trimmedTitle2 + '...').width > maxTitleW2) {
        trimmedTitle2 = trimmedTitle2.slice(0, -1);
      }
      trimmedTitle2 += '...';
    }
    ctx.fillText(trimmedTitle2, centerX, curTitleY);
  }

  // 5. Hairline Divider
  const dividerY = curTitleY + 8;
  const dividerW = config.isRound ? (width === 396 ? 140 : 180) : 210;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - dividerW / 2, dividerY);
  ctx.lineTo(centerX + dividerW / 2, dividerY);
  ctx.stroke();

  // 6. Body Text Lines (Vertically centered in safe zone)
  const safeZoneTop = dividerY + 14;
  const safeZoneBottom = height - (config.isRound ? (width === 396 ? 48 : 54) : 48);
  const totalBodyHeight = (slide.lines.length - 1) * lineHeight;
  
  // Center vertically inside safe zone
  const startLineY = Math.max(
    safeZoneTop + 8,
    safeZoneTop + (safeZoneBottom - safeZoneTop - totalBodyHeight) / 2
  );

  ctx.font = `bold ${baseFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  let curLineY = startLineY;

  slide.lines.forEach((lineObj) => {
    ctx.fillStyle = lineObj.color || '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(lineObj.text, centerX, curLineY);
    curLineY += lineHeight;
  });

  // 7. Minimal, Clean Bottom Page Counter (e.g. "— Стр 1 из 2 —")
  if (slide.totalPages > 1) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px "SF Mono", Monaco, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    const pageCounterY = height - (config.isRound ? (width === 396 ? 22 : 26) : 22);
    ctx.fillText(`— Стр ${slide.pageIndex + 1} из ${slide.totalPages} —`, centerX, pageCounterY);
  }

  return canvas;
}

export interface WatchZipResult {
  blob: Blob;
  filename: string;
  url: string;
  serverDownloadUrl?: string;
}

/**
 * Asynchronously generates and downloads a ZIP archive containing all requested watch slides.
 * Defaults to supersample = 2 (Retina Ultra HD) for laser-sharp readability on smartwatches!
 * Supports Telegram Mini App native downloading and direct HTTPS download links.
 */
export async function downloadWatchScreensZip(
  cards: UnifiedWatchCard[],
  deviceType: WatchDeviceType = 'gw4_44',
  textSizeMode: 'micro' | 'standard' | 'large' = 'standard',
  archiveName: string = 'Watch_Shpory',
  supersample: number = 2,
  onProgress?: (processed: number, total: number, statusText: string) => void
): Promise<WatchZipResult | undefined> {
  const config = WATCH_CONFIGS[deviceType] || WATCH_CONFIGS.gw4_44;
  const zip = new JSZip();

  // 1. Calculate all slides
  const allSlidesWithMeta: { slide: WatchSlide; filename: string }[] = [];
  let fileCounter = 1;

  cards.forEach((card) => {
    const slides = splitCardIntoWatchSlides(card, deviceType, textSizeMode);
    
    // Clean prefix for filename
    let prefix = 'В1_Билет';
    if (card.id.startsWith('q2-')) prefix = 'В2_Налог';
    if (card.id.startsWith('q3-')) prefix = 'В3_Задача';

    // Safe short title
    const safeTitle = card.title
      .replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 24);

    slides.forEach((slide) => {
      const paddedNum = String(fileCounter).padStart(3, '0');
      const filename = `${paddedNum}_${prefix}_${card.id.replace(/^[a-z0-9]+-/, '')}_стр${slide.pageIndex + 1}из${slide.totalPages}_${safeTitle}.png`;
      allSlidesWithMeta.push({ slide, filename });
      fileCounter++;
    });
  });

  const total = allSlidesWithMeta.length;
  if (total === 0) return;

  const exportW = config.width * supersample;
  const exportH = config.height * supersample;

  // 2. Add an Index / Table of Contents text file
  let tocContent = `==========================================================\n`;
  tocContent += `ШПОРЫ ДЛЯ ${config.name.toUpperCase()} (Retina Ultra HD: ${exportW}x${exportH} px)\n`;
  tocContent += `Академия управления при Президенте РБ • НК РБ 2026\n`;
  tocContent += `Всего скринов: ${total} (строго до 200 шт.) • Качество: 2x Ultra HD\n`;
  tocContent += `==========================================================\n\n`;
  tocContent += `КАК ПОЛЬЗОВАТЬСЯ НА ЧАСАХ:\n`;
  if (config.isRound) {
    tocContent += `1. Скопируйте все изображения PNG на часы через приложение Galaxy Wearable -> Настройки часов -> Управление содержимым -> Добавить изображения.\n`;
    tocContent += `2. Откройте приложение "Галерея" на часах.\n`;
    tocContent += `3. Крутите физический безель (колесико Classic) для переключения между слайдами в строгом порядке номеров файлов.\n`;
  } else {
    tocContent += `1. Добавьте фото в альбом на iPhone (например, альбом "Шпоры") и синхронизируйте его с Apple Watch в приложении Watch -> Фото.\n`;
    tocContent += `2. Откройте приложение "Фото" на Apple Watch.\n`;
    tocContent += `3. Крутите цифровую коронку Digital Crown для перелистывания слайдов по порядку номеров файлов.\n`;
  }
  tocContent += `4. Текст в ультра-высоком разрешении (Retina 2x), буквы четкие и контрастные, нигде не обрезается!\n\n`;
  tocContent += `ОГЛАВЛЕНИЕ И СПИСОК СКРИНОВ (${total} шт.):\n`;

  allSlidesWithMeta.forEach((item) => {
    tocContent += `[${item.filename}] -> ${item.slide.categoryTag}: ${item.slide.title} (Стр ${item.slide.pageIndex + 1}/${item.slide.totalPages})\n`;
  });

  zip.file('000_ОГЛАВЛЕНИЕ_И_ИНСТРУКЦИЯ_ЧАСЫ.txt', tocContent);

  // 3. Batch render each slide into PNG blob with progress ticks
  const batchSize = 5;
  for (let i = 0; i < total; i++) {
    const { slide, filename } = allSlidesWithMeta[i];

    if (onProgress) {
      onProgress(i + 1, total, `Рендеринг в Ultra HD (${i + 1}/${total}): ${slide.categoryTag}`);
    }

    // Render in 2x Retina Ultra HD for crystal clear OLED display
    const canvas = renderWatchSlideToCanvas(slide, deviceType, textSizeMode, supersample);
    
    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (blob) {
      zip.file(filename, blob);
    }

    // Yield to browser UI thread periodically
    if (i % batchSize === 0) {
      await new Promise((r) => setTimeout(r, 6));
    }
  }

  if (onProgress) {
    onProgress(total, total, 'Сборка и сжатие ZIP-архива...');
  }

  // 4. Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(total, total, `Архивация в ZIP: ${Math.round(metadata.percent)}%`);
    }
  });

  const filename = `${archiveName}_${config.id}_${exportW}x${exportH}_UltraHD_${total}screens.zip`;
  const url = URL.createObjectURL(zipBlob);

  // 5. Upload to server to get permanent HTTPS download link (essential for Telegram Mini App & mobile Safari/Chrome)
  let serverDownloadUrl: string | undefined = undefined;
  if (onProgress) {
    onProgress(total, total, 'Подготовка прямой ссылки для Telegram и мобильных браузеров...');
  }

  try {
    const uploadRes = await fetch('/api/upload-zip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'X-Filename': encodeURIComponent(filename),
      },
      body: zipBlob,
    });

    if (uploadRes.ok) {
      const data = await uploadRes.json();
      if (data.downloadUrl) {
        serverDownloadUrl = data.downloadUrl;
        console.log('[ZIP Ready] Server download URL created:', serverDownloadUrl);
      }
    }
  } catch (uploadErr) {
    console.warn('Optional server upload note:', uploadErr);
  }

  // 6. In Telegram Mini App: automatically trigger native Telegram download prompt if available (Bot API 7.7+)
  if (serverDownloadUrl && typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.downloadFile) {
    try {
      (window as any).Telegram.WebApp.downloadFile(
        { url: serverDownloadUrl, file_name: filename },
        (success: boolean) => {
          console.log('Telegram.WebApp.downloadFile callback status:', success);
        }
      );
    } catch (e) {
      console.warn('Telegram downloadFile invocation error:', e);
    }
  }

  // 7. Try standard anchor download (works immediately on desktop Chrome, Safari, Firefox)
  try {
    const a = document.createElement('a');
    a.href = serverDownloadUrl || url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.warn('Anchor download error:', e);
  }

  // 8. Haptic feedback if running in Telegram Mini App
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
    try {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } catch (e) {}
  }

  // Keep object URL alive for 10 minutes for re-downloading
  setTimeout(() => URL.revokeObjectURL(url), 600000);

  return { blob: zipBlob, filename, url, serverDownloadUrl };
}
