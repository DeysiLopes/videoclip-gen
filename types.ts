/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum AppMode {
  SETUP = 'Configuração do Projeto',
  STORYBOARD = 'Storyboard',
  FINAL_CUT = 'Corte Final',
}

export enum VeoModel {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

// This is no longer used by the UI, but kept for reference
export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  REMIX_VIDEO = 'Remix Video',
  EXTEND_VIDEO = 'Extend Video',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface VideoFile {
  file: File;
  base64: string;
}
export interface ProjectConfig {
  technicalSheet: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  characterImages: ImageFile[];
  styleImages: ImageFile[];
  audioFile: File | null;
  audioUrl: string | null;
}

export enum SceneStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  ERROR = 'ERROR',
}

export interface Scene {
  id: string;
  timestamp: number; // in seconds
  duration?: number; // actual generated video duration
  intendedDuration?: number; // duration specified in prompt
  prompt: string;
  status: SceneStatus;
  videoUrl?: string;
  videoBlob?: Blob;
  videoObject?: Video;
  errorMessage?: string;
  errorType?: 'QUOTA_EXCEEDED';
  isUploaded?: boolean;
}

export interface VeoApiParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  durationSeconds?: number;
  referenceImages?: ImageFile[];
  styleImage?: ImageFile | null;
  inputVideo?: Video | null;
}

// Legacy type, no longer in active use by the new UI flow
export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  sceneStartTime?: number;
  startFrame?: ImageFile | null;
  endFrame?: ImageFile | null;
  referenceImages?: ImageFile[];
  styleImage?: ImageFile | null;
  inputVideo?: VideoFile | null;
  inputVideoObject?: Video | null;
  isLooping?: boolean;
}
