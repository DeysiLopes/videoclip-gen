/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Scene} from '../types';
import VisualTimeline from './VisualTimeline';

interface FinalCutProps {
  scenes: Scene[];
  audioUrl: string | null;
  onBack: () => void;
}

const FinalCut: React.FC<FinalCutProps> = ({scenes, audioUrl, onBack}) => {
  const sortedScenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      if (currentSceneIndex < sortedScenes.length - 1) {
        setCurrentSceneIndex(currentSceneIndex + 1);
      } else {
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    };
    
    video.addEventListener('ended', handleVideoEnd);
    return () => video.removeEventListener('ended', handleVideoEnd);

  }, [currentSceneIndex, sortedScenes.length]);

  useEffect(() => {
     if (isPlaying && videoRef.current) {
       videoRef.current.play();
     }
  }, [currentSceneIndex, isPlaying]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (isPlaying) {
      video.pause();
      audio.pause();
    } else {
      audio.currentTime = sortedScenes[currentSceneIndex].timestamp + video.currentTime;
      video.play();
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleDownloadAll = () => {
     sortedScenes.forEach((scene, index) => {
       if (scene.videoBlob) {
         const a = document.createElement('a');
         a.href = URL.createObjectURL(scene.videoBlob);
         a.download = `scene_${String(index + 1).padStart(2, '0')}.mp4`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(a.href);
       }
     })
  };
  
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
       setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
     if (audioRef.current) {
       setDuration(audioRef.current.duration);
    }
  }, []);


  const currentScene = sortedScenes[currentSceneIndex];
  
  if (sortedScenes.length === 0) {
      return (
         <div className="text-center flex-grow flex flex-col items-center justify-center">
            <h2 className="text-2xl text-gray-500">No approved scenes.</h2>
            <p className="text-gray-600 mt-2">Go back to the storyboard to approve some scenes first.</p>
             <button
              onClick={onBack}
              className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              Back to Storyboard
            </button>
          </div>
      )
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden bg-black shadow-lg relative">
        <video
          ref={videoRef}
          key={currentScene.id}
          src={currentScene.videoUrl}
          muted
          className="w-full h-full object-contain"
        />
        <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded-md max-w-[calc(100%-2rem)]">
           <p className="text-white text-sm truncate">Scene {currentSceneIndex + 1}: {currentScene.prompt}</p>
        </div>
      </div>
       {audioUrl && (
          <div className="w-full max-w-3xl">
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
            <VisualTimeline
              scenes={sortedScenes}
              totalDuration={duration}
              currentTime={currentTime}
              onSeek={() => {}}
              activeSceneId={currentScene.id}
            />
           </div>
       )}
       
      <div className="flex flex-col items-center gap-4">
        <button onClick={handlePlayPause} className="px-8 py-3 bg-purple-600 text-lg rounded-full font-bold">
           {isPlaying ? "Pause" : "Play Full Video"}
        </button>
        <div className="flex gap-4">
           <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              Back to Storyboard
            </button>
            <button
              onClick={handleDownloadAll}
              className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              Download All Clips ({sortedScenes.length})
            </button>
        </div>
      </div>
      
       <div className="mt-4 text-center max-w-2xl">
          <h3 className="text-xl font-bold">Final Assembly</h3>
          <p className="text-gray-400 mt-2">
            Your final cut is ready for assembly! Download your approved clips and combine them with your audio track in your favorite video editor to produce the final music video.
          </p>
        </div>
    </div>
  );
};

export default FinalCut;
