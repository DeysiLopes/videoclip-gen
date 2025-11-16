/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Initializing FFmpeg with local files (CORS fix)');

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Log]:', message);
  });

  try {
    console.log('[FFmpeg Debug] Loading FFmpeg from local files...');

    // Use local files served by nginx (corrige CORS no GCP)
    // Em produção: /ffmpeg/... vem do nginx
    // Em dev: Vite serve de node_modules
    const isDev = import.meta.env.DEV;

    let baseURL: string;

    if (isDev) {
      // Desenvolvimento: usar jsDelivr (funciona local)
      baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
      console.log('[FFmpeg Debug] Development mode: using jsDelivr CDN');
    } else {
      // Produção: usar files locais servidos pelo nginx
      baseURL = '/ffmpeg';
      console.log('[FFmpeg Debug] Production mode: using local files');
    }

    try {
      // Tentar com toBlobURL (melhor performance)
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');

      console.log('[FFmpeg Debug] ✅ Blob URLs created');

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      console.log('[FFmpeg Debug] ✅ FFmpeg loaded successfully with toBlobURL');

    } catch (blobError) {
      console.warn('[FFmpeg Debug] toBlobURL failed, trying direct URLs:', blobError);

      // Fallback: URLs diretos
      const coreURL = `${baseURL}/ffmpeg-core.js`;
      const wasmURL = `${baseURL}/ffmpeg-core.wasm`;
      const workerURL = `${baseURL}/ffmpeg-core.worker.js`;

      console.log('[FFmpeg Debug] Using direct URLs...');
      console.log('[FFmpeg Debug] Core:', coreURL);
      console.log('[FFmpeg Debug] WASM:', wasmURL);
      console.log('[FFmpeg Debug] Worker:', workerURL);

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      console.log('[FFmpeg Debug] ✅ FFmpeg loaded from direct URLs');
    }

  } catch (e) {
    console.error('[FFmpeg Error] Failed to load FFmpeg:', e);
    console.error('[FFmpeg Error] Stack:', (e as any)?.stack);
    ffmpegSingleton = null;
    throw new Error(`Failed to load FFmpeg: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
  
  ffmpegSingleton = ffmpeg;
  console.log('[FFmpeg Debug] ✅ FFmpeg singleton ready and loaded');
  return ffmpeg;
}