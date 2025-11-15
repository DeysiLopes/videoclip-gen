/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {getFFmpeg} from '../services/ffmpeg-loader';
import {AspectRatio, ProjectConfig, Scene, SceneStatus} from '../types';
import RenderProgressDialog from './RenderProgressDialog';
import VisualTimeline from './VisualTimeline';

interface FinalCutProps {
  scenes: Scene[];
  projectConfig: ProjectConfig;
  onBack: () => void;
}

const FinalCut: React.FC<FinalCutProps> = ({
  scenes,
  projectConfig,
  onBack,
}) => {
  const {audioUrl} = projectConfig;
  const scenesToShow = scenes.filter(
    (s) => s.status === SceneStatus.APPROVED || s.status === SceneStatus.GENERATED,
  );
  const sortedScenes = [...scenesToShow].sort((a, b) => a.timestamp - b.timestamp);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeScene, setActiveScene] = useState<Scene | null>(
    sortedScenes[0] || null,
  );
  
  const [phase, setPhase] = useState<'idle'|'loading'|'rendering'|'done'|'error'>('idle');
  const [err, setErr] = useState<string|null>(null);
  const [url, setUrl] = useState<string|null>(null);
  const [renderProgress, setRenderProgress] = useState(0);

  // Effect to find the active scene based on audio time
  useEffect(() => {
    const scene = sortedScenes.find((s) => {
      const sceneDuration = s.intendedDuration ?? s.duration ?? 0;
      if (sceneDuration === 0) return false;
      return currentTime >= s.timestamp && currentTime < s.timestamp + sceneDuration;
    });
    setActiveScene((current) =>
      current?.id !== scene?.id ? scene || null : current,
    );
  }, [currentTime, sortedScenes]);

  // Effect to control the video player based on active scene and audio time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeScene) return;

    const sceneStartTime = activeScene.timestamp;
    const sceneActualDuration = activeScene.duration ?? 1;
    const relativeTime = (currentTime - sceneStartTime) % sceneActualDuration;

    if (Math.abs((video as any).currentTime - relativeTime) > 0.2) {
      (video as any).currentTime = relativeTime;
    }

    if (isPlaying && (video as any).paused) {
      (video as any).play().catch((e: Error) => console.error('FinalCut video play failed:', e));
    } else if (!isPlaying && !(video as any).paused) {
      (video as any).pause();
    }
  }, [activeScene, currentTime, isPlaying]);

  // Cleanup blob URL on unmount
  useEffect(() => {
      return () => {
          if (url) {
              URL.revokeObjectURL(url);
          }
      }
  }, [url]);

  const handleRender = async () => {
    setErr(null);
    setUrl(null);
    setPhase('loading');
    setRenderProgress(0);

    try {
      const ffmpeg = await getFFmpeg();

      ffmpeg.on('log', ({message}) => console.log('[FFmpeg Log]:', message));
      ffmpeg.on('progress', ({progress}) => {
        if (progress >= 0 && progress <= 1) {
          const percentage = Math.round(progress * 100);
          setRenderProgress(percentage);
        }
      });
      
      // 1. Write all media files to FFmpeg's virtual file system
      for (let i = 0; i < sortedScenes.length; i++) {
        const scene = sortedScenes[i];
        if (scene.videoBlob) {
          const fileName = `in${i}.mp4`;
          const buf = new Uint8Array(await scene.videoBlob.arrayBuffer());
          await ffmpeg.writeFile(fileName, buf);
        } else {
          throw new Error(`Scene ${i + 1} is missing video data.`);
        }
      }
      
      const hasAudio = !!projectConfig.audioFile;
      if (hasAudio) {
        const mbuf = new Uint8Array(await projectConfig.audioFile.arrayBuffer());
        await ffmpeg.writeFile('music.mp3', mbuf);
      }

      // 2. Build the FFmpeg command args using the robust `concat` filter
      const args: string[] = [];
      const videoInputs: string[] = [];
      const filterComplexParts: string[] = [];

      // Add all video files as inputs and prepare filter parts
      for (let i = 0; i < sortedScenes.length; i++) {
        const fileName = `in${i}.mp4`;
        videoInputs.push('-i', fileName);
        filterComplexParts.push(`[${i}:v]`);
      }

      args.push(...videoInputs);

      if (hasAudio) {
        args.push('-i', 'music.mp3');
      }

      const numScenes = sortedScenes.length;
      if (numScenes === 0) {
        throw new Error("No scenes to render.");
      }

      // 3. Build the filter_complex argument and map streams
      if (numScenes > 1) {
        const concatFilter = `${filterComplexParts.join('')}concat=n=${numScenes}:v=1:a=0[outv]`;
        args.push('-filter_complex', concatFilter);
        args.push('-map', '[outv]'); // Map the output of the concat filter
      } else {
        // Only one video, just map it directly
        args.push('-map', '0:v:0');
      }

      if (hasAudio) {
        // Audio is always the last input, so its index is numScenes
        args.push('-map', `${numScenes}:a:0`); 
      }
      
      // 4. Set encoding options
      args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '23', '-r', '24');

      if (hasAudio) {
        args.push('-c:a', 'aac', '-b:a', '192k');
        // End encoding when the shorter of audio/video finishes. This is key for syncing.
        args.push('-shortest'); 
      }

      args.push('-movflags', '+faststart', '-y', 'out.mp4');
      
      setPhase('rendering');
      console.log('Executing FFmpeg with robust concat filter args:', args);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile('out.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      const href = URL.createObjectURL(blob);
      setUrl(href);
      setPhase('done');
    } catch (e: any) {
      console.error('[FFmpeg Error]', e);
      setErr(String(e?.message ?? e));
      setPhase('error');
    }
  };


  const handleDownload = () => {
    if (!url) return;
    const a = (window as any).document.createElement('a');
    a.href = url;
    a.download = 'DreamDirector_FinalCut.mp4';
    (window as any).document.body.appendChild(a);
    a.click();
    (window as any).document.body.removeChild(a);
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const lastScene = sortedScenes[sortedScenes.length - 1];
      if (!lastScene) return;
      const lastSceneEndTime = lastScene.timestamp + (lastScene.intendedDuration ?? lastScene.duration ?? 0);
      if ((audioRef.current as any).currentTime >= lastSceneEndTime) {
        (audioRef.current as any).pause();
        setIsPlaying(false);
        const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
        (audioRef.current as any).currentTime = firstSceneTimestamp;
        setCurrentTime(firstSceneTimestamp);
      } else {
        setCurrentTime((audioRef.current as any).currentTime);
      }
    }
  }, [sortedScenes]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration((audioRef.current as any).duration);
      const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
      (audioRef.current as any).currentTime = firstSceneTimestamp;
      setCurrentTime(firstSceneTimestamp);
    }
  }, [sortedScenes]);

  const isRendering = phase === 'loading' || phase === 'rendering';
  const canDownload = phase === 'done' && !!url;

  const renderButtonText = {
      'idle': 'Renderizar Vídeo',
      'loading': 'Carregando Mecanismo...',
      'rendering': `Renderizando... ${renderProgress}%`,
      'done': 'Renderizar Novamente',
      'error': 'Falha na Renderização - Tente Novamente'
  }[phase];

  if (sortedScenes.length === 0) {
    return (
      <div className="text-center flex-grow flex flex-col items-center justify-center">
        <h2 className="text-2xl text-gray-500">
          Nenhuma cena gerada ou aprovada.
        </h2>
        <p className="text-gray-600 mt-2">
          Volte e gere algumas cenas para visualizar o corte final.
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          Voltar para o Storyboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      {isRendering && (
        <RenderProgressDialog
          message={phase === 'loading' ? 'Carregando núcleo FFmpeg...' : 'Renderizando vídeo... Isso pode levar alguns minutos.'}
          progress={renderProgress}
        />
      )}
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
            <p className="text-white text-sm truncate">
              Cena {sortedScenes.findIndex((s) => s.id === activeScene.id) + 1}:{' '}
              {activeScene.prompt}
            </p>
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
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls
            className="w-full"
          />
          <VisualTimeline
            scenes={sortedScenes}
            totalDuration={duration}
            currentTime={currentTime}
            onSeek={(time) => {
              if (audioRef.current) {
                (audioRef.current as any).currentTime = time;
                setCurrentTime(time);
              }
            }}
            activeSceneId={activeScene?.id}
          />
        </div>
      )}

      <div className="flex flex-col items-center gap-6 mt-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700 w-full max-w-3xl">
        <h3 className="text-2xl font-bold text-white">Exporte Sua Obra-Prima</h3>
        <p className="text-gray-400 text-center max-w-lg">
          Combine todas as suas cenas aprovadas e a faixa de áudio principal em um
          único arquivo de vídeo. Este processo acontece inteiramente no seu navegador.
        </p>
        <div className="flex items-center gap-4">
            <button
              onClick={handleRender}
              disabled={isRendering}
              className="px-8 py-4 bg-indigo-600 text-lg rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
              {renderButtonText}
            </button>
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className="px-8 py-4 bg-green-600 text-lg rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                Baixar
            </button>
        </div>
        {phase === 'error' && (
            <p className="text-sm text-red-400 mt-2 text-center max-w-md">{err}</p>
        )}
        <p className="text-xs text-gray-500 text-center mt-2">
          A renderização pode levar vários minutos, dependendo da duração do vídeo e
          do desempenho do seu computador.
        </p>
        <div className="mt-4">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            Voltar para o Storyboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalCut;