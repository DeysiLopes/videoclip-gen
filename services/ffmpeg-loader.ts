/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
// Import URLs for the multi-threaded FFmpeg core files
import coreURLPath from '@ffmpeg/core-mt/dist/esm/ffmpeg-core.js?url';
import wasmURLPath from '@ffmpeg/core-mt/dist/esm/ffmpeg-core.wasm?url';
import workerURLPath from '@ffmpeg/core-mt/dist/esm/ffmpeg-core.worker.js?url';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Cross-origin isolation:',
    (globalThis as any).crossOriginIsolated ? 'true' : 'false');

  const ffmpeg = new FFmpeg();

  try {
    console.log('[FFmpeg Debug] Loading core from imported URLs...');
    await ffmpeg.load({
      coreURL:   await toBlobURL(coreURLPath, 'text/javascript'),
      wasmURL:   await toBlobURL(wasmURLPath, 'application/wasm'),
      workerURL: await toBlobURL(workerURLPath, 'text/javascript'),
    });
    console.log('[FFmpeg Debug] FFmpeg core loaded successfully.');
  } catch (e) {
    console.error('[FFmpeg Debug] FFmpeg core loading failed.', e);
    ffmpegSingleton = null; // Reset on failure
    throw e;
  }
  
  ffmpegSingleton = ffmpeg;
  return ffmpeg;
}
