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
  const {audioUrl, audioFile} = projectConfig;
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

    // Fix: Property 'currentTime' does not exist on type 'HTMLVideoElement'.
    if (Math.abs((video as any).currentTime - relativeTime) > 0.2) {
      (video as any).currentTime = relativeTime;
    }

    // Fix: Property 'paused', 'play' do not exist on type 'HTMLVideoElement'.
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
      
      console.log('[FFmpeg Debug] Writing input files...');
      for (let i = 0; i < sortedScenes.length; i++) {
        const scene = sortedScenes[i];
        if (scene.videoBlob) {
          const buf = new Uint8Array(await scene.videoBlob.arrayBuffer());
          await ffmpeg.writeFile(`in${i}.mp4`, buf);
        }
      }
      if (projectConfig.audioFile) {
        const mbuf = new Uint8Array(await projectConfig.audioFile.arrayBuffer());
        await ffmpeg.writeFile('music.mp3', mbuf);
      } else {
        throw new Error("Music track is missing.");
      }

      console.log('[FFmpeg Debug] Constructing FFmpeg command...');
      
      const { width, height } = {
          '1080p': { width: 1920, height: 1080 },
          '720p': { width: 1280, height: 720 },
      }[projectConfig.resolution];

      const [outputWidth, outputHeight] = projectConfig.aspectRatio === AspectRatio.LANDSCAPE ? [width, height] : [height, width];
      
      const vf: string[] = [], af: string[] = [], vparts: string[] = [], aparts: string[] = [];
      sortedScenes.forEach((c, i) => {
        const intendedDuration = c.intendedDuration ?? c.duration ?? 1;
        // Use tloop to handle clips shorter than intended duration
        vf.push(`[${i}:v]tloop=-1,trim=duration=${intendedDuration},setpts=PTS-STARTPTS,scale=${outputWidth}:${outputHeight}:force_original_aspect_ratio=decrease,pad=${outputWidth}:${outputHeight}:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v${i}]`);
        vparts.push(`[v${i}]`);
      });

      const n = sortedScenes.length;
      const concatFilter = `${vparts.join('')}concat=n=${n}:v=1:a=0[vcat]`;
      const baseFilters = `${vf.join(';')};${concatFilter}`;
      
      // Fix: Property 'music' does not exist on type 'ProjectConfig'. Changed to 'audioFile'.
      const fc = projectConfig.audioFile
        ? `${baseFilters};[vcat]copy[vout];amovie=music.mp3,asetpts=PTS-STARTPTS[bgm];[bgm]atrim=0:3600[bgm1]`
        : baseFilters;

      const args: string[] = [];
      for (let i = 0; i < n; i++) args.push('-i', `in${i}.mp4`);
      args.push(
        '-filter_complex', fc,
        '-map', '[vout]',
        '-map', '[bgm1]',
        '-r', '24', // Standard frame rate
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '23',
        '-c:a', 'aac', '-b:a', '192k',
        '-shortest', '-movflags', '+faststart',
        '-y', 'out.mp4'
      );

      setPhase('rendering');
      console.log('[FFmpeg Debug] Executing command:', args.join(' '));
      await ffmpeg.exec(args);
      console.log('[FFmpeg Debug] FFmpeg command execution finished.');

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

      // Fix: Property 'currentTime', 'pause' do not exist on type 'HTMLAudioElement'.
      if ((audioRef.current as any).currentTime >= lastSceneEndTime) {
        (audioRef.current as any).pause();
        setIsPlaying(false);
        const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
        (audioRef.current as any).currentTime = firstSceneTimestamp;
        setCurrentTime(firstSceneTimestamp);
      } else {
        // Fix: Property 'currentTime' do not exist on type 'HTMLAudioElement'.
        setCurrentTime((audioRef.current as any).currentTime);
      }
    }
  }, [sortedScenes]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      // Fix: Property 'duration', 'currentTime' do not exist on type 'HTMLAudioElement'.
      setDuration((audioRef.current as any).duration);
      const firstSceneTimestamp = sortedScenes[0]?.timestamp ?? 0;
      (audioRef.current as any).currentTime = firstSceneTimestamp;
      setCurrentTime(firstSceneTimestamp);
    }
  }, [sortedScenes]);

  const isRendering = phase === 'loading' || phase === 'rendering';
  const canDownload = phase === 'done' && !!url;

  const renderButtonText = {
      'idle': 'Render Video',
      'loading': 'Loading Engine...',
      'rendering': `Rendering... ${renderProgress}%`,
      'done': 'Render Again',
      'error': 'Render Failed - Try Again'
  }[phase];

  if (sortedScenes.length === 0) {
    return (
      <div className="text-center flex-grow flex flex-col items-center justify-center">
        <h2 className="text-2xl text-gray-500">
          No generated or approved scenes.
        </h2>
        <p className="text-gray-600 mt-2">
          Go back and generate some scenes to preview the final cut.
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          Back to Storyboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      {isRendering && (
        <RenderProgressDialog
          message={phase === 'loading' ? 'Loading FFmpeg core...' : 'Rendering video... This may take a few minutes.'}
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
              Scene {sortedScenes.findIndex((s) => s.id === activeScene.id) + 1}:{' '}
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
        <h3 className="text-2xl font-bold text-white">Export Your Masterpiece</h3>
        <p className="text-gray-400 text-center max-w-lg">
          Combine all your approved scenes and the master audio track into a
          single video file. This process happens entirely in your browser.
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
                Download
            </button>
        </div>
        {phase === 'error' && (
            <p className="text-sm text-red-400 mt-2 text-center max-w-md">{err}</p>
        )}
        <p className="text-xs text-gray-500 text-center mt-2">
          Rendering may take several minutes depending on video length and your
          computer's performance.
        </p>
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