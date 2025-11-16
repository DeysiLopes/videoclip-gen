/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ProjectConfig, Scene, SceneStatus} from '../src/types';
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
  onReorderScene: (sceneId: string, newTimestamp: number) => void;
  onComplete: () => void;
  onBack: () => void;
  projectConfig: ProjectConfig;
  requestCount: number;
}

const Storyboard: React.FC<StoryboardProps> = ({
  scenes,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onGenerateScene,
  onReorderScene,
  onComplete,
  onBack,
  projectConfig,
  requestCount,
}) => {
  // Fix: Cannot find name 'HTMLAudioElement'.
  const audioRef = useRef<any>(null);
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
       // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
       const newTime = (audioRef.current as any).currentTime;
       setCurrentTime(newTime);

       // Intelligent Scene Looping
       if (isPlaying && activeScene) {
         const sceneEndTime = activeScene.timestamp + (activeScene.intendedDuration ?? activeScene.duration ?? 0);
         if (newTime >= sceneEndTime || newTime < activeScene.timestamp) {
           // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
           (audioRef.current as any).currentTime = activeScene.timestamp;
         }
       }
    }
  }, [isPlaying, activeScene]);

  const handleLoadedMetadata = useCallback(() => {
     if (audioRef.current) {
       // Fix: Property 'duration' does not exist on type 'HTMLAudioElement'.
       setDuration((audioRef.current as any).duration);
    }
  }, []);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
      (audioRef.current as any).currentTime = time;
      setCurrentTime(time);

      // Dar play automaticamente quando o usuário clica na timeline
      if ((audioRef.current as any).paused) {
        (audioRef.current as any).play().catch((e: Error) => {
          console.warn('Não foi possível dar play automaticamente:', e);
        });
      }
    }
  }

  const handleSeekToScene = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene && audioRef.current) {
      (audioRef.current as any).currentTime = scene.timestamp;
      setCurrentTime(scene.timestamp);

      // Dar play automaticamente
      if ((audioRef.current as any).paused) {
        (audioRef.current as any).play().catch((e: Error) => {
          console.warn('Não foi possível dar play automaticamente:', e);
        });
      }
    }
  }, [scenes]);

  const generatedOrApprovedScenes = scenes.filter(s => s.status === SceneStatus.GENERATED || s.status === SceneStatus.APPROVED).length;
  const canProceed = scenes.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      {projectConfig.audioUrl && (
        <div className="mb-4 p-4 bg-gray-800 rounded-xl border border-gray-700 w-full flex-shrink-0">
          <h3 className="text-lg font-semibold text-white mb-2">Faixa de Áudio</h3>
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
              onReorderScene={onReorderScene}
            />
        </div>
      )}

      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {scenes.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl text-gray-500">Seu storyboard está vazio.</h2>
            <p className="text-gray-600 mt-2">Clique em "Adicionar Cena" para começar a criar seu vídeo.</p>
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
                onSeekToScene={handleSeekToScene}
                isActive={scene.id === activeScene?.id}
                isPlaying={isPlaying}
                masterCurrentTime={currentTime}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 mt-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <ArrowLeftIcon className="w-5 h-5" />
            Voltar para Configuração
          </button>
          <button
            onClick={onAddScene}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Adicionar Cena
          </button>
        </div>
        <div className="w-full md:w-auto text-center md:text-right">
          <div className="flex items-center gap-4 justify-center md:justify-end">
            <div className="text-sm text-gray-400" title="Esta é uma estimativa baseada na cota padrão do nível gratuito.">
              Requisições Diárias: <span className="font-semibold text-white">{requestCount} / 10</span>
            </div>
            <button
              onClick={onComplete}
              disabled={!canProceed}
              className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg inline-flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed">
              Ir para o Corte Final ({generatedOrApprovedScenes})
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
          {!canProceed && (
            <p className="text-xs text-gray-500 mt-1">
              Adicione pelo menos uma cena para continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storyboard;