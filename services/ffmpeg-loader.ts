/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Initializing single-threaded FFmpeg to ensure deployment compatibility.');

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Log]:', message);
  });

  try {
    console.log('[FFmpeg Debug] Loading single-threaded core from CDN...');
    // Use the single-threaded version (@ffmpeg/core) to avoid cross-origin isolation issues.
    // This is more reliable in deployment environments where server headers cannot be controlled.
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    console.log('[FFmpeg Debug] Attempting to load with toBlobURL...');
    try {
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

      console.log('[FFmpeg Debug] URLs prepared with toBlobURL, initiating load...');

      // The single-threaded version does not use a workerURL.
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      console.log('[FFmpeg Debug] FFmpeg core loaded successfully with toBlobURL.');
    } catch (blobError) {
      console.warn('[FFmpeg Debug] toBlobURL failed:', blobError);
      console.log('[FFmpeg Debug] Attempting to load direct URLs from CDN...');

      // Fallback: load directly from CDN without toBlobURL
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });

      console.log('[FFmpeg Debug] FFmpeg core loaded successfully with direct URLs.');
    }
  } catch (e) {
    console.error('[FFmpeg Debug] FFmpeg core loading failed.', e);
    ffmpegSingleton = null;
    throw new Error(`Failed to load FFmpeg: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
  
  ffmpegSingleton = ffmpeg;
  console.log('[FFmpeg Debug] FFmpeg singleton created and ready.');
  return ffmpeg;
}