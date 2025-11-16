/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface RenderResponse {
  jobId: string;
  status: string;
  message: string;
}

export interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt?: string;
  completedAt?: string;
}

/**
 * Inicia uma renderização no backend
 */
export async function startRender(
  projectId: string,
  videoFiles: File[],
  audioFile?: File,
  sceneDurations?: number[]
): Promise<RenderResponse> {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('sceneDurations', JSON.stringify(sceneDurations || []));

  // Adicionar vídeos
  videoFiles.forEach((file, index) => {
    formData.append(`video_${index}`, file);
  });

  // Adicionar áudio
  if (audioFile) {
    formData.append('audio', audioFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/render`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start render');
  }

  return response.json();
}

/**
 * Obtém o status de um job de renderização
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get job status');
  }

  return response.json();
}

/**
 * Faz download do vídeo renderizado
 */
export async function downloadRender(
  jobId: string,
  filename: string = `render-${jobId}.mp4`
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/download/${jobId}`);

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || `Failed to download render: ${response.statusText}`);
    } catch {
      throw new Error(`Failed to download render: ${response.statusText}`);
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Poll de status (tira de tempos em tempos)
 */
export async function pollJobStatus(
  jobId: string,
  onProgress: (status: JobStatus) => void,
  interval: number = 2000,
  maxAttempts: number = 300 // 10 min com 2s interval
): Promise<JobStatus> {
  let attempts = 0;

  return new Promise(async (resolve, reject) => {
    const poller = setInterval(async () => {
      attempts++;

      try {
        const status = await getJobStatus(jobId);
        onProgress(status);

        // Se completou ou falhou, parar
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(poller);
          resolve(status);
          return;
        }

        // Se ultrapassou max attempts
        if (attempts >= maxAttempts) {
          clearInterval(poller);
          reject(new Error('Render job timeout'));
          return;
        }
      } catch (error) {
        clearInterval(poller);
        reject(error);
      }
    }, interval);
  });
}

