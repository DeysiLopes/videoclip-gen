/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { Scene, SceneStatus } from '../types';

interface VisualTimelineProps {
  scenes: Scene[];
  totalDuration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  activeSceneId?: string;
  onReorderScene?: (sceneId: string, newTimestamp: number) => void;
}

const formatSeconds = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

const statusColors: Record<SceneStatus, string> = {
  [SceneStatus.DRAFT]: 'bg-gray-500',
  [SceneStatus.GENERATING]: 'bg-yellow-500 animate-pulse',
  [SceneStatus.GENERATED]: 'bg-blue-500',
  [SceneStatus.APPROVED]: 'bg-green-500',
  [SceneStatus.ERROR]: 'bg-red-500',
};


const VisualTimeline: React.FC<VisualTimelineProps> = ({ 
  scenes, 
  totalDuration, 
  currentTime,
  onSeek,
  activeSceneId,
  onReorderScene
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);

  if (totalDuration === 0) {
    return null;
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    // Fix: Property 'getBoundingClientRect' does not exist on type 'HTMLDivElement'.
    const rect = (timelineRef.current as any).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = totalDuration * percentage;
    onSeek(seekTime);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, scene: Scene) => {
    if (!onReorderScene) return;
    // Fix: Property 'setData' does not exist on type 'DataTransfer'.
    (e.dataTransfer as any).setData('application/json', JSON.stringify(scene));
    // Fix: Property 'effectAllowed' does not exist on type 'DataTransfer'.
    (e.dataTransfer as any).effectAllowed = 'move';
    setDraggedSceneId(scene.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!timelineRef.current || !onReorderScene) return;

    try {
        // Fix: Property 'getData' does not exist on type 'DataTransfer'.
        const sceneData = (e.dataTransfer as any).getData('application/json');
        if (!sceneData) return;
        
        const scene: Scene = JSON.parse(sceneData);

        // Fix: Property 'getBoundingClientRect' does not exist on type 'HTMLDivElement'.
        const rect = (timelineRef.current as any).getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, dropX / rect.width));
        const newTimestamp = totalDuration * percentage;

        onReorderScene(scene.id, newTimestamp);
    } catch (err) {
        console.error("Drop failed:", err);
    } finally {
        setDraggedSceneId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedSceneId(null);
  };


  const playheadPosition = (currentTime / totalDuration) * 100;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-gray-400 font-mono mb-1">
        <span>{formatSeconds(currentTime)}</span>
        <span>{formatSeconds(totalDuration)}</span>
      </div>
      <div 
        ref={timelineRef}
        className={`w-full h-8 bg-gray-900/50 rounded-lg relative group ${onReorderScene ? '' : 'cursor-pointer'}`}
        onClick={handleTimelineClick}
        onDragOver={onReorderScene ? handleDragOver : undefined}
        onDrop={onReorderScene ? handleDrop : undefined}
      >
        {/* Scene blocks */}
        {scenes.map((scene, index) => {
          // Use intendedDuration for visualization, fallback to actual duration
          const displayDuration = scene.intendedDuration ?? scene.duration;
          if (displayDuration === undefined) return null;

          const left = (scene.timestamp / totalDuration) * 100;
          const width = (displayDuration / totalDuration) * 100;
          
          const isActive = scene.id === activeSceneId;

          return (
            <div
              key={scene.id}
              draggable={!!onReorderScene}
              onDragStart={(e) => handleDragStart(e, scene)}
              onDragEnd={handleDragEnd}
              className={`absolute h-full rounded-md transition-all duration-150 ease-in-out ${statusColors[scene.status]} ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : 'opacity-70'} ${onReorderScene ? 'cursor-grab' : ''} transition-opacity ${draggedSceneId === scene.id ? 'opacity-30' : ''}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`Scene ${index + 1}: ${formatSeconds(scene.timestamp)} - ${formatSeconds(scene.timestamp + displayDuration)}`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Scene {index + 1}
              </div>
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white rounded-full pointer-events-none"
          style={{ left: `${playheadPosition}%` }}
        >
            <div className="w-2 h-2 bg-white rounded-full absolute -top-1 -left-[3px]"></div>
        </div>
      </div>
    </div>
  );
};

export default VisualTimeline;