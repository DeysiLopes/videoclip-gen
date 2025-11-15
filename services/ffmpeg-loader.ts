/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;

  console.log('[FFmpeg Debug] Cross-origin isolation:',
    (globalThis as any).crossOriginIsolated ? 'true' : 'false');

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Log]:', message);
  });

  try {
    console.log('[FFmpeg Debug] Loading core from CDN...');
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm';

    console.log('[FFmpeg Debug] Tentando carregar com toBlobURL...');
    try {
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');

      console.log('[FFmpeg Debug] URLs preparadas com toBlobURL, iniciando load...');

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      console.log('[FFmpeg Debug] FFmpeg core loaded successfully com toBlobURL.');
    } catch (blobError) {
      console.warn('[FFmpeg Debug] toBlobURL falhou:', blobError);
      console.log('[FFmpeg Debug] Tentando carregar URLs diretas do CDN...');

      // Fallback: carregar direto do CDN sem toBlobURL
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        workerURL: `${baseURL}/ffmpeg-core.worker.js`,
      });

      console.log('[FFmpeg Debug] FFmpeg core loaded successfully com URLs diretas.');
    }
  } catch (e) {
    console.error('[FFmpeg Debug] FFmpeg core loading failed.', e);
    ffmpegSingleton = null;
    throw new Error(`Falha ao carregar FFmpeg: ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
  }
  
  ffmpegSingleton = ffmpeg;
  console.log('[FFmpeg Debug] FFmpeg singleton criado e pronto.');
  return ffmpeg;
}