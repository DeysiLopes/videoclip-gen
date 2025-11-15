/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getFFmpeg} from '../services/ffmpeg-loader';
import {ProjectConfig, Scene, SceneStatus} from '../types';
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

  const sortedScenes = useMemo(() => {
    const scenesToShow = scenes.filter(
      (s) => s.status === SceneStatus.APPROVED || s.status === SceneStatus.GENERATED,
    );
    return [...scenesToShow].sort((a, b) => a.timestamp - b.timestamp);
  }, [scenes]);

  // Fix: Cannot find name 'HTMLAudioElement'.
  const audioRef = useRef<any>(null);
  // Fix: Cannot find name 'HTMLVideoElement'.
  const videoRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeScene, setActiveScene] = useState<Scene | null>(
    sortedScenes[0] || null,
  );

  const [phase, setPhase] = useState<'idle'|'loading'|'rendering'|'done'|'error'>('idle');
  const [currentPhase, setCurrentPhase] = useState<'encoding' | 'concatenating' | 'finalizing' | 'unknown'>('unknown');
  const [err, setErr] = useState<string|null>(null);
  const [url, setUrl] = useState<string|null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [invalidSceneNumbers, setInvalidSceneNumbers] = useState<number[]>([]);


  // Effect to check for scenes missing video data
  useEffect(() => {
    const scenesWithoutBlob = sortedScenes
        .map(s => {
            const sceneIndex = scenes.findIndex(os => os.id === s.id);
            return { scene: s, sceneNumber: sceneIndex + 1 };
        })
        .filter(item => !item.scene.videoBlob)
        .map(item => item.sceneNumber);
    setInvalidSceneNumbers(scenesWithoutBlob);
  }, [scenes, sortedScenes]);

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

    // Fix: Property 'currentTime' does not exist on type 'HTMLVideoElement'.
    if (Math.abs((video as any).currentTime - relativeTime) > 0.2) {
      // Fix: Property 'currentTime' does not exist on type 'HTMLVideoElement'.
      (video as any).currentTime = relativeTime;
    }

    // Fix: Property 'paused' does not exist on type 'HTMLVideoElement'.
    if (isPlaying && (video as any).paused) {
      // Fix: Property 'play' does not exist on type 'HTMLVideoElement'.
      (video as any).play().catch((e: Error) => console.error('FinalCut video play failed:', e));
    } else if (!isPlaying && !(video as any).paused) {
      // Fix: Property 'pause' does not exist on type 'HTMLVideoElement'.
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

  const triggerDownload = (downloadUrl: string, filename: string) => {
    if (!downloadUrl) return;
    const a = (window as any).document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    (window as any).document.body.appendChild(a);
    a.click();
    (window as any).document.body.removeChild(a);
  };

  const handleRender = async () => {
    setErr(null);
    setUrl(null);
    setPhase('loading');
    setRenderProgress(0);

    try {
      const ffmpeg = await getFFmpeg();

      setPhase('rendering');
      setCurrentPhase('encoding');
      setRenderProgress(0);

      ffmpeg.on('log', ({message}) => console.log('[FFmpeg Render Log]:', message));

      let lastProgressTime = Date.now();
      ffmpeg.on('progress', ({progress, time}) => {
        lastProgressTime = Date.now();
        if (progress >= 0 && progress <= 1) {
          const percentage = Math.round(progress * 100);
          setRenderProgress(percentage);
          console.log(`[FFmpeg Progress] ${percentage}% - ${time}s`);
        }
      });

      // 1. Write original video files
      console.log('[FFmpeg] Escrevendo vídeos...');
      for (let i = 0; i < sortedScenes.length; i++) {
        const scene = sortedScenes[i];
        if (scene.videoBlob) {
          const fileName = `in${i}.mp4`;
          const buf = new Uint8Array(await scene.videoBlob.arrayBuffer());
          await ffmpeg.writeFile(fileName, buf);
          console.log(`[FFmpeg] ✓ ${fileName} (${(scene.videoBlob.size / 1024 / 1024).toFixed(2)} MB)`);
        } else {
          const originalSceneIndex = scenes.findIndex(s => s.id === scene.id);
          throw new Error(`Cena ${originalSceneIndex + 1} sem vídeo`);
        }
      }

      // 2. Write audio
      const hasAudio = !!projectConfig.audioFile;
      if (hasAudio) {
        console.log('[FFmpeg] Escrevendo áudio...');
        const mbuf = new Uint8Array(await projectConfig.audioFile.arrayBuffer());
        await ffmpeg.writeFile('music.mp3', mbuf);
        console.log('[FFmpeg] ✓ Áudio escrito');
      }

      setCurrentPhase('concatenating');

      // 3. Build FFmpeg command with concat filter
      const args: string[] = [];

      // Add all video inputs
      for (let i = 0; i < sortedScenes.length; i++) {
        args.push('-i', `in${i}.mp4`);
      }

      // Add audio input
      if (hasAudio) {
        args.push('-i', 'music.mp3');
      }

      // Build filter complex: concat all videos
      let filterComplex = '';
      for (let i = 0; i < sortedScenes.length; i++) {
        filterComplex += `[${i}:v]`;
      }
      filterComplex += `concat=n=${sortedScenes.length}:v=1:a=0[outv]`;

      args.push('-filter_complex', filterComplex);
      args.push('-map', '[outv]');

      // Map audio
      if (hasAudio) {
        args.push('-map', `${sortedScenes.length}:a:0`);
      }

      // Encoding settings: VP9 PESADO (qualidade máxima)
      args.push('-c:v', 'libvpx-vp9');
      args.push('-deadline', 'good');          // Qualidade melhor (não realtime)
      args.push('-cpu-used', '0');             // Qualidade máxima (muito lento, mas melhor)
      args.push('-b:v', '3000k');              // Bitrate alto (3Mbps)
      args.push('-maxrate', '4000k');          // Taxa máxima
      args.push('-bufsize', '8000k');          // Buffer maior
      args.push('-pix_fmt', 'yuv420p');
      args.push('-tile-columns', '2');         // Melhor compressão
      args.push('-tile-rows', '2');            // Melhor compressão

      if (hasAudio) {
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k');
        args.push('-shortest');
      }

      args.push('-movflags', '+faststart');
      args.push('-y', 'out.mp4');

      console.log('[FFmpeg] Iniciando renderização...');
      console.log('[FFmpeg] Comando:', args.join(' '));

      setCurrentPhase('finalizing');
      const startTime = Date.now();
      await ffmpeg.exec(args);
      const elapsedTime = Date.now() - startTime;

      console.log(`[FFmpeg] ✅ Renderização completa em ${(elapsedTime / 1000).toFixed(1)}s`);

      // 4. Read and save output
      console.log('[FFmpeg] Lendo arquivo de saída...');
      const data = await ffmpeg.readFile('out.mp4');
      const sizeInMB = (data.length / 1024 / 1024).toFixed(2);
      console.log(`[FFmpeg] ✅ Arquivo lido: ${sizeInMB} MB`);

      const blob = new Blob([data], { type: 'video/mp4' });
      const href = URL.createObjectURL(blob);
      setUrl(href);
      setPhase('done');
      setRenderProgress(100);
      console.log('[FFmpeg] ========== RENDERIZAÇÃO SUCESSO ==========');

    } catch (e: any) {
      console.error('[FFmpeg Error]', e);
      setErr(`Falha na renderização: ${e?.message ?? String(e)}`);
      setPhase('error');
    }
  };

  const handleRenderPreview = async () => {
    setErr(null);
    setUrl(null);
    setPhase('loading');
    setRenderProgress(0);

    try {
      const ffmpeg = await getFFmpeg();

      setPhase('rendering');
      setCurrentPhase('concatenating');
      setRenderProgress(0);

      ffmpeg.on('log', ({message}) => console.log('[FFmpeg Preview Log]:', message));

      let lastProgressTime = Date.now();
      ffmpeg.on('progress', ({progress}) => {
        lastProgressTime = Date.now();
        if (progress >= 0 && progress <= 1) {
          setRenderProgress(Math.round(progress * 100));
        }
      });

      console.log('[FFmpeg Preview] 🎬 Trimando 5 segundos de cada vídeo (copy codec - SEM encoding)...');

      // 1. TRIM cada vídeo para 5 segundos (copy = muito rápido, sem re-encode)
      for (let i = 0; i < sortedScenes.length; i++) {
        const scene = sortedScenes[i];
        if (scene.videoBlob) {
          const fileName = `in${i}.mp4`;
          const buf = new Uint8Array(await scene.videoBlob.arrayBuffer());
          await ffmpeg.writeFile(fileName, buf);

          const trimmedFileName = `trimmed${i}.mp4`;
          console.log(`[FFmpeg Preview] ✂️ Trimando ${fileName} para 5s (copy codec)...`);

          await ffmpeg.exec([
            '-i', fileName,
            '-t', '5',
            '-c:v', 'copy',      // ⚡ SEM re-encoding!
            '-c:a', 'copy',      // ⚡ SEM re-encoding!
            '-y', trimmedFileName
          ]);

          console.log(`[FFmpeg Preview] ✓ ${trimmedFileName} criado`);
        }
      }

      // 2. Carregar áudio
      const hasAudio = !!projectConfig.audioFile;
      if (hasAudio) {
        console.log('[FFmpeg Preview] 🎵 Escrevendo arquivo de áudio...');
        const mbuf = new Uint8Array(await projectConfig.audioFile.arrayBuffer());
        await ffmpeg.writeFile('music.mp3', mbuf);
        console.log('[FFmpeg Preview] ✓ Áudio carregado');
      }

      // 3. CONCAT os vídeos trimados
      setCurrentPhase('concatenating');
      console.log('[FFmpeg Preview] 🔗 Concatenando vídeos trimados...');

      const numScenes = sortedScenes.length;
      let filterComplex = '';

      for (let i = 0; i < numScenes; i++) {
        filterComplex += `[${i}:v]`;
      }
      filterComplex += `concat=n=${numScenes}:v=1:a=0[outv]`;

      const args: string[] = [];

      // Inputs dos vídeos trimados (não originais)
      for (let i = 0; i < numScenes; i++) {
        args.push('-i', `trimmed${i}.mp4`);
      }

      if (hasAudio) {
        args.push('-i', 'music.mp3');
      }

      args.push('-filter_complex', filterComplex);
      args.push('-map', '[outv]');

      if (hasAudio) {
        const audioInputIndex = numScenes;
        args.push('-map', `${audioInputIndex}:a:0`);
      }

      // ⚡ Encoding leve para amostra
      args.push('-c:v', 'libx264');
      args.push('-preset', 'ultrafast');
      args.push('-crf', '28');
      args.push('-pix_fmt', 'yuv420p');
      args.push('-c:a', 'aac');
      args.push('-b:a', '128k');
      args.push('-shortest');
      args.push('-movflags', '+faststart');
      args.push('-y', 'preview.mp4');

      console.log('[FFmpeg Preview] ⚡ Usando: Trim (copy) + Concat + H.264 Ultrafast');
      console.log('[FFmpeg Preview] Comando:', args.join(' '));

      setCurrentPhase('finalizing');
      const startTime = Date.now();
      await ffmpeg.exec(args);
      const elapsedTime = Date.now() - startTime;

      console.log(`[FFmpeg Preview] ✅ Amostra pronta em ${(elapsedTime / 1000).toFixed(1)}s`);

      // 4. Read output
      const data = await ffmpeg.readFile('preview.mp4');
      const sizeInMB = (data.length / 1024 / 1024).toFixed(2);
      console.log(`[FFmpeg Preview] 📦 Arquivo: ${sizeInMB} MB`);

      const blob = new Blob([data], { type: 'video/mp4' });
      const href = URL.createObjectURL(blob);
      setUrl(href);
      setPhase('done');
      setRenderProgress(100);
      console.log('[FFmpeg Preview] ========== AMOSTRA COM TRIM (5seg/vídeo) ✅ ==========');
      triggerDownload(href, 'DreamDirector_Preview.mp4');

    } catch (e: any) {
      console.error('[FFmpeg Preview Error]', e);
      setErr(`Falha na amostra: ${e?.message ?? String(e)}`);
      setPhase('error');
    }
  };


  const handleDownload = () => {
    if (!url) return;
    triggerDownload(url, 'DreamDirector_FinalCut.mp4');
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const lastScene = sortedScenes[sortedScenes.length - 1];
      if (!lastScene) return;
      const lastSceneEndTime = lastScene.timestamp + (lastScene.intendedDuration ?? lastScene.duration ?? 0);
      // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
      if ((audioRef.current as any).currentTime >= lastSceneEndTime) {
        // Fix: Property 'pause' does not exist on type 'HTMLAudioElement'.
        (audioRef.current as any).pause();
        setIsPlaying(false);
        const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
        // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
        (audioRef.current as any).currentTime = firstSceneTimestamp;
        setCurrentTime(firstSceneTimestamp);
      } else {
        // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
        setCurrentTime((audioRef.current as any).currentTime);
      }
    }
  }, [sortedScenes]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      // Fix: Property 'duration' does not exist on type 'HTMLAudioElement'.
      setDuration((audioRef.current as any).duration);
      const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
      // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
      (audioRef.current as any).currentTime = firstSceneTimestamp;
      setCurrentTime(firstSceneTimestamp);
    }
  }, [sortedScenes]);

  const isRendering = phase === 'loading' || phase === 'rendering';
  const canRender = invalidSceneNumbers.length === 0;
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
          currentPhase={currentPhase}
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
                // Fix: Property 'currentTime' does not exist on type 'HTMLAudioElement'.
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
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-4">
                <button
                onClick={handleRender}
                disabled={isRendering || !canRender}
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
            <button
              onClick={handleRenderPreview}
              disabled={isRendering || !canRender}
              className="mt-2 px-6 py-3 bg-cyan-600 text-base rounded-lg font-semibold hover:bg-cyan-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                📹 Ver Amostra (5 seg cada cena)
            </button>
        </div>
        {!canRender ? (
            <div className="text-sm text-yellow-400 mt-4 text-center max-w-md p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <p className="font-bold">Renderização Bloqueada</p>
                <p className="mt-1">As seguintes cenas estão sem o arquivo de vídeo. Por favor, volte ao storyboard e gere-as novamente:</p>
                <ul className="list-disc list-inside mt-2 font-semibold">
                    {invalidSceneNumbers.map((sceneNumber) => (
                    <li key={sceneNumber}>Cena {sceneNumber}</li>
                    ))}
                </ul>
            </div>
        ) : phase === 'error' && (
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