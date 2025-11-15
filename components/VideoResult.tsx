/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useRef} from 'react';
import {GenerateVideoParams} from '../types';
import {ArrowPathIcon, PlusIcon, SparklesIcon} from './icons';

interface VideoResultProps {
  videoUrl: string;
  audioUrl: string | null;
  config: GenerateVideoParams;
  onRetry: () => void;
  onNewVideo: () => void;
  onExtend: () => void;
  canExtend: boolean;
}

const VideoResult: React.FC<VideoResultProps> = ({
  videoUrl,
  audioUrl,
  config,
  onRetry,
  onNewVideo,
  onExtend,
  canExtend,
}) => {
  // Fix: Cannot find name 'HTMLVideoElement'.
  const videoRef = useRef<any>(null);
  // Fix: Cannot find name 'HTMLAudioElement'.
  const audioRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio || !audioUrl) return;

    const startTime = config.sceneStartTime ?? 0;

    const syncPlay = () => {
      // Fix: Property 'currentTime', 'play' does not exist on type 'HTMLAudioElement'/'HTMLVideoElement'.
      (audio as any).currentTime = startTime + (video as any).currentTime;
      (audio as any).play();
    };
    // Fix: Property 'pause' does not exist on type 'HTMLAudioElement'.
    const syncPause = () => (audio as any).pause();
    const syncSeek = () => {
      // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'/'HTMLVideoElement'.
      (audio as any).currentTime = startTime + (video as any).currentTime;
    };
    const syncVolume = () => {
      // Fix: Property 'volume' does not exist on type 'HTMLAudioElement'/'HTMLVideoElement'.
      (audio as any).volume = (video as any).volume;
    };

    // Fix: Property 'addEventListener' does not exist on type 'HTMLVideoElement'.
    (video as any).addEventListener('play', syncPlay);
    (video as any).addEventListener('pause', syncPause);
    (video as any).addEventListener('seeking', syncSeek);
    (video as any).addEventListener('volumechange', syncVolume);

    // Initial sync
    syncVolume();

    return () => {
      // Fix: Property 'removeEventListener' does not exist on type 'HTMLVideoElement'.
      (video as any).removeEventListener('play', syncPlay);
      (video as any).removeEventListener('pause', syncPause);
      (video as any).removeEventListener('seeking', syncSeek);
      (video as any).removeEventListener('volumechange', syncVolume);
    };
  }, [audioUrl, config.sceneStartTime]);

  return (
    <div className="w-full flex flex-col items-center gap-8 p-8 bg-gray-800/50 rounded-lg border border-gray-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-200">
        Your Creation is Ready!
      </h2>
      <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          loop={!audioUrl}
          muted={!!audioUrl}
          className="w-full h-full object-contain"
        />
        {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
          <ArrowPathIcon className="w-5 h-5" />
          Retry
        </button>
        {canExtend && (
          <button
            onClick={onExtend}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
            <SparklesIcon className="w-5 h-5" />
            Extend
          </button>
        )}
        <button
          onClick={onNewVideo}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Create New Scene
        </button>
      </div>
    </div>
  );
};

export default VideoResult;