/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton) return ffmpegSingleton;

  const base = ((import.meta as any).env?.BASE_URL?.replace(/\/$/, '') || '') + '/ffmpeg/st';

  console.log('[FFmpeg Debug] Cross-origin isolation:',
    (globalThis as any).crossOriginIsolated ? 'true' : 'false');
  console.log('[FFmpeg Debug] Loading core from base:', base);

  const ffmpeg = new FFmpeg();

  try {
    await ffmpeg.load({
      coreURL:   await toBlobURL(`${base}/ffmpeg-core.js?v=0.12.10`,        'text/javascript'),
      wasmURL:   await toBlobURL(`${base}/ffmpeg-core.wasm?v=0.12.10`,      'application/wasm'),
      workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js?v=0.12.10`, 'text/javascript'),
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