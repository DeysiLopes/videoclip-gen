/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ProjectConfig, Scene, SceneStatus} from '../types';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
} from './icons';
import SceneCard from './SceneCard';
import VisualTimeline from './VisualTimeline';


interface StoryboardProps {
  scenes: Scene[];
  onAddScene: () => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onDeleteScene: (id: string) => void;
  onGenerateScene: (sceneId: string) => void;
  onComplete: () => void;
  onBack: () => void;
  projectConfig: ProjectConfig;
}

const Storyboard: React.FC<StoryboardProps> = ({
  scenes,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onGenerateScene,
  onComplete,
  onBack,
  projectConfig
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const activeScene = scenes.find(s => {
    const sceneDuration = s.intendedDuration ?? s.duration;
    if (sceneDuration === undefined) return false;
    return currentTime >= s.timestamp && currentTime < s.timestamp + sceneDuration;
  });

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
       const newTime = audioRef.current.currentTime;
       setCurrentTime(newTime);

       // Intelligent Scene Looping
       if (isPlaying && activeScene) {
         const sceneEndTime = activeScene.timestamp + (activeScene.intendedDuration ?? activeScene.duration ?? 0);
         if (newTime >= sceneEndTime || newTime < activeScene.timestamp) {
           audioRef.current.currentTime = activeScene.timestamp;
         }
       }
    }
  }, [isPlaying, activeScene]);

  const handleLoadedMetadata = useCallback(() => {
     if (audioRef.current) {
       setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }

  const approvedScenesCount = scenes.filter(s => s.status === SceneStatus.APPROVED).length;

  return (
    <div className="w-full h-full flex flex-col">
      {projectConfig.audioUrl && (
        <div className="mb-4 p-4 bg-gray-800 rounded-xl border border-gray-700 w-full flex-shrink-0">
          <h3 className="text-lg font-semibold text-white mb-2">Audio Track</h3>
          <audio 
            ref={audioRef} 
            src={projectConfig.audioUrl} 
            controls 
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
           />
           <VisualTimeline
              scenes={scenes}
              totalDuration={duration}
              currentTime={currentTime}
              onSeek={handleSeek}
              activeSceneId={activeScene?.id}
            />
        </div>
      )}

      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {scenes.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl text-gray-500">Your storyboard is empty.</h2>
            <p className="text-gray-600 mt-2">Click "Add Scene" to start creating your video.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene, index) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                sceneNumber={index + 1}
                onUpdate={onUpdateScene}
                onDelete={onDeleteScene}
                onGenerate={onGenerateScene}
                isActive={scene.id === activeScene?.id}
                isPlaying={isPlaying}
                masterCurrentTime={currentTime}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 mt-4 border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Setup
          </button>
          <button
            onClick={onAddScene}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Add Scene
          </button>
        </div>
        <div className="text-right">
          <button
            onClick={onComplete}
            disabled={scenes.length === 0}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg inline-flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed">
            Proceed to Final Cut ({approvedScenesCount})
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          {scenes.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Add at least one scene to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storyboard;