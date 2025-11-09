/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Fix: Add a triple-slash directive to include Vite client types, resolving the TypeScript error for `import.meta.env`.
/// <reference types="vite/client" />

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Initializing FFmpeg instance...');

  const mt = (globalThis as any).crossOriginIsolated;
  console.log(
    `[FFmpeg Debug] Cross-origin isolation: ${mt}. Will use ${
      mt ? 'Multi-threaded' : 'Single-threaded'
    } core.`
  );

  const base =
    (import.meta.env.BASE_URL?.replace(/\/$/, '') || '') + (mt ? '/ffmpeg/mt' : '/ffmpeg/st');
    
  console.log('[FFmpeg Debug] Loading core from base:', base);

  const ffmpeg = new FFmpeg();

  try {
    const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm');
    const workerURL = mt 
      ? await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript')
      : undefined;

    await ffmpeg.load({ coreURL, wasmURL, workerURL });
    
    console.log('[FFmpeg Debug] FFmpeg core loaded successfully.');
    ffmpegSingleton = ffmpeg;
    return ffmpeg;

  } catch (e) {
    console.error('[FFmpeg Debug] FFmpeg core loading failed.', e);
    ffmpegSingleton = null;
    throw e;
  }
}
