/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Initializing FFmpeg (v0.12.10 ESM with toBlobURL)');

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Log]:', message);
  });

  try {
    console.log('[FFmpeg Debug] Loading FFmpeg from CDN...');

    // Use ESM build with toBlobURL - most reliable approach
    // This converts files to blob URLs to avoid CORS and import issues
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

    console.log('[FFmpeg Debug] Converting to blob URLs for CORS safety...');

    try {
      // Convert URLs to blob URLs to avoid cross-origin issues
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');

      console.log('[FFmpeg Debug] ✅ Blob URLs created, loading FFmpeg...');

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      console.log('[FFmpeg Debug] ✅ FFmpeg loaded successfully with toBlobURL');

    } catch (blobError) {
      console.warn('[FFmpeg Debug] toBlobURL failed, trying direct URLs:', blobError);

      // Fallback: try jsDelivr with different path
      const fallbackBaseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';

      const coreURL = `${fallbackBaseURL}/ffmpeg-core.js`;
      const wasmURL = `${fallbackBaseURL}/ffmpeg-core.wasm`;

      console.log('[FFmpeg Debug] Trying fallback CDN (unpkg)...');

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      console.log('[FFmpeg Debug] ✅ FFmpeg loaded from fallback CDN');
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