/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import fs from 'fs/promises';
import {
  updateJobStatus,
  completeJob,
  failJob,
  getJob,
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', 'tmp');
const OUTPUT_DIR = path.join(__dirname, '..', 'renders');

// Garantir que os diretórios existem
await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });

/**
 * Obter duração de um vídeo usando FFmpeg (dinamicamente)
 * Não hardcoda valores!
 */
async function getVideoDuration(videoPath: string): Promise<number> {
  try {
    const { stdout } = await execa('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1:nokey=1',
      videoPath
    ]);

    const duration = parseFloat(stdout.toString().trim());
    if (isNaN(duration)) {
      console.warn(`[Worker] Failed to parse duration for ${videoPath}, using 8s as fallback`);
      return 8;
    }

    console.log(`[Worker] ✓ Detected video duration: ${videoPath} = ${duration.toFixed(2)}s`);
    return duration;
  } catch (error) {
    console.warn(`[Worker] Failed to get duration for ${videoPath}:`, error);
    console.warn(`[Worker] Using 8s as fallback (Gemini default)`);
    return 8; // Fallback para Gemini default
  }
}

export async function renderVideo(
  jobId: string,
  videoFiles: string[],
  audioFile?: string,
  sceneDurations?: number[]
): Promise<void> {
  try {
    updateJobStatus(jobId, 'processing', 0);

    const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);
    const numScenes = videoFiles.length;

    console.log(`[Worker] Starting render for job ${jobId}`);
    console.log(`[Worker] Video files: ${videoFiles.length}`);
    console.log(`[Worker] Audio: ${audioFile ? 'Yes' : 'No'}`);
    console.log(`[Worker] Scene durations: ${sceneDurations?.join(', ') || 'None'}`);

    // Construir comando FFmpeg
    const args: string[] = [];

    // Inputs: todos os vídeos
    for (const file of videoFiles) {
      args.push('-i', file);
    }

    // Input: áudio (se existir)
    if (audioFile) {
      args.push('-i', audioFile);
    }

    // Filter complex: concatenar vídeos com loop para preencher duração
    let filterComplex = '';
    let numInputs = numScenes;

    // Se temos durações planejadas, repetir vídeos para atingir duração
    if (sceneDurations && sceneDurations.length === numScenes) {
      console.log(`[Worker] Creating loop filter to match scene durations`);
      console.log(`[Worker] 🔍 Detecting actual video durations...`);

      // DINÂMICO: Obter duração real de cada vídeo
      const videoDurations: number[] = [];
      for (let i = 0; i < videoFiles.length; i++) {
        const duration = await getVideoDuration(videoFiles[i]);
        videoDurations.push(duration);
      }
      console.log(`[Worker] 📊 Video durations: ${videoDurations.map(d => d.toFixed(2)).join('s, ')}s`);

      for (let i = 0; i < numScenes; i++) {
        const targetDuration = sceneDurations[i];
        const actualVideoDuration = videoDurations[i]; // ✅ DINÂMICO!
        const repetitions = Math.ceil(targetDuration / actualVideoDuration); // ✅ USA DURAÇÃO REAL!

        console.log(`[Worker] Scene ${i + 1}: actual ${actualVideoDuration.toFixed(2)}s, target ${targetDuration}s, repetitions: ${repetitions}`);

        // Criar filtro para repetir e trimpar
        if (repetitions === 1) {
          // Apenas um segmento - use como está
          filterComplex += `[${i}:v]trim=end=${targetDuration},setpts=PTS-STARTPTS[v${i}];`;
        } else {
          // Múltiplos segmentos - concatenar e trimpar
          let repeatPart = '';
          for (let r = 0; r < repetitions; r++) {
            repeatPart += `[${i}:v]`;
          }
          filterComplex += `${repeatPart}concat=n=${repetitions}:v=1:a=0[v${i}_repeat];[v${i}_repeat]trim=end=${targetDuration},setpts=PTS-STARTPTS[v${i}];`;
        }
      }

      // Concatenar todos os vídeos processados
      for (let i = 0; i < numScenes; i++) {
        filterComplex += `[v${i}]`;
      }
      filterComplex += `concat=n=${numScenes}:v=1:a=0[outv]`;
    } else {
      // Fallback: apenas concatenar sem loop
      console.log(`[Worker] Using simple concatenation (no durations provided)`);

      for (let i = 0; i < numScenes; i++) {
        filterComplex += `[${i}:v]setpts=PTS-STARTPTS[v${i}];`;
      }
      for (let i = 0; i < numScenes; i++) {
        filterComplex += `[v${i}]`;
      }
      filterComplex += `concat=n=${numScenes}:v=1:a=0[outv]`;
    }

    args.push('-filter_complex', filterComplex);
    args.push('-map', '[outv]');

    if (audioFile) {
      // Mapear áudio do arquivo de entrada
      args.push('-map', `${numScenes}:a:0`);
    }

    // Codificação VP9 (mais rápido - qualidade média)
    args.push('-c:v', 'libvpx-vp9');
    args.push('-deadline', 'realtime');  // Mais rápido
    args.push('-cpu-used', '8');         // Bem paralelo
    args.push('-b:v', '1500k');          // Bitrate menor = mais rápido
    args.push('-pix_fmt', 'yuv420p');

    if (audioFile) {
      args.push('-c:a', 'aac');          // AAC é mais rápido que opus
      args.push('-b:a', '128k');
      args.push('-shortest');             // Sincroniza com o mais curto
    }

    args.push('-movflags', '+faststart');
    args.push('-y', outputPath);

    console.log(`[Worker] Running FFmpeg with ${args.length} arguments...`);
    console.log(`[Worker] Filter complex: ${filterComplex}`);
    updateJobStatus(jobId, 'processing', 5);

    try {
      // Executar FFmpeg
      const { stdout, stderr } = await execa('ffmpeg', args);

      console.log(`[Worker] ✅ FFmpeg execution completed successfully`);
      console.log(`[Worker] Stdout length: ${stdout.toString().length} bytes`);
      updateJobStatus(jobId, 'processing', 90);

      // Verificar se o arquivo foi criado
      const stats = await fs.stat(outputPath);
      console.log(
        `[Worker] Output file created: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`
      );

      completeJob(jobId, outputPath);
      console.log(`[Worker] Job ${jobId} completed successfully`);
    } catch (ffmpegError: any) {
      const errorMsg = ffmpegError.message || String(ffmpegError);

      // Verificar se é erro de comando não encontrado
      if (errorMsg.includes('ENOENT') || errorMsg.includes('not found')) {
        const detailedError = `FFmpeg not found on system. Please install it:
  Ubuntu/Debian: sudo apt-get install -y ffmpeg
  macOS: brew install ffmpeg
  CentOS/RedHat: sudo yum install -y ffmpeg

Original error: ${errorMsg}`;
        console.error(`[Worker] ${detailedError}`);
        failJob(jobId, detailedError);
      } else {
        console.error(`[Worker] FFmpeg error:`, ffmpegError);
        failJob(jobId, errorMsg);
      }
    }
  } catch (error: any) {
    console.error(`[Worker] Error rendering job ${jobId}:`, error);
    failJob(jobId, error.message || 'Unknown error');
  }
}

// Simular processamento de fila
export async function processQueue() {
  console.log('[Worker] Queue processor started (mock mode)');
  // Em produção, isso processaria jobs da fila
  // Por enquanto, jobs são processados síncronamente
}

