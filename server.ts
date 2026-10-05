import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StoredFile {
  filename: string;
  buffer: Buffer;
  contentType: string;
  createdAt: number;
}

const fileStore = new Map<string, StoredFile>();

// Clean up files older than 2 hours periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of fileStore.entries()) {
    if (now - value.createdAt > 2 * 60 * 60 * 1000) {
      fileStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for handling raw binary and JSON
  app.use(express.json({ limit: '150mb' }));
  app.use(express.raw({ 
    type: ['application/zip', 'application/octet-stream', 'application/x-zip-compressed', 'image/png'], 
    limit: '150mb' 
  }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Upload ZIP endpoint
  app.post('/api/upload-zip', (req, res) => {
    try {
      const rawHeaderName = (req.headers['x-filename'] as string) || 'watch_screens.zip';
      const filename = decodeURIComponent(rawHeaderName);
      const id = `zip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      let buffer: Buffer;
      if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      } else if (req.body && req.body.data) {
        buffer = Buffer.from(req.body.data, 'base64');
      } else {
        buffer = Buffer.from(req.body || '');
      }

      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'Empty file buffer' });
      }

      fileStore.set(id, {
        filename,
        buffer,
        contentType: 'application/zip',
        createdAt: Date.now(),
      });

      const host = req.get('host') || `localhost:${PORT}`;
      const forwardedProto = req.headers['x-forwarded-proto'];
      const protocol = forwardedProto 
        ? (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) 
        : (req.secure ? 'https' : 'http');
      
      const safeFilename = encodeURIComponent(filename);
      const downloadUrl = `${protocol}://${host}/api/download-zip/${id}/${safeFilename}`;

      console.log(`[ZIP UPLOAD] Stored ${filename} (${buffer.length} bytes), id: ${id}`);

      res.json({
        success: true,
        id,
        downloadUrl,
        filename,
        size: buffer.length,
      });
    } catch (err: any) {
      console.error('[ZIP UPLOAD ERROR]:', err);
      res.status(500).json({ error: 'Failed to process zip file' });
    }
  });

  // Download ZIP endpoint
  app.get('/api/download-zip/:id/:filename', (req, res) => {
    const { id } = req.params;
    const file = fileStore.get(id);

    if (!file) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Файл не найден</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #020617; color: #f8fafc; padding: 40px 20px; text-align: center; }
            .box { max-width: 480px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; }
            h2 { color: #f59e0b; margin-top: 0; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
            a { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #f59e0b; color: #020617; border-radius: 12px; font-weight: bold; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>⏳ Срок действия ссылки истек</h2>
            <p>Этот архив был сгенерирован более 2 часов назад или сервер перезапускался. Пожалуйста, откройте приложение и нажмите кнопку скачивания снова.</p>
            <a href="/">Вернуться в приложение</a>
          </div>
        </body>
        </html>
      `);
    }

    const asciiFilename = file.filename.replace(/[^\x00-\x7F]/g, '_');
    const utf8Filename = encodeURIComponent(file.filename);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiFilename}"; filename*=UTF-8''${utf8Filename}`
    );
    res.setHeader('Content-Length', file.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=7200');
    res.send(file.buffer);
  });

  // Single image upload endpoint (PNG)
  app.post('/api/upload-image', (req, res) => {
    try {
      const rawHeaderName = (req.headers['x-filename'] as string) || 'watch_screen.png';
      const filename = decodeURIComponent(rawHeaderName);
      const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      let buffer: Buffer;
      if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      } else {
        buffer = Buffer.from(req.body || '');
      }

      fileStore.set(id, {
        filename,
        buffer,
        contentType: 'image/png',
        createdAt: Date.now(),
      });

      const host = req.get('host') || `localhost:${PORT}`;
      const forwardedProto = req.headers['x-forwarded-proto'];
      const protocol = forwardedProto 
        ? (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) 
        : (req.secure ? 'https' : 'http');
      
      const safeFilename = encodeURIComponent(filename);
      const imageUrl = `${protocol}://${host}/api/image/${id}/${safeFilename}`;

      res.json({
        success: true,
        id,
        imageUrl,
        filename,
        size: buffer.length,
      });
    } catch (err: any) {
      console.error('[IMAGE UPLOAD ERROR]:', err);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });

  // Single image view/download endpoint
  app.get('/api/image/:id/:filename', (req, res) => {
    const { id } = req.params;
    const file = fileStore.get(id);

    if (!file) {
      return res.status(404).send('Image not found');
    }

    const asciiFilename = file.filename.replace(/[^\x00-\x7F]/g, '_');
    const utf8Filename = encodeURIComponent(file.filename);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${asciiFilename}"; filename*=UTF-8''${utf8Filename}`
    );
    res.setHeader('Content-Length', file.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=7200');
    res.send(file.buffer);
  });

  // Dev vs Prod Vite handling
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
