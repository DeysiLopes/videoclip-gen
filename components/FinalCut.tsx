/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ProjectConfig, Scene, SceneStatus } from '../types';
import RenderProgressDialog from './RenderProgressDialog';
import VisualTimeline from './VisualTimeline';

interface FinalCutProps {
  scenes: Scene[];
  projectConfig: ProjectConfig;
  onBack: () => void;
}

const FinalCut: React.FC<FinalCutProps> = ({ scenes, projectConfig, onBack }) => {
  const { audioUrl, audioFile } = projectConfig;
  const scenesToShow = scenes.filter(s => s.status === SceneStatus.APPROVED || s.status === SceneStatus.GENERATED);
  const sortedScenes = [...scenesToShow].sort((a, b) => a.timestamp - b.timestamp);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeScene, setActiveScene] = useState<Scene | null>(sortedScenes[0] || null);
  
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderMessage, setRenderMessage] = useState('');
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Effect to find the active scene based on audio time
  useEffect(() => {
    const scene = sortedScenes.find(s => {
        const sceneDuration = s.intendedDuration ?? s.duration ?? 0;
        if (sceneDuration === 0) return false;
        return currentTime >= s.timestamp && currentTime < s.timestamp + sceneDuration;
    });
    setActiveScene(current => (current?.id !== scene?.id ? (scene || null) : current));
  }, [currentTime, sortedScenes]);

  // Effect to control the video player based on active scene and audio time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeScene) return;

    const sceneStartTime = activeScene.timestamp;
    const sceneActualDuration = activeScene.duration ?? 1;
    const relativeTime = (currentTime - sceneStartTime) % sceneActualDuration; 

    if (Math.abs(video.currentTime - relativeTime) > 0.2) {
      video.currentTime = relativeTime;
    }

    if (isPlaying && video.paused) {
      video.play().catch(e => console.error("FinalCut video play failed:", e));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [activeScene, currentTime, isPlaying]);

  const handleRender = async () => {
    if (!audioFile) {
        alert("Audio file is missing. Cannot render.");
        return;
    }
    setIsRendering(true);
    setRenderProgress(0);
    setRenderMessage('Initializing Render Engine...');
    
    try {
        const ffmpegVersion = '0.12.10';
        const coreVersion = '0.12.6'; // Compatible core version for ffmpeg 0.12.10

        const baseURL = 'https://cdn.jsdelivr.net/npm/';
        const coreURL = `${baseURL}@ffmpeg/core@${coreVersion}/dist/esm/ffmpeg-core.js`;
        const wasmURL = `${baseURL}@ffmpeg/core@${coreVersion}/dist/esm/ffmpeg-core.wasm`;
        const workerURL = `${baseURL}@ffmpeg/ffmpeg@${ffmpegVersion}/dist/esm/worker.js`;

        let ffmpeg = ffmpegRef.current;
        if (!ffmpeg) {
            ffmpeg = new FFmpeg();
            ffmpegRef.current = ffmpeg;
        }

        ffmpeg.on('log', ({ message }) => console.log(message));
        ffmpeg.on('progress', ({ progress, time }) => {
            setRenderProgress(progress * 100);
            setRenderMessage(`Rendering... Frame time: ${time / 1000000}s`);
        });
        
        const compatibilityFFmpeg = ffmpeg as unknown as { loaded?: boolean; isLoaded?: () => boolean };
        const hasLoaded =
            typeof compatibilityFFmpeg.loaded === 'boolean'
                ? compatibilityFFmpeg.loaded
                : typeof compatibilityFFmpeg.isLoaded === 'function'
                    ? compatibilityFFmpeg.isLoaded()
                    : false;

        if (!hasLoaded) {
            setRenderMessage('Loading FFmpeg core...');
            await ffmpeg.load({
                coreURL: await toBlobURL(coreURL, 'text/javascript'),
                wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
                workerURL: await toBlobURL(workerURL, 'text/javascript'),
            });
        }

        setRenderMessage('Preparing files...');
        
        await ffmpeg.writeFile('audio.mp3', await fetchFile(audioFile));
        for (let i = 0; i < sortedScenes.length; i++) {
            const scene = sortedScenes[i];
            if (scene.videoBlob) {
                const fileName = `scene_${String(i).padStart(2, '0')}.mp4`;
                await ffmpeg.writeFile(fileName, await fetchFile(scene.videoBlob));
            }
        }
        
        setRenderMessage('Constructing timeline...');

        const filterComplex: string[] = [];
        const concatInputs: string[] = [];

        sortedScenes.forEach((scene, i) => {
            const videoIndex = i;
            const inputName = `[${videoIndex}:v]`;
            const outputName = `[v${videoIndex}]`;
            const intendedDuration = scene.intendedDuration ?? scene.duration ?? 1;

            filterComplex.push(`${inputName}tloop=-1,trim=duration=${intendedDuration},setpts=PTS-STARTPTS${outputName}`);
            concatInputs.push(outputName);
        });

        const finalFilter = `${filterComplex.join(';')};${concatInputs.join('')}concat=n=${sortedScenes.length}:v=1:a=0[v]`;

        const command = [
            ...sortedScenes.map((_, i) => `-i`).flatMap((val, i) => [val, `scene_${String(i).padStart(2, '0')}.mp4`]),
            '-i', 'audio.mp3',
            '-filter_complex', finalFilter,
            '-map', '[v]',
            '-map', `${sortedScenes.length}:a`,
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-shortest',
            'output.mp4'
        ];
        
        setRenderMessage('Rendering video... This may take a few minutes.');
        await ffmpeg.exec(command);

        setRenderMessage('Finalizing render...');
        const data = await ffmpeg.readFile('output.mp4');

        const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DreamDirector_FinalCut.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setRenderMessage('Render complete!');

    } catch(error) {
        console.error("Rendering failed:", error);
        setRenderMessage(`Error during render: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsRendering(false);
        return; 
    }
    
    setIsRendering(false);
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
        const lastScene = sortedScenes[sortedScenes.length - 1];
        if (!lastScene) return;
        
        const lastSceneEndTime = lastScene.timestamp + (lastScene.intendedDuration ?? lastScene.duration ?? 0);

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
            <h2 className="text-2xl text-gray-500">No generated or approved scenes.</h2>
            <p className="text-gray-600 mt-2">Go back and generate some scenes to preview the final cut.</p>
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
      {isRendering && <RenderProgressDialog message={renderMessage} progress={renderProgress} />}
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
       
      <div className="flex flex-col items-center gap-6 mt-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700 w-full max-w-3xl">
          <h3 className="text-2xl font-bold text-white">Export Your Masterpiece</h3>
          <p className="text-gray-400 text-center max-w-lg">
             Combine all your approved scenes and the master audio track into a single, high-quality video file. This process happens entirely in your browser.
          </p>
          <button 
            onClick={handleRender} 
            disabled={isRendering}
            className="px-8 py-4 bg-indigo-600 text-lg rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
           {isRendering ? 'Rendering...' : 'Render and Download Video'}
        </button>
        <p className="text-xs text-gray-500 text-center">Rendering may take several minutes depending on video length and your computer's performance.</p>
        <div className="mt-4">
             <button
                onClick={onBack}
                className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                Back to Storyboard
              </button>
        </div>
      </div>
    </div>
  );
};

export default FinalCut;