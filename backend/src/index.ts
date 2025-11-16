/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import multer from 'multer';
import { initDatabase, createJob, getJob, updateJobStatus } from './db.js';
import { renderVideo } from './worker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', 'tmp');
const OUTPUT_DIR = path.join(__dirname, '..', 'renders');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Inicializar database
initDatabase();

// Garantir diretórios
await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });

// ==================== LIMPEZA AUTOMÁTICA ====================

/**
 * Limpar arquivos antigos (>24h) dos diretórios tmp e renders
 * Evita acúmulo de espaço em disco
 */
const cleanupOldFiles = async (dirPath: string, maxAgeMs: number = 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(dirPath);
    const now = Date.now();
    let deletedCount = 0;
    let deletedSize = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      const fileAgeMs = now - stats.mtimeMs;

      if (fileAgeMs > maxAgeMs) {
        try {
          await fs.unlink(filePath);
          deletedCount++;
          deletedSize += stats.size;
          console.log(`[Cleanup] Deleted: ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        } catch (err) {
          console.warn(`[Cleanup] Failed to delete ${file}:`, err);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cleanup] ${dirPath}: Removed ${deletedCount} files (${(deletedSize / 1024 / 1024).toFixed(2)}MB freed)`);
    }
  } catch (err) {
    console.warn(`[Cleanup] Error cleaning directory ${dirPath}:`, err);
  }
};

/**
 * Executar limpeza a cada 6 horas
 */
const startCleanupSchedule = () => {
  // Executar imediatamente na inicialização
  console.log('[Cleanup] Running initial cleanup...');
  cleanupOldFiles(TMP_DIR);
  cleanupOldFiles(OUTPUT_DIR);

  // Depois, a cada 6 horas
  setInterval(() => {
    console.log('[Cleanup] Running scheduled cleanup...');
    cleanupOldFiles(TMP_DIR);
    cleanupOldFiles(OUTPUT_DIR);
  }, 6 * 60 * 60 * 1000); // 6 horas
};

startCleanupSchedule();

// ==================== ROTAS ====================

/**
 * POST /api/render
 * Recebe vídeos e áudio via FormData, retorna jobId
 */
app.post('/api/render', upload.any(), async (req: Request, res: Response) => {
  try {
    const jobId = uuidv4();
    const projectId = req.body.projectId || 'unknown';
    const sceneDurationsStr = req.body.sceneDurations || '[]';
    let sceneDurations: number[] = [];

    try {
      sceneDurations = JSON.parse(sceneDurationsStr);
      console.log(`[API] Scene durations: ${sceneDurations.join(', ')}`);
    } catch (e) {
      console.warn('[API] Failed to parse sceneDurations:', e);
    }

    console.log(`[API] Render request received: ${jobId}`);
    console.log(`[API] Files received: ${(req.files as any)?.length || 0}`);

    // Criar job no DB
    createJob(jobId, projectId);

    // Extrair files do multer
    const files = (req.files as any) || [];

    // Separar vídeos e áudio
    const videoFiles: string[] = [];
    let audioFile: string | undefined;

    for (const file of files) {
      if (file.fieldname.startsWith('video_')) {
        const videoPath = path.join(TMP_DIR, `${jobId}-${file.originalname}`);
        await fs.writeFile(videoPath, file.buffer);
        videoFiles.push(videoPath);
        console.log(`[API] Video saved: ${file.originalname}`);
      } else if (file.fieldname === 'audio') {
        audioFile = path.join(TMP_DIR, `${jobId}-audio.mp3`);
        await fs.writeFile(audioFile, file.buffer);
        console.log(`[API] Audio saved: ${file.originalname}`);
      }
    }

    if (videoFiles.length === 0) {
      return res.status(400).json({
        error: 'No videos provided',
      });
    }

    console.log(`[API] Starting render with ${videoFiles.length} videos and ${audioFile ? 'audio' : 'no audio'}`);

    // Iniciar renderização em background (fire and forget)
    renderVideo(jobId, videoFiles, audioFile, sceneDurations).catch((err) => {
      console.error(`[Worker] Error processing job ${jobId}:`, err);
    });

    res.json({
      jobId,
      status: 'queued',
      message: 'Render job queued successfully',
    });
  } catch (error: any) {
    console.error('[API] Error in /api/render:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/status/:jobId
 * Retorna status do job
 */
app.get('/api/status/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    res.json({
      jobId,
      status: job.status,
      progress: job.progress,
      error: job.error_message,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    });
  } catch (error: any) {
    console.error('[API] Error in /api/status:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/download/:jobId
 * Download do vídeo renderizado
 */
app.get('/api/download/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    console.log(`[API] Download request for job: ${jobId}`);

    const job = getJob(jobId);

    if (!job) {
      console.log(`[API] Job not found: ${jobId}`);
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    console.log(`[API] Job status: ${job.status}`);

    if (job.status !== 'completed') {
      return res.status(400).json({
        error: `Job status is ${job.status}, not completed`,
      });
    }

    const outputPath = job.output_path;

    if (!outputPath) {
      console.log(`[API] No output path stored for job: ${jobId}`);
      return res.status(404).json({
        error: 'Output file path not found',
      });
    }

    // Verificar se arquivo existe
    try {
      await fs.stat(outputPath);
    } catch (err) {
      console.error(`[API] File not found at path: ${outputPath}`, err);
      return res.status(404).json({
        error: 'Output file not found on disk',
      });
    }

    console.log(`[API] Serving file: ${outputPath}`);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="render-${jobId}.mp4"`
    );

    const fileStream = createReadStream(outputPath);

    fileStream.on('error', (error: any) => {
      console.error(`[API] Stream error:`, error);
      res.status(500).json({
        error: 'Error reading file',
      });
    });

    fileStream.pipe(res);
  } catch (error: any) {
    console.error('[API] Error in /api/download:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Temp directory: ${TMP_DIR}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST   /api/render           - Start render job`);
  console.log(`   GET    /api/status/:jobId    - Get job status`);
  console.log(`   GET    /api/download/:jobId  - Download result`);
});

