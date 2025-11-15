/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GenerateVideoParams } from '../types';

interface VideoHistoryProps {
  history: { videoUrl: string; lastConfig: GenerateVideoParams }[];
}

const formatSeconds = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const VideoHistory: React.FC<VideoHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-black/50 backdrop-blur-sm p-4 border-t border-gray-700 shrink-0">
      <h3 className="text-lg font-semibold text-gray-300 mb-3 text-center">Generated Scenes</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {history.map((item, index) => {
          const startTime = item.lastConfig.sceneStartTime;
          return (
            <div key={index} className="flex-shrink-0 w-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg group relative">
              <video
                src={item.videoUrl}
                muted
                loop
                autoPlay
                playsInline
                className="w-full h-28 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                <p className="text-white text-xs line-clamp-2">{item.lastConfig.prompt}</p>
                 {startTime !== undefined && (
                  <p className="text-indigo-300 text-xs mt-1 font-mono">
                    Starts at: {formatSeconds(startTime)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoHistory;