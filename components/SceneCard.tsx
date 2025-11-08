/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useRef, useState} from 'react';
import {Scene, SceneStatus} from '../types';
import {
  ApproveIcon,
  ArrowPathIcon,
  ClockIcon,
  DeleteIcon,
  EditIcon,
  LoopIcon,
} from './icons';
import LoadingIndicator from './LoadingIndicator';

const formatSeconds = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

interface SceneCardProps {
  scene: Scene;
  sceneNumber: number;
  onUpdate: (id: string, updates: Partial<Scene>) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  isActive: boolean;
  isPlaying: boolean;
  masterCurrentTime: number;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  sceneNumber,
  onUpdate,
  onDelete,
  onGenerate,
  isActive,
  isPlaying,
  masterCurrentTime,
}) => {
  const [isEditing, setIsEditing] = useState(scene.status === SceneStatus.DRAFT);
  const [prompt, setPrompt] = useState(scene.prompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isApproved = scene.status === SceneStatus.APPROVED;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt, isEditing]);

   useEffect(() => {
    const video = videoRef.current;
    if (!video || !scene.duration) return;
    
    if (isActive && isPlaying) {
      // This is the core logic for synchronized looping
      const relativeTime = (masterCurrentTime - scene.timestamp) % scene.duration;
      
      // Seek only if the difference is significant to prevent stuttering from minor updates
      if (Math.abs(video.currentTime - relativeTime) > 0.2) {
        video.currentTime = relativeTime;
      }
      if (video.paused) {
        video.play().catch(e => console.error("Video play failed:", e));
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isActive, isPlaying, masterCurrentTime, scene.timestamp, scene.duration]);

  const handleSave = () => {
    onUpdate(scene.id, {
      prompt: prompt,
    });
    setIsEditing(false);
  };

  const handleApprove = () => {
    onUpdate(scene.id, {status: SceneStatus.APPROVED});
  }

  const handleUnapprove = () => {
    onUpdate(scene.id, { status: SceneStatus.GENERATED });
  }

  const durationLabel = scene.intendedDuration ? ` / ${formatSeconds(scene.intendedDuration)}` : '';
  const isLooping = scene.intendedDuration && scene.duration && scene.intendedDuration > scene.duration + 0.1;

  return (
    <div className={`bg-gray-800/60 rounded-xl border ${isApproved ? 'border-green-500/50' : 'border-gray-700'} shadow-lg transition-all`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white">Scene {sceneNumber}</h3>
          <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700 rounded-md px-2 py-1" title={`Starts at ${formatSeconds(scene.timestamp)}`}>
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-sm text-gray-300">{formatSeconds(scene.timestamp)}</span>
          </div>
        </div>
         {isEditing ? (
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe this scene... e.g., 'CENA 1 (0:00 – 0:35) - A singer appears...'"
            className="w-full bg-gray-700/50 p-2 rounded-md resize-none text-gray-200 placeholder-gray-500"
            rows={3}
          />
        ) : (
          <p className="text-gray-300 min-h-[40px] text-sm line-clamp-3">{scene.prompt}</p>
        )}
      </div>

      <div className="bg-black/30 aspect-video flex items-center justify-center overflow-hidden relative">
        {scene.status === SceneStatus.GENERATING && <LoadingIndicator />}
        {scene.videoUrl && (
          <>
            <video 
              ref={videoRef}
              src={scene.videoUrl} 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-mono flex items-center gap-1.5">
              {formatSeconds(scene.duration ?? 0)}{durationLabel}
              {isLooping && <LoopIcon className="w-3 h-3" title="This clip is looped to fill the intended duration" />}
            </div>
          </>
        )}
        {scene.status === SceneStatus.ERROR && (
           <div className="p-4 text-center">
             <p className="text-red-400 font-semibold mb-2">Generation Failed</p>
             {scene.errorType === 'QUOTA_EXCEEDED' ? (
                <p className="text-red-400/80 text-xs">
                    You have exceeded your API quota. Please check your plan and billing details.
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/rate-limits?hl=pt-br" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline hover:text-red-300 ml-1"
                    >
                        Learn more.
                    </a>
                </p>
             ) : (
                <p className="text-red-400/80 text-xs">{scene.errorMessage}</p>
             )}
           </div>
        )}
        {isApproved && (
          <div className="absolute top-2 right-2 bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full border border-green-500 flex items-center gap-1">
            <ApproveIcon className="w-3 h-3"/> Approved
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-900/30 rounded-b-xl flex items-center justify-between gap-2">
        <div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" title="Edit Scene"><EditIcon className="w-4 h-4"/></button>
          )}
          <button onClick={() => onDelete(scene.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full" title="Delete Scene"><DeleteIcon className="w-4 h-4"/></button>
        </div>
        <div>
        {isEditing ? (
          <button onClick={handleSave} className="px-4 py-1.5 bg-indigo-600 rounded-md text-sm font-semibold hover:bg-indigo-700">Save</button>
        ) : (
          <div className="flex items-center gap-2">
            {(scene.status === SceneStatus.GENERATED || scene.status === SceneStatus.ERROR) && (
              <button onClick={() => onGenerate(scene.id)} className="px-4 py-1.5 bg-gray-600 rounded-md text-sm font-semibold hover:bg-gray-700 flex items-center gap-2"><ArrowPathIcon className="w-4 h-4"/>Regenerate</button>
            )}
            {scene.status === SceneStatus.GENERATED && (
              <button onClick={handleApprove} className="px-4 py-1.5 bg-green-600 rounded-md text-sm font-semibold hover:bg-green-700 flex items-center gap-2"><ApproveIcon className="w-4 h-4"/>Approve</button>
            )}
             {isApproved && (
                <button onClick={handleUnapprove} className="px-4 py-1.5 bg-yellow-600 rounded-md text-sm font-semibold hover:bg-yellow-700">Un-approve</button>
             )}
            {scene.status === SceneStatus.DRAFT && (
              <button onClick={() => onGenerate(scene.id)} className="px-4 py-1.5 bg-indigo-600 rounded-md text-sm font-semibold hover:bg-indigo-700">Generate</button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SceneCard;