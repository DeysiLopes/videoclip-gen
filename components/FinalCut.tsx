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

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleRender = async () => {
    setErr(null);
    setUrl(null);
    setPhase('loading');
    setRenderProgress(0);

    try {
      const ffmpeg = await getFFmpeg();

      // ============ DETECTAR FASE BASEADO NO TEMPO ============
      let detectedPhase: 'encoding' | 'concatenating' | 'finalizing' | 'unknown' = 'unknown';
      const startRenderTime = Date.now();
      const ENCODING_PHASE_DURATION = 5 * 60 * 1000; // Primeiros 5 minutos = encoding
      const CONCAT_PHASE_DURATION = 2 * 60 * 1000; // Próximos 2 minutos = concat

      setPhase('rendering');
      setCurrentPhase('encoding'); // ← Iniciar com encoding
      setRenderProgress(0);

      ffmpeg.on('log', ({message}) => console.log('[FFmpeg Log]:', message));

      let lastProgressUpdate = 0;
      let lastProgressTime = Date.now();
      ffmpeg.on('progress', ({progress, time}) => {
        const elapsedTime = Date.now() - startRenderTime;

        // Atualizar fase baseado no tempo e progresso
        if (progress < 0.3 || elapsedTime < ENCODING_PHASE_DURATION) {
          detectedPhase = 'encoding';
        } else if (progress < 0.7 || elapsedTime < (ENCODING_PHASE_DURATION + CONCAT_PHASE_DURATION)) {
          detectedPhase = 'concatenating';
        } else {
          detectedPhase = 'finalizing';
        }

        setCurrentPhase(detectedPhase);
        if (progress >= 0 && progress <= 1) {
          const percentage = Math.round(progress * 100);
          setRenderProgress(percentage);
          lastProgressTime = Date.now();

          // Log progress a cada 10%
          if (percentage - lastProgressUpdate >= 10) {
            console.log(`[FFmpeg Progress] ${percentage}% concluído (tempo: ${time}s)`);
            lastProgressUpdate = percentage;
          }
        }
      });

      // Monitorar se FFmpeg está travado (sem progresso por 30s)
      const progressTimeout = setInterval(() => {
        const timeSinceLastProgress = Date.now() - lastProgressTime;
        if (timeSinceLastProgress > 30000 && renderProgress < 100) {
          console.warn('[FFmpeg Warning] Sem progresso por 30 segundos. FFmpeg pode estar travado.');
        }
      }, 10000);

      // 1. Write all media files to FFmpeg's virtual file system
      console.log('[FFmpeg Debug] Iniciando escrita de arquivos de vídeo no sistema virtual...');
      for (let i = 0; i < sortedScenes.length; i++) {
        const scene = sortedScenes[i];
        if (scene.videoBlob) {
          const fileName = `in${i}.mp4`;
          console.log(`[FFmpeg Debug] Escrevendo arquivo ${fileName}, tamanho do blob: ${scene.videoBlob.size} bytes`);
          const buf = new Uint8Array(await scene.videoBlob.arrayBuffer());
          await ffmpeg.writeFile(fileName, buf);
          console.log(`[FFmpeg Debug] ✓ Arquivo ${fileName} escrito com sucesso`);
        } else {
           const originalSceneIndex = scenes.findIndex(s => s.id === scene.id);
          throw new Error(`Cena ${originalSceneIndex + 1} está sem dados de vídeo (blob). Por favor, gere novamente.`);
        }
      }

      const hasAudio = !!projectConfig.audioFile;
      if (hasAudio) {
        console.log('[FFmpeg Debug] Escrevendo arquivo de áudio...');
        const mbuf = new Uint8Array(await projectConfig.audioFile.arrayBuffer());
        await ffmpeg.writeFile('music.mp3', mbuf);
        console.log('[FFmpeg Debug] ✓ Arquivo de áudio escrito com sucesso');
      }

      // 2. Build the FFmpeg command args using filter_complex simples
      const args: string[] = [];

      // ============ INPUTS ============
      for (let i = 0; i < sortedScenes.length; i++) {
        args.push('-i', `in${i}.mp4`);
      }

      if (hasAudio) {
        args.push('-i', 'music.mp3');
      }

      const numScenes = sortedScenes.length;
      if (numScenes === 0) {
        throw new Error("No scenes to render.");
      }

      // ============ FILTRO SIMPLES ============
      // Construir filtro: [0:v][1:v][2:v]...[N:v]concat=n=N:v=1:a=0[outv]
      let filterComplex = '';
      for (let i = 0; i < numScenes; i++) {
        filterComplex += `[${i}:v]`;
      }
      filterComplex += `concat=n=${numScenes}:v=1:a=0[outv]`;

      args.push('-filter_complex', filterComplex);

      // ============ MAPEAMENTO DE STREAMS ============
      args.push('-map', '[outv]');  // Vídeo concatenado

      if (hasAudio) {
        const audioInputIndex = numScenes;
        args.push('-map', `${audioInputIndex}:a:0`);  // Áudio externo
      }

      // ============ CODEC VP9 LEVE ============
      // VP9 é mais eficiente que libx264 em WASM
      args.push('-c:v', 'libvpx-vp9');
      args.push('-deadline', 'realtime');  // Modo fast (sacrifica qualidade pela velocidade)
      args.push('-cpu-used', '8');  // CPU máximo (0=mais lento mas melhor qualidade, 16=mais rápido)
      args.push('-b:v', '1200k');  // Bitrate conservador
      args.push('-maxrate', '1500k');
      args.push('-bufsize', '3000k');
      args.push('-pix_fmt', 'yuv420p');

      if (hasAudio) {
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k');
        // ✅ CRÍTICO: sincronizar com áudio (usar duração do áudio como referência)
        args.push('-shortest');
      }

      args.push('-movflags', '+faststart');
      args.push('-y', 'out.mp4');

      setPhase('rendering');
      console.log('[FFmpeg Debug] Todos os arquivos foram carregados. Iniciando renderização...');
      console.log('[FFmpeg Debug] ✅ ESTRATÉGIA FINAL: Filter complex simples + VP9 leve');
      console.log('[FFmpeg Debug] Comando FFmpeg:', args);
      console.log('[FFmpeg Debug] ⏱️ VP9 é mais rápido que libx264. Duração será sincronizada com áudio via -shortest');

      // ============ DIAGNÓSTICO DETALHADO ============
      let lastLogTime = Date.now();
      let hasReceivedLogs = false;

      const logDiagnosisInterval = setInterval(() => {
        const timeSinceLastLog = Date.now() - lastLogTime;
        const elapsedSinceStart = Math.floor((Date.now() - lastProgressTime) / 1000);

        if (timeSinceLastLog > 5000) {
          console.warn(`[FFmpeg Diagnosis] ⚠️ Sem logs por ${Math.floor(timeSinceLastLog / 1000)}s. Tempo total: ${elapsedSinceStart}s`);
          console.warn(`[FFmpeg Diagnosis] Verificação de status:`);
          console.warn(`  - Logs recebidos: ${hasReceivedLogs ? 'SIM ✅' : 'NÃO ❌'}`);
          console.warn(`  - Progresso: ${renderProgress}%`);
          console.warn(`  - Possível causa: FFmpeg pode estar processando em background sem callbacks`);
        }
      }, 5000);

      // Melhorar listener de logs
      ffmpeg.on('log', ({message}) => {
        lastLogTime = Date.now();
        hasReceivedLogs = true;
        console.log('[FFmpeg Log]:', message);
      });

      let finalProgressTime = Date.now();
      ffmpeg.on('progress', ({progress, time}) => {
        finalProgressTime = Date.now();
        const percentage = (progress * 100).toFixed(1);
        console.log(`[FFmpeg Progress] ${percentage}% concluído (tempo: ${time}s)`);
        if (progress >= 0 && progress <= 1) {
          setRenderProgress(Math.round(progress * 100));
        }
      });

      try {
        console.log('[FFmpeg Debug] ========== INICIANDO EXECUÇÃO ==========');
        console.log('[FFmpeg Debug] Chamando ffmpeg.exec()...');
        console.time('[FFmpeg Exec Duration]');

        const startTime = Date.now();
        await ffmpeg.exec(args);
        const elapsedTime = Date.now() - startTime;

        console.timeEnd('[FFmpeg Exec Duration]');
        console.log(`[FFmpeg Debug] ✅ ffmpeg.exec() completou em ${(elapsedTime / 1000).toFixed(1)}s`);

        clearInterval(logDiagnosisInterval);
        clearInterval(progressTimeout);

        console.log('[FFmpeg Debug] Lendo arquivo de saída...');
        const data = await ffmpeg.readFile('out.mp4');
        const sizeInMB = (data.length / 1024 / 1024).toFixed(2);
        console.log(`[FFmpeg Debug] ✅ Arquivo lido com sucesso. Tamanho: ${sizeInMB} MB (${data.length} bytes)`);

        const blob = new Blob([data], { type: 'video/mp4' });
        const href = URL.createObjectURL(blob);
        setUrl(href);
        setPhase('done');
        setRenderProgress(100);
        console.log('[FFmpeg Debug] ========== RENDERIZAÇÃO FINALIZADA COM SUCESSO! ==========');

      } catch (execError: any) {
        clearInterval(logDiagnosisInterval);
        clearInterval(progressTimeout);
        console.error('[FFmpeg Error] Execução falhou:', execError);
        console.error('[FFmpeg Error] Stack trace:', execError?.stack);
        setErr(`Falha na renderização: ${execError?.message ?? String(execError)}`);
        setPhase('error');
      }
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

        let lastProgressTime = Date.now();
        ffmpeg.on('log', ({ message }) => console.log('[FFmpeg Preview Log]:', message));
        ffmpeg.on('progress', ({ progress }) => {
            lastProgressTime = Date.now();
            if (progress >= 0 && progress <= 1) {
                // Scale progress from 30% to 100% for the final encoding stage
                setRenderProgress(30 + Math.round(progress * 70));
            }
        });
        
        setPhase('rendering');
        setCurrentPhase('encoding');

        // 1. Write original video and audio files
        for (let i = 0; i < sortedScenes.length; i++) {
            const scene = sortedScenes[i];
            if (scene.videoBlob) {
                await ffmpeg.writeFile(`in${i}.mp4`, new Uint8Array(await scene.videoBlob.arrayBuffer()));
            } else {
                throw new Error(`Cena ${i + 1} está sem dados de vídeo.`);
            }
        }
        const hasAudio = !!projectConfig.audioFile;
        if (hasAudio) {
            await ffmpeg.writeFile('music.mp3', new Uint8Array(await projectConfig.audioFile.arrayBuffer()));
        }

        // 2. Trim each video to 5 seconds without re-encoding
        console.log('[FFmpeg Preview] Trimming videos...');
        for (let i = 0; i < sortedScenes.length; i++) {
            await ffmpeg.exec(['-i', `in${i}.mp4`, '-t', '5', '-c', 'copy', '-y', `trimmed${i}.mp4`]);
            setRenderProgress(Math.round(((i + 1) / sortedScenes.length) * 30)); // Show progress for trim stage
        }

        setCurrentPhase('concatenating');

        // 3. Build command to concatenate trimmed videos and encode final output
        const args: string[] = [];
        for (let i = 0; i < sortedScenes.length; i++) {
            args.push('-i', `trimmed${i}.mp4`);
        }
        if (hasAudio) {
            args.push('-i', 'music.mp3');
        }

        let filterComplex = '';
        for (let i = 0; i < sortedScenes.length; i++) {
            filterComplex += `[${i}:v]`;
        }
        filterComplex += `concat=n=${sortedScenes.length}:v=1:a=0[outv]`;
        args.push('-filter_complex', filterComplex);

        args.push('-map', '[outv]');
        if (hasAudio) {
            args.push('-map', `${sortedScenes.length}:a:0`);
        }
        
        // Use lightweight VP9 encoding
        args.push('-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '1200k', '-pix_fmt', 'yuv420p');
        if (hasAudio) {
            args.push('-c:a', 'aac', '-b:a', '128k', '-shortest');
        }
        args.push('-y', 'preview.mp4');

        setCurrentPhase('finalizing');
        await ffmpeg.exec(args);
        
        // 4. Read output and create URL
        const data = await ffmpeg.readFile('preview.mp4');
        const blob = new Blob([data], { type: 'video/mp4' });
        setUrl(URL.createObjectURL(blob));
        setPhase('done');
        setRenderProgress(100);
        console.log('[FFmpeg Preview] Amostra renderizada com sucesso!');

    } catch (e: any) {
        console.error('[FFmpeg Preview Error]', e);
        setErr(`Falha na renderização da amostra: ${e?.message ?? String(e)}`);
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