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
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeScene, setActiveScene] = useState<Scene | null>(sortedScenes[0] || null);

  // Effect to find the active scene based on audio time
  useEffect(() => {
    const scene = sortedScenes.find(s => {
        const sceneDuration = s.intendedDuration ?? s.duration ?? 0;
        if (sceneDuration === 0) return false;
        return currentTime >= s.timestamp && currentTime < s.timestamp + sceneDuration;
    });
    // Set activeScene only if it's different to avoid re-renders
    setActiveScene(current => (current?.id !== scene?.id ? (scene || null) : current));
  }, [currentTime, sortedScenes]);

  // Effect to control the video player based on active scene and audio time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeScene) return;

    // This is the core logic for synchronized looping within the scene's slot
    const sceneStartTime = activeScene.timestamp;
    const sceneActualDuration = activeScene.duration ?? 1; // Avoid division by zero
    const relativeTime = (currentTime - sceneStartTime) % sceneActualDuration; 

    // Seek only if the difference is significant to prevent stuttering
    if (Math.abs(video.currentTime - relativeTime) > 0.2) {
      video.currentTime = relativeTime;
    }

    // Sync play/pause state
    if (isPlaying && video.paused) {
      video.play().catch(e => console.error("FinalCut video play failed:", e));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [activeScene, currentTime, isPlaying]);


  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
       // If paused at the end, restart from the beginning of the first scene
      if (currentTime >= duration - 0.1 && duration > 0) {
        const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
        audio.currentTime = firstSceneTimestamp;
        setCurrentTime(firstSceneTimestamp);
      }
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
        const lastScene = sortedScenes[sortedScenes.length - 1];
        if (!lastScene) return;
        
        const lastSceneEndTime = lastScene.timestamp + (lastScene.intendedDuration ?? lastScene.duration ?? 0);

        // Auto-pause and reset when the last scene finishes
        if (audioRef.current.currentTime >= lastSceneEndTime) {
            audioRef.current.pause();
            setIsPlaying(false);
            const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
            audioRef.current.currentTime = firstSceneTimestamp;
            setCurrentTime(firstSceneTimestamp);
        } else {
             setCurrentTime(audioRef.current.currentTime);
        }
    }
  }, [sortedScenes]);

  const handleLoadedMetadata = useCallback(() => {
     if (audioRef.current) {
       setDuration(audioRef.current.duration);
       const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
       audioRef.current.currentTime = firstSceneTimestamp;
       setCurrentTime(firstSceneTimestamp);
    }
  }, [sortedScenes]);
  
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
          key={activeScene?.id}
          src={activeScene?.videoUrl}
          muted
          loop
          playsInline
          className="w-full h-full object-contain"
        />
        {activeScene && (
          <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded-md max-w-[calc(100%-2rem)]">
            <p className="text-white text-sm truncate">Scene {sortedScenes.findIndex(s => s.id === activeScene.id) + 1}: {activeScene.prompt}</p>
          </div>
        )}
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
              onSeek={() => {}} // Seeking disabled in final cut preview
              activeSceneId={activeScene?.id}
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