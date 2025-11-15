/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Cross-origin isolation:',
    (globalThis as any).crossOriginIsolated ? 'true' : 'false');

  const ffmpeg = new FFmpeg();

  try {
    console.log('[FFmpeg Debug] Loading core from CDN...');
    const baseURL = 'https://aistudiocdn.com/@ffmpeg/core-mt@0.12.15/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });
    console.log('[FFmpeg Debug] FFmpeg core loaded successfully.');
  } catch (e) {
    console.error('[FFmpeg Debug] FFmpeg core loading failed.', e);
    ffmpegSingleton = null;
    throw new Error(`Falha ao carregar FFmpeg: ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
  }
  
  ffmpegSingleton = ffmpeg;
  return ffmpeg;
}