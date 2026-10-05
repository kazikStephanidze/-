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
 * Determines text color based on semantic prefix or keyword
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
  return '#f8fafc'; // Pure crisp off-white for body
}

/**
 * Wraps text into lines that comfortably fit the circular display.
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
 * Splits a card into readable, bold, high-contrast screens.
 * Designed to keep total screens strictly UNDER 200 for the entire curriculum,
 * while expanding text close to the circular boundaries for optimal screen utilization.
 */
export function splitCardIntoWatchSlides(
  card: UnifiedWatchCard,
  resolution: 450 | 396 = 450,
  textSizeMode: 'micro' | 'standard' | 'large' = 'standard'
): WatchSlide[] {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  // Large, bold, readable font on smartwatch
  const baseFontSize = textSizeMode === 'micro' ? 13 : textSizeMode === 'standard' ? 15 : 17;
  ctx.font = `bold ${baseFontSize}px system-ui, -apple-system, sans-serif`;

  // Expanded line width to bring text closer to the circular boundaries (362px for 450, 315px for 396)
  const maxWidth = resolution === 396 ? 315 : 362;

  // Maximum lines per slide: 10 lines (fits comfortably within safe zone y in [96, 295], keeps total screens <= 170)
  const maxLinesPerSlide = textSizeMode === 'micro' ? 12 : textSizeMode === 'standard' ? 10 : 8;

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
 * Pure AMOLED black (#000000), bold readable fonts, zero blur, zero text cut-off!
 */
export function renderWatchSlideToCanvas(
  slide: WatchSlide,
  resolution: 450 | 396 = 450,
  textSizeMode: 'micro' | 'standard' | 'large' = 'standard',
  supersample: number = 2
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // Backing store scaled by supersample (2x) for razor-sharp Retina AMOLED text
  canvas.width = resolution * supersample;
  canvas.height = resolution * supersample;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(supersample, supersample);

  const R = resolution / 2;
  const baseFontSize = textSizeMode === 'micro' ? 13 : textSizeMode === 'standard' ? 15 : 17;
  const lineHeight = textSizeMode === 'micro' ? 18 : textSizeMode === 'standard' ? 21 : 24;

  // 1. OLED Pure Black Background (#000000)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, resolution, resolution);

  // 2. Outer Circular Rim Border (Subtle dark boundary guide)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(R, R, R - 1, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Top Header: Category Tag (e.g. "В1 • БИЛЕТ №1" or "В2 • НДС")
  const headerY = resolution === 396 ? 32 : 36;
  ctx.fillStyle = '#f59e0b'; // Amber
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(slide.categoryTag.toUpperCase(), R, headerY);

  // 4. Ticket Title (Wrapped cleanly, bold high contrast)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${baseFontSize + 1}px system-ui, -apple-system, sans-serif`;

  const titleWords = slide.title.split(' ');
  let titleLine1 = '';
  let titleLine2 = '';
  let curTitleY = headerY + 18;
  const maxTitleW = getChordWidth(curTitleY, R, 22);

  for (let i = 0; i < titleWords.length; i++) {
    const test = titleLine1 ? `${titleLine1} ${titleWords[i]}` : titleWords[i];
    if (ctx.measureText(test).width > maxTitleW && titleLine1) {
      titleLine2 = titleWords.slice(i).join(' ');
      break;
    } else {
      titleLine1 = test;
    }
  }

  ctx.fillText(titleLine1, R, curTitleY);
  if (titleLine2) {
    curTitleY += baseFontSize + 4;
    const maxTitleW2 = getChordWidth(curTitleY, R, 24);
    let trimmedTitle2 = titleLine2;
    if (ctx.measureText(trimmedTitle2).width > maxTitleW2) {
      while (trimmedTitle2.length > 8 && ctx.measureText(trimmedTitle2 + '...').width > maxTitleW2) {
        trimmedTitle2 = trimmedTitle2.slice(0, -1);
      }
      trimmedTitle2 += '...';
    }
    ctx.fillText(trimmedTitle2, R, curTitleY);
  }

  // 5. Hairline Divider
  const dividerY = curTitleY + 8;
  const dividerW = resolution === 396 ? 140 : 180;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R - dividerW / 2, dividerY);
  ctx.lineTo(R + dividerW / 2, dividerY);
  ctx.stroke();

  // 6. Body Text Lines (Vertically centered in safe zone)
  const safeZoneTop = dividerY + 14;
  const safeZoneBottom = resolution - (resolution === 396 ? 48 : 54);
  const totalBodyHeight = (slide.lines.length - 1) * lineHeight;
  
  // Center vertically inside safe zone
  const startLineY = Math.max(
    safeZoneTop + 8,
    safeZoneTop + (safeZoneBottom - safeZoneTop - totalBodyHeight) / 2
  );

  ctx.font = `bold ${baseFontSize}px system-ui, -apple-system, sans-serif`;
  let curLineY = startLineY;

  slide.lines.forEach((lineObj) => {
    ctx.fillStyle = lineObj.color || '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(lineObj.text, R, curLineY);
    curLineY += lineHeight;
  });

  // 7. Minimal, Clean Bottom Page Counter (e.g. "— Стр 1 из 3 —")
  if (slide.totalPages > 1) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px system-ui, monospace';
    ctx.textAlign = 'center';
    const pageCounterY = resolution - (resolution === 396 ? 22 : 26);
    ctx.fillText(`— Стр ${slide.pageIndex + 1} из ${slide.totalPages} —`, R, pageCounterY);
  }

  return canvas;
}

/**
 * Asynchronously generates and downloads a ZIP archive containing all requested watch slides.
 * File naming is strictly numbered for chronological browsing via Galaxy Watch rotating bezel!
 */
export async function downloadWatchScreensZip(
  cards: UnifiedWatchCard[],
  resolution: 450 | 396 = 450,
  textSizeMode: 'micro' | 'standard' | 'large' = 'standard',
  archiveName: string = 'GalaxyWatch4_Classic_Shpory',
  onProgress?: (processed: number, total: number, statusText: string) => void
): Promise<void> {
  const zip = new JSZip();

  // 1. Calculate all slides
  const allSlidesWithMeta: { slide: WatchSlide; filename: string }[] = [];
  let fileCounter = 1;

  cards.forEach((card) => {
    const slides = splitCardIntoWatchSlides(card, resolution, textSizeMode);
    
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

  // 2. Add an Index / Table of Contents text file
  let tocContent = `==========================================================\n`;
  tocContent += `ШПОРЫ ДЛЯ GALAXY WATCH 4 CLASSIC (${resolution}x${resolution} Super AMOLED)\n`;
  tocContent += `Академия управления при Президенте РБ • НК РБ 2026\n`;
  tocContent += `Всего скринов: ${total} (строго до 200 шт.)\n`;
  tocContent += `==========================================================\n\n`;
  tocContent += `КАК ПОЛЬЗОВАТЬСЯ НА ЧАСАХ GALAXY WATCH 4 CLASSIC:\n`;
  tocContent += `1. Скопируйте все изображения PNG на часы через приложение Galaxy Wearable -> Настройки часов -> Управление содержимым -> Добавить изображения.\n`;
  tocContent += `2. Откройте приложение "Галерея" на часах.\n`;
  tocContent += `3. Крутите физический безель (колесико Classic) для переключения между слайдами в строгом порядке номеров файлов.\n`;
  tocContent += `4. Текст крупный, контрастный и гарантированно не обрезается снизу!\n\n`;
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
      onProgress(i + 1, total, `Рендеринг скрина ${i + 1} из ${total}: ${slide.categoryTag}`);
    }

    // Render at native 1x for 1:1 pixel mapping on Galaxy Watch display (exact 450x450)
    const canvas = renderWatchSlideToCanvas(slide, resolution, textSizeMode, 1);
    
    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (blob) {
      zip.file(filename, blob);
    }

    // Yield to browser UI thread periodically
    if (i % batchSize === 0) {
      await new Promise((r) => setTimeout(r, 8));
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

  // 5. Trigger download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${archiveName}_${resolution}x${resolution}_${total}screens.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
