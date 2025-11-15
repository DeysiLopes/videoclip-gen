/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Initializing multi-threaded FFmpeg.');

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Log]:', message);
  });

  try {
    console.log('[FFmpeg Debug] Loading multi-threaded core from CDN...');
    // Use the multi-threaded version (@ffmpeg/core-mt) for better performance.
    // This requires a cross-origin isolated environment, enabled by coi-serviceworker.js.
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';

    console.log('[FFmpeg Debug] Attempting to load with toBlobURL...');
    try {
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
      
      console.log('[FFmpeg Debug] URLs prepared with toBlobURL, initiating load...');

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      console.log('[FFmpeg Debug] FFmpeg core loaded successfully with toBlobURL.');
    } catch (blobError) {
      console.warn('[FFmpeg Debug] toBlobURL failed:', blobError);
      console.log('[FFmpeg Debug] Attempting to load direct URLs from CDN...');

      // Fallback: load directly from CDN without toBlobURL
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        workerURL: `${baseURL}/ffmpeg-core.worker.js`,
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