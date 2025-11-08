/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import FinalCut from './components/FinalCut';
import LocalApiKeyDialog from './components/LocalApiKeyDialog';
import ProjectSetup from './components/ProjectSetup';
import Storyboard from './components/Storyboard';
import {generateVideo} from './services/geminiService';
import {
  AppMode,
  AspectRatio,
  ProjectConfig,
  Resolution,
  Scene,
  SceneStatus,
  VeoApiParams,
  VeoModel,
} from './types';

const getVideoDuration = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = (e) => {
      const errorEvent = e as ErrorEvent;
      reject(new Error(`Error loading video for duration check: ${errorEvent.message}`));
    };
    video.src = url;
  });
};


const Stepper: React.FC<{currentMode: AppMode}> = ({currentMode}) => {
  const steps = [AppMode.SETUP, AppMode.STORYBOARD, AppMode.FINAL_CUT];
  const currentIndex = steps.indexOf(currentMode);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step}
            className={`relative ${stepIdx !== steps.length - 1 ? 'pr-16 sm:pr-20' : ''}`}>
            {stepIdx < currentIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true">
                  <div className="h-0.5 w-full bg-indigo-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-indigo-600 rounded-full">
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 text-xs text-center text-indigo-400 font-semibold">
                  {step}
                </span>
              </>
            ) : stepIdx === currentIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-700" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-gray-800 border-2 border-indigo-600 rounded-full">
                  <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />
                </div>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 text-xs text-center text-white font-semibold">
                  {step}
                </span>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-700" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-gray-800 border-2 border-gray-600 rounded-full" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 text-xs text-center text-gray-500">
                  {step}
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const timeRegex = /(?:(\d{1,2}:\d{2})\s*(?:-|–)\s*(\d{1,2}:\d{2}))|(?:Duração sugerida|Duração|Duration):\s*(\d{1,2}:\d{2})/i;
const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};
const parsePromptForTime = (prompt: string, previousSceneEnd: number): { timestamp: number, intendedDuration?: number } => {
    const match = prompt.match(timeRegex);
    if (match) {
        if (match[1] && match[2]) {
            const start = parseTime(match[1]);
            const end = parseTime(match[2]);
            if (end > start) {
                return { timestamp: start, intendedDuration: end - start };
            }
        } else if (match[3]) {
            const duration = parseTime(match[3]);
            return { timestamp: previousSceneEnd, intendedDuration: duration };
        }
    }
    return { timestamp: previousSceneEnd };
};


const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SETUP);
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(
    null,
  );
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showLocalApiKeyDialog, setShowLocalApiKeyDialog] = useState(false);
  const [localApiKey, setLocalApiKey] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const objectUrls = useRef(new Set<string>());

  useEffect(() => {
    // Cleanup any created object URLs on component unmount
    return () => {
      objectUrls.current.forEach(url => URL.revokeObjectURL(url));
      if (projectConfig?.audioUrl) {
          URL.revokeObjectURL(projectConfig.audioUrl);
      }
    };
  }, [projectConfig?.audioUrl]);


  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        // AI Studio environment
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          console.warn('aistudio.hasSelectedApiKey check failed.', error);
          setShowApiKeyDialog(true);
        }
      } else {
        // Local or deployed environment
        const storedKey = localStorage.getItem('gemini-api-key');
        if (storedKey) {
          setLocalApiKey(storedKey);
        } else {
          setShowLocalApiKeyDialog(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const addScene = useCallback(() => {
    const sorted = [...scenes].sort((a,b) => a.timestamp - b.timestamp);
    const lastScene = sorted[sorted.length - 1];
    const previousSceneEnd = lastScene ? (lastScene.timestamp + (lastScene.intendedDuration ?? lastScene.duration ?? 0)) : 0;
    
    const newScene: Scene = {
      id: Date.now().toString(),
      prompt: '',
      timestamp: previousSceneEnd,
      status: SceneStatus.DRAFT,
    };
    const newScenes = [...scenes, newScene].sort((a, b) => a.timestamp - b.timestamp);
    setScenes(newScenes);
  }, [scenes]);
  
  const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
    setScenes(prev => {
        const sortedPrev = [...prev].sort((a, b) => a.timestamp - b.timestamp);
        let lastSceneEnd = 0;
        const updatedScenes = sortedPrev.map((s, index) => {
          const prevScene = index > 0 ? sortedPrev[index - 1] : null;
          lastSceneEnd = prevScene ? (prevScene.timestamp + (prevScene.intendedDuration ?? prevScene.duration ?? 0)) : 0;

          if (s.id === id) {
            const newPrompt = updates.prompt ?? s.prompt;
            const timeInfo = parsePromptForTime(newPrompt, lastSceneEnd);
            return {...s, ...updates, ...timeInfo};
          }
          return s;
        });
        
        updatedScenes.sort((a,b) => a.timestamp - b.timestamp);
        return updatedScenes;
    });
  }, []);
  
  const deleteScene = useCallback((id: string) => {
    setScenes(prev => {
        const sceneToDelete = prev.find(s => s.id === id);
        if (sceneToDelete?.videoUrl) {
            URL.revokeObjectURL(sceneToDelete.videoUrl);
            objectUrls.current.delete(sceneToDelete.videoUrl);
        }
        return prev.filter(s => s.id !== id);
    });
  }, []);

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };
  
  const handleLocalApiKeySave = (key: string) => {
    if (key.trim()) {
      const trimmedKey = key.trim();
      localStorage.setItem('gemini-api-key', trimmedKey);
      setLocalApiKey(trimmedKey);
      setShowLocalApiKeyDialog(false);
    }
  };

  const handleProjectSetupComplete = useCallback((config: ProjectConfig) => {
    setProjectConfig(config);
    setAppMode(AppMode.STORYBOARD);
  }, []);

  const handleBackToSetup = useCallback(() => {
    setAppMode(AppMode.SETUP);
  }, []);

  const handleGenerateScene = useCallback(
    async (sceneId: string) => {
      if (!projectConfig) return;

      const sceneToGenerate = scenes.find((s) => s.id === sceneId);
      if (!sceneToGenerate) return;
      
      let apiKeyToUse : string | null | undefined = null;
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
            return;
          }
           // In AI Studio, the key is handled by the environment via process.env
          apiKeyToUse = process.env.API_KEY;
        } catch (error) {
          setShowApiKeyDialog(true);
          return;
        }
      } else {
        apiKeyToUse = localApiKey;
      }
      
      if (!apiKeyToUse) {
        const errorUpdate: Partial<Scene> = {
            status: SceneStatus.ERROR,
            errorMessage: 'API Key is not configured. Please provide your key.',
        }
        setScenes(prev => prev.map(s => s.id === sceneId ? {...s, ...errorUpdate} : s));
        if (!window.aistudio) {
            setShowLocalApiKeyDialog(true);
        }
        return;
      }


      // Revoke old URL if it exists, before generating a new one
      if (sceneToGenerate.videoUrl) {
        URL.revokeObjectURL(sceneToGenerate.videoUrl);
        objectUrls.current.delete(sceneToGenerate.videoUrl);
      }
      
      setRequestCount(prev => prev + 1);
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? {...s, status: SceneStatus.GENERATING} : s,
        ),
      );

      const sortedScenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);
      const sceneIndex = sortedScenes.findIndex((s) => s.id === sceneId);
      let previousVideo: Video | undefined = undefined;
      if (sceneIndex > 0) {
        for (let i = sceneIndex - 1; i >= 0; i--) {
          const prevScene = sortedScenes[i];
          if (
            prevScene.videoObject &&
            prevScene.status === SceneStatus.APPROVED
          ) {
            previousVideo = prevScene.videoObject;
            break;
          }
        }
      }

      const hasReferences =
        projectConfig.characterImages.length > 0 || projectConfig.styleImages.length > 0;
      const isExtending = !!previousVideo;
      const useVeoHighQuality = hasReferences || isExtending;

      const characterInstruction = projectConfig.characterImages.length > 0
        ? `CRITICAL INSTRUCTION: For the main character, prioritize the likeness and face from the provided reference images ONLY. For all other attributes (costume, environment, etc.), strictly follow the Technical Sheet and Scene Description.`
        : '';
        
      const singingInstruction = projectConfig.characterImages.length > 0
        ? `The main character should appear to be singing or performing the song. Ensure the mouth movements are varied and expressive, matching the emotional tone of a gospel performance, rather than just opening and closing randomly.`
        : '';

      const continuityInstruction = isExtending
        ? `This scene is a direct continuation of the previous one. Ensure a seamless visual and narrative transition.`
        : '';

      const finalPrompt = [
        projectConfig.technicalSheet,
        characterInstruction,
        singingInstruction,
        continuityInstruction,
        `---`,
        `SCENE DESCRIPTION:\n${sceneToGenerate.prompt}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      let durationForApi: number | undefined = sceneToGenerate.intendedDuration;

      // Clamp duration for the high-quality model which has strict limitations
      if (useVeoHighQuality && durationForApi) {
        const VEO_HQ_MIN_DURATION = 4;
        const VEO_HQ_MAX_DURATION = 8;
        if (durationForApi < VEO_HQ_MIN_DURATION) {
          durationForApi = VEO_HQ_MIN_DURATION;
        }
        if (durationForApi > VEO_HQ_MAX_DURATION) {
          durationForApi = VEO_HQ_MAX_DURATION;
        }
      }

      const params: VeoApiParams = {
        prompt: finalPrompt,
        model: useVeoHighQuality ? VeoModel.VEO : VeoModel.VEO_FAST,
        aspectRatio: useVeoHighQuality
          ? AspectRatio.LANDSCAPE
          : projectConfig.aspectRatio,
        resolution: useVeoHighQuality
          ? Resolution.P720
          : projectConfig.resolution,
        durationSeconds: durationForApi,
        referenceImages: projectConfig.characterImages,
        styleImage: projectConfig.styleImages[0] ?? null,
        inputVideo: previousVideo,
      };

      try {
        const {objectUrl, blob, video} = await generateVideo(params, apiKeyToUse);
        objectUrls.current.add(objectUrl);
        const duration = await getVideoDuration(objectUrl);

        setScenes((prev) =>
          prev.map((s) =>
            s.id === sceneId
              ? {
                  ...s,
                  status: SceneStatus.GENERATED,
                  videoUrl: objectUrl,
                  videoBlob: blob,
                  videoObject: video,
                  duration: duration,
                  errorMessage: undefined,
                  errorType: undefined,
                }
              : s,
          ),
        );
      } catch (error) {
        console.error('Scene generation failed:', error);
        let errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        let errorType: 'QUOTA_EXCEEDED' | undefined = undefined;

        try {
          const apiError = JSON.parse(errorMessage);
          if (apiError?.error?.code === 429) {
            errorType = 'QUOTA_EXCEEDED';
            errorMessage = apiError?.error?.message ?? 'Quota exceeded. Please check your plan and billing details.';
          }
        } catch (e) {
          // Not a JSON error, keep original message
        }

        setScenes((prev) =>
          prev.map((s) =>
            s.id === sceneId
              ? {
                  ...s,
                  status: SceneStatus.ERROR,
                  errorMessage: errorMessage,
                  errorType: errorType,
                }
              : s,
          ),
        );
      }
    },
    [projectConfig, scenes, localApiKey],
  );

  const renderContent = () => {
    switch (appMode) {
      case AppMode.SETUP:
        return (
          <ProjectSetup
            onComplete={handleProjectSetupComplete}
            initialConfig={projectConfig}
          />
        );
      case AppMode.STORYBOARD:
        return (
          <Storyboard
            scenes={scenes}
            onAddScene={addScene}
            onUpdateScene={updateScene}
            onDeleteScene={deleteScene}
            onGenerateScene={handleGenerateScene}
            onComplete={() => setAppMode(AppMode.FINAL_CUT)}
            onBack={handleBackToSetup}
            projectConfig={projectConfig!}
            requestCount={requestCount}
          />
        );
      case AppMode.FINAL_CUT:
        return (
          <FinalCut
            scenes={scenes.filter((s) => s.status === SceneStatus.APPROVED || s.status === SceneStatus.GENERATED)}
            audioUrl={projectConfig?.audioUrl ?? null}
            onBack={() => setAppMode(AppMode.STORYBOARD)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans">
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      {showLocalApiKeyDialog && (
        <LocalApiKeyDialog onSave={handleLocalApiKeySave} />
      )}
      <header className="py-6 flex flex-col justify-center items-center px-8 relative z-10 shrink-0 gap-8">
        <h1 className="text-5xl font-semibold tracking-wide text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          DreamDirector AI
        </h1>
        <Stepper currentMode={appMode} />
      </header>
      <main className="w-full max-w-6xl mx-auto flex-grow flex flex-col p-2 sm:p-4 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;