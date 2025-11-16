/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Scene {
  id: string;
  videoBlob: Buffer;
  duration: number;
  intendedDuration?: number;
  timestamp: number;
}

export interface RenderRequest {
  projectId: string;
  scenes: Scene[];
  audioBlob?: Buffer;
  quality?: 'low' | 'medium' | 'high';
}

export interface RenderJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  outputPath?: string;
  error?: string;
}

export interface RenderResponse {
  jobId: string;
  status: string;
  progress: number;
  message: string;
}

