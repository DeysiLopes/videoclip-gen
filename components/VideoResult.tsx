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
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio || !audioUrl) return;

    const startTime = config.sceneStartTime ?? 0;

    const syncPlay = () => {
      audio.currentTime = startTime + video.currentTime;
      audio.play();
    };
    const syncPause = () => audio.pause();
    const syncSeek = () => {
      audio.currentTime = startTime + video.currentTime;
    };
    const syncVolume = () => {
      audio.volume = video.volume;
    };

    video.addEventListener('play', syncPlay);
    video.addEventListener('pause', syncPause);
    video.addEventListener('seeking', syncSeek);
    video.addEventListener('volumechange', syncVolume);

    // Initial sync
    syncVolume();

    return () => {
      video.removeEventListener('play', syncPlay);
      video.removeEventListener('pause', syncPause);
      video.removeEventListener('seeking', syncSeek);
      video.removeEventListener('volumechange', syncVolume);
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
