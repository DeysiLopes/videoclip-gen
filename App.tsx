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
import StorageMonitor from './components/StorageMonitor';
import Storyboard from './components/Storyboard';
import {dbService} from './services/dbService';
import {generateVideo} from './services/geminiService';
import {getVideoDuration} from './services/utils';
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

const Stepper: React.FC<{currentMode: AppMode}> = ({currentMode}) => {
  const steps = [AppMode.SETUP, AppMode.STORYBOARD, AppMode.FINAL_CUT];
  const currentIndex = steps.indexOf(currentMode);

  const stepLabels: Record<AppMode, string> = {
    [AppMode.SETUP]: 'Configuração',
    [AppMode.STORYBOARD]: 'Storyboard',
    [AppMode.FINAL_CUT]: 'Corte Final',
  };

  return (
    <nav aria-label="Progress" className="w-full max-w-2xl">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step}
            className={`relative flex-1 ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-16' : ''}`}>
            {stepIdx < currentIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center top-4"
                  aria-hidden="true">
                  <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-xl shadow-indigo-500/50 transform transition-transform hover:scale-110">
                  <svg
                    className="h-6 w-6 text-white"
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
                <span className="absolute -bottom-8 left-5 -translate-x-1/2 w-24 text-xs text-center text-indigo-400 font-semibold whitespace-nowrap">
                  {stepLabels[step]}
                </span>
              </>
            ) : stepIdx === currentIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center top-4"
                  aria-hidden="true">
                  <div className="h-1 w-full bg-gray-700/50" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center bg-gray-900 border-2 border-indigo-500 rounded-full shadow-2xl shadow-indigo-500/70 animate-pulse-glow">
                  <span className="h-3 w-3 bg-indigo-500 rounded-full animate-ping absolute" />
                  <span className="h-3 w-3 bg-indigo-500 rounded-full" />
                </div>
                <span className="absolute -bottom-8 left-5 -translate-x-1/2 w-24 text-xs text-center text-white font-bold whitespace-nowrap">
                  {stepLabels[step]}
                </span>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center top-4"
                  aria-hidden="true">
                  <div className="h-1 w-full bg-gray-800/50" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center bg-gray-900 border-2 border-gray-700 rounded-full transition-all hover:border-gray-600">
                  <span className="h-2 w-2 bg-gray-700 rounded-full" />
                </div>
                <span className="absolute -bottom-8 left-5 -translate-x-1/2 w-24 text-xs text-center text-gray-500 font-medium whitespace-nowrap">
                  {stepLabels[step]}
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const timeRegex =
  /(?:(\d{1,2}:\d{2})\s*(?:-|–)\s*(\d{1,2}:\d{2}))|(?:Duração sugerida|Duração|Duration):\s*(\d{1,2}:\d{2})/i;
const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};
const parsePromptForTime = (
  prompt: string,
  previousSceneEnd: number,
): {timestamp: number; intendedDuration?: number} => {
  const match = prompt.match(timeRegex);
  if (match) {
    if (match[1] && match[2]) {
      const start = parseTime(match[1]);
      const end = parseTime(match[2]);
      if (end > start) {
        return {timestamp: start, intendedDuration: end - start};
      }
    } else if (match[3]) {
      const duration = parseTime(match[3]);
      return {timestamp: previousSceneEnd, intendedDuration: duration};
    }
  }
  return {timestamp: previousSceneEnd};
};

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SETUP);
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(
    null,
  );
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showLocalApiKeyDialog, setShowLocalApiKeyDialog] = useState(false);
  const [showDemoShowcase, setShowDemoShowcase] = useState(false);
  const [localApiKey, setLocalApiKey] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [isDbReady, setIsDbReady] = useState(false);
  const objectUrls = useRef(new Set<string>());

  useEffect(() => {
    // Cleanup any created object URLs on component unmount
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      if (projectConfig?.audioUrl) {
        URL.revokeObjectURL(projectConfig.audioUrl);
      }
    };
  }, [projectConfig?.audioUrl]);

  // This effect ensures that if projectConfig has an audioFile, it always has a valid audioUrl.
  // This guards against any state update that might accidentally drop the audioUrl,
  // fixing the bug where the timeline would disappear.
  useEffect(() => {
    if (projectConfig && projectConfig.audioFile && !projectConfig.audioUrl) {
      console.warn("Project config is missing audioUrl, creating it now to fix timeline visibility.");
      const url = URL.createObjectURL(projectConfig.audioFile);
      objectUrls.current.add(url);
      
      // Use functional update to avoid stale state issues, and create a new object
      // to ensure React detects the state change.
      setProjectConfig(prevConfig => ({
        ...prevConfig!,
        audioUrl: url,
      }));
    }
  }, [projectConfig]);

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Check API Key
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
        // Fix: Cannot find name 'localStorage'.
        const storedKey = (window as any).localStorage.getItem('gemini-api-key');
        if (storedKey) {
          setLocalApiKey(storedKey);
        } else {
          setShowLocalApiKeyDialog(true);
        }
      }

      // 2. Initialize DB and load data
      try {
        const loadedConfig = await dbService.getProjectConfig();
        if (loadedConfig && loadedConfig.technicalSheet) {
          // Check if a project was actually saved
          let configWithUrl = {...loadedConfig};
          if (loadedConfig.audioFile) {
            const url = URL.createObjectURL(loadedConfig.audioFile);
            objectUrls.current.add(url);
            configWithUrl.audioUrl = url;
          }
          setProjectConfig(configWithUrl);

          const loadedScenes = await dbService.getScenes();
          const scenesWithUrls = loadedScenes.map((scene) => {
            if (scene.videoBlob) {
              const url = URL.createObjectURL(scene.videoBlob);
              objectUrls.current.add(url);
              return {...scene, videoUrl: url};
            }
            return scene;
          });
          setScenes(scenesWithUrls);
          setAppMode(AppMode.STORYBOARD);
        }
      } catch (error) {
        console.error('Failed to load project from database:', error);
      } finally {
        setIsDbReady(true);
      }
    };

    initializeApp();
  }, []);

  const addScene = useCallback(async () => {
    const sorted = [...scenes].sort((a, b) => a.timestamp - b.timestamp);
    const lastScene = sorted[sorted.length - 1];
    const previousSceneEnd = lastScene
      ? lastScene.timestamp + (lastScene.intendedDuration ?? lastScene.duration ?? 0)
      : 0;

    const newScene: Scene = {
      id: Date.now().toString(),
      prompt: '',
      timestamp: previousSceneEnd,
      status: SceneStatus.DRAFT,
    };
    await dbService.saveScene(newScene);
    const newScenes = [...scenes, newScene].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    setScenes(newScenes);
  }, [scenes]);

  const updateScene = useCallback(async (id: string, updates: Partial<Scene>) => {
    let updatedScene: Scene | undefined;
    setScenes((prev) => {
      const sortedPrev = [...prev].sort((a, b) => a.timestamp - b.timestamp);
      let lastSceneEnd = 0;
      const updatedScenes = sortedPrev.map((s, index) => {
        const prevScene = index > 0 ? sortedPrev[index - 1] : null;
        lastSceneEnd = prevScene
          ? prevScene.timestamp +
            (prevScene.intendedDuration ?? prevScene.duration ?? 0)
          : 0;

        if (s.id === id) {
          const newPrompt = updates.prompt ?? s.prompt;
          const timeInfo = parsePromptForTime(newPrompt, lastSceneEnd);
          updatedScene = {...s, ...updates, ...timeInfo};
          return updatedScene;
        }
        return s;
      });

      updatedScenes.sort((a, b) => a.timestamp - b.timestamp);
      return updatedScenes;
    });

    if (updatedScene) {
      await dbService.saveScene(updatedScene);
    }
  }, []);

  const deleteScene = useCallback(async (id: string) => {
    await dbService.deleteScene(id);
    setScenes((prev) => {
      const sceneToDelete = prev.find((s) => s.id === id);
      if (sceneToDelete?.videoUrl) {
        URL.revokeObjectURL(sceneToDelete.videoUrl);
        objectUrls.current.delete(sceneToDelete.videoUrl);
      }
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const handleReorderScene = useCallback(
    async (sceneId: string, newTimestamp: number) => {
      setScenes((prevScenes) => {
        const draggedScene = prevScenes.find((s) => s.id === sceneId);
        if (!draggedScene) return prevScenes;

        // Temporarily assign the new timestamp to sort
        const tempSortedScenes = prevScenes
          .map((s) =>
            s.id === sceneId ? {...s, timestamp: newTimestamp} : s,
          )
          .sort((a, b) => a.timestamp - b.timestamp);

        let currentTime = 0;
        const finalScenes: Scene[] = [];
        const scenesToSave: Scene[] = [];

        for (const scene of tempSortedScenes) {
          const updatedScene = {...scene, timestamp: currentTime};
          finalScenes.push(updatedScene);

          const originalScene = prevScenes.find((s) => s.id === scene.id);
          if (!originalScene || originalScene.timestamp !== updatedScene.timestamp) {
            scenesToSave.push(updatedScene);
          }

          const duration = scene.intendedDuration ?? scene.duration ?? 0;
          currentTime += duration;
        }

        scenesToSave.forEach((s) => dbService.saveScene(s));
        return finalScenes;
      });
    },
    [],
  );

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleLocalApiKeySave = (key: string) => {
    if (key.trim()) {
      const trimmedKey = key.trim();
      // Fix: Cannot find name 'localStorage'.
      (window as any).localStorage.setItem('gemini-api-key', trimmedKey);
      setLocalApiKey(trimmedKey);
      setShowLocalApiKeyDialog(false);
    }
  };

  const handleProjectSetupComplete = useCallback(
    async (config: ProjectConfig) => {
      // Clean up old state
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
      if (projectConfig?.audioUrl) {
        URL.revokeObjectURL(projectConfig.audioUrl);
      }

      // Clear old data from DB
      await dbService.clearScenes();

      // Save new config
      await dbService.saveProjectConfig(config);

      // Create URL for the new audio file before setting state
      let configWithUrl = { ...config };
      if (config.audioFile) {
        const url = URL.createObjectURL(config.audioFile);
        objectUrls.current.add(url);
        configWithUrl.audioUrl = url;
      }

      // Update state
      setScenes([]);
      setRequestCount(0);
      setProjectConfig(configWithUrl);
      setAppMode(AppMode.STORYBOARD);
    },
    [projectConfig],
  );

  const handleBackToSetup = useCallback(() => {
    setAppMode(AppMode.SETUP);
  }, []);

  const handleGenerateScene = useCallback(
    async (sceneId: string) => {
      if (!projectConfig) return;

      const sceneToGenerate = scenes.find((s) => s.id === sceneId);
      if (!sceneToGenerate) return;

      let apiKeyToUse: string | null | undefined = null;
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
        };
        updateScene(sceneId, errorUpdate);
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

      setRequestCount((prev) => prev + 1);
      updateScene(sceneId, {status: SceneStatus.GENERATING});

      const sortedScenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);
      const sceneIndex = sortedScenes.findIndex((s) => s.id === sceneId);
      let previousVideo: Video | undefined = undefined;
      if (sceneIndex > 0) {
        for (let i = sceneIndex - 1; i >= 0; i--) {
          const prevScene = sortedScenes[i];
          if (
            prevScene.videoObject &&
            prevScene.status === SceneStatus.APPROVED &&
            !prevScene.isUploaded
          ) {
            previousVideo = prevScene.videoObject;
            break;
          }
        }
      }

      const isExtending = !!previousVideo;
      const hasReferences =
        projectConfig.characterImages.length > 0 ||
        projectConfig.styleImages.length > 0;
      const useVeoHighQuality = hasReferences || isExtending;

      const characterInstruction =
        !isExtending && projectConfig.characterImages.length > 0
          ? `CRITICAL INSTRUCTION: For the main character, prioritize the likeness and face from the provided reference images ONLY. For all other attributes (costume, environment, etc.), strictly follow the Technical Sheet and Scene Description.`
          : '';

      const singingInstruction =
        projectConfig.characterImages.length > 0
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
        referenceImages: isExtending ? undefined : projectConfig.characterImages,
        styleImage: isExtending ? null : projectConfig.styleImages[0] ?? null,
        inputVideo: previousVideo,
      };

      try {
        const {objectUrl, blob, video} = await generateVideo(
          params,
          apiKeyToUse,
        );
        objectUrls.current.add(objectUrl);
        const duration = await getVideoDuration(objectUrl);

        updateScene(sceneId, {
          status: SceneStatus.GENERATED,
          videoUrl: objectUrl,
          videoBlob: blob,
          videoObject: video,
          duration: duration,
          errorMessage: undefined,
          errorType: undefined,
        });
      } catch (error) {
        console.error('Scene generation failed:', error);
        let errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        let errorType: 'QUOTA_EXCEEDED' | undefined = undefined;

        try {
          const apiError = JSON.parse(errorMessage);
          if (apiError?.error?.code === 429) {
            errorType = 'QUOTA_EXCEEDED';
            errorMessage =
              apiError?.error?.message ??
              'Quota exceeded. Please check your plan and billing details.';
          } else if (apiError?.error?.code === 400) {
            errorMessage = `API Error: ${apiError?.error?.message ?? 'Invalid request.'}`;
          }
        } catch (e) {
          // Not a JSON error, keep original message
        }
        updateScene(sceneId, {
          status: SceneStatus.ERROR,
          errorMessage: errorMessage,
          errorType: errorType,
        });
      }
    },
    [projectConfig, scenes, localApiKey, updateScene],
  );

  const renderContent = () => {
    if (!isDbReady) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
        </div>
      );
    }
    switch (appMode) {
      case AppMode.SETUP:
        return (
          <ProjectSetup
            onComplete={handleProjectSetupComplete}
            initialConfig={projectConfig}
          />
        );
      case AppMode.STORYBOARD:
        if (!projectConfig) {
          // This case should ideally not be reached if logic is correct,
          // but this guard prevents a crash.
          return (
            <div className="flex-grow flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
            </div>
          );
        }
        return (
          <Storyboard
            scenes={scenes}
            onAddScene={addScene}
            onUpdateScene={updateScene}
            onDeleteScene={deleteScene}
            onGenerateScene={handleGenerateScene}
            onComplete={() => setAppMode(AppMode.FINAL_CUT)}
            onBack={handleBackToSetup}
            projectConfig={projectConfig}
            requestCount={requestCount}
            onReorderScene={handleReorderScene}
          />
        );
      case AppMode.FINAL_CUT:
        if (!projectConfig) {
          // This case should ideally not be reached, but this guard prevents a crash.
          return (
            <div className="flex-grow flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
            </div>
          );
        }
        return (
          <FinalCut
            scenes={scenes}
            projectConfig={projectConfig}
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
      <header className="py-8 flex flex-col justify-center items-center px-8 relative z-10 shrink-0 gap-10 bg-gradient-to-b from-gray-900/50 to-transparent border-b border-gray-800/50 backdrop-blur-sm">
        <h1 className="text-6xl font-bold tracking-wide text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse-glow">
          DreamDirector AI
        </h1>
        <Stepper currentMode={appMode} />
      </header>
      <main className="w-full max-w-6xl mx-auto flex-grow flex flex-col p-4 sm:p-6 overflow-y-auto">
        {renderContent()}
      </main>
      <StorageMonitor />
    </div>
  );
};

export default App;
