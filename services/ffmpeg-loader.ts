/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';

let cached: FFmpeg | null = null;

function so(path: string) {
  const b = (import.meta as any).env?.BASE_URL ?? '/';
  const root = b.endsWith('/') ? b.slice(0, -1) : b;
  return root + path;
}

function assertSameOrigin(u?: string) {
  if (!u) return;
  if (u.startsWith('blob:')) throw new Error('NÃO use Blob URL para o core do FFmpeg.');
  if (/unpkg|jsdelivr|aistudiocdn/i.test(u)) throw new Error('NÃO use CDN para o core do FFmpeg.');
  if (/^https?:\/\//.test(u) && !u.includes(location.host)) {
    throw new Error('Core do FFmpeg deve ser same-origin.');
  }
}

export async function getFFmpeg(): Promise<FFmpeg> {
  if (cached) return cached;
  
  console.log('[FFmpeg Debug] Initializing FFmpeg instance...');

  const mt = (typeof crossOriginIsolated !== 'undefined') && crossOriginIsolated === true;
  console.log(
    `[FFmpeg Debug] Cross-origin isolation: ${mt}. Will use ${
      mt ? 'Multi-threaded' : 'Single-threaded'
    } core.`,
  );
  
  const dir = mt ? '/ffmpeg/mt' : '/ffmpeg/st';

  const coreURL   = so(`${dir}/ffmpeg-core.js`);
  const wasmURL   = so(`${dir}/ffmpeg-core.wasm`);
  const workerURL = so(`${dir}/ffmpeg-core.worker.js`);

  [coreURL, wasmURL, workerURL].forEach(assertSameOrigin);

  const ffmpeg = new FFmpeg();
  
  console.log(`[FFmpeg Debug] Loading core from: ${coreURL}`);

  // Tenta com worker; se 404 (comum em ST), tenta sem
  try {
    await ffmpeg.load({ coreURL, wasmURL, workerURL });
  } catch (e) {
    console.warn('[FFmpeg Debug] Loading with worker failed, trying without...', e);
    await ffmpeg.load({ coreURL, wasmURL });
  }
  
  console.log('[FFmpeg Debug] FFmpeg core loaded successfully.');

  cached = ffmpeg;
  return ffmpeg;
}