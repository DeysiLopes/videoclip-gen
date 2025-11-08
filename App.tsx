/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import FinalCut from './components/FinalCut';
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

const Stepper: React.FC<{currentMode: AppMode}> = ({currentMode}) => {
  const steps = [AppMode.SETUP, AppMode.STORYBOARD, AppMode.FINAL_CUT];
  const currentIndex = steps.indexOf(currentMode);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step}
            className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
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
                <span className="absolute -bottom-6 text-xs text-center w-full text-indigo-400 font-semibold">
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
                <span className="absolute -bottom-6 text-xs text-center w-full text-white font-semibold">
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
                <span className="absolute -bottom-6 text-xs text-center w-full text-gray-500">
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

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SETUP);
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(
    null,
  );
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          console.warn('aistudio.hasSelectedApiKey check failed.', error);
          setShowApiKeyDialog(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleProjectSetupComplete = useCallback((config: ProjectConfig) => {
    setProjectConfig(config);
    setAppMode(AppMode.STORYBOARD);
  }, []);

  const handleGenerateScene = useCallback(
    async (sceneId: string) => {
      if (!projectConfig) return;

      const sceneToGenerate = scenes.find((s) => s.id === sceneId);
      if (!sceneToGenerate) return;

      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
            return;
          }
        } catch (error) {
          setShowApiKeyDialog(true);
          return;
        }
      }

      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? {...s, status: SceneStatus.GENERATING} : s,
        ),
      );

      // --- Continuity Logic ---
      // Find previous video to ensure scenes connect
      const sortedScenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);
      const sceneIndex = sortedScenes.findIndex((s) => s.id === sceneId);
      let previousVideo: Video | undefined = undefined;
      if (sceneIndex > 0) {
        for (let i = sceneIndex - 1; i >= 0; i--) {
          const prevScene = sortedScenes[i];
          // Use the last generated or approved video as the starting point
          if (
            prevScene.videoObject &&
            (prevScene.status === SceneStatus.GENERATED ||
              prevScene.status === SceneStatus.APPROVED)
          ) {
            previousVideo = prevScene.videoObject;
            break;
          }
        }
      }
      // --- End Continuity Logic ---

      const hasReferences =
        projectConfig.characterImage || projectConfig.styleImages.length > 0;
      const isExtending = !!previousVideo;

      // The high-quality model is required for references or extending
      const useVeoHighQuality = hasReferences || isExtending;

      // --- Prompt Engineering ---
      const characterInstruction = projectConfig.characterImage
        ? `CRITICAL INSTRUCTION: For the main character, prioritize the likeness and face from the provided reference image ONLY. For all other attributes (costume, environment, etc.), strictly follow the Technical Sheet and Scene Description.`
        : '';

      const continuityInstruction = isExtending
        ? `This scene is a direct continuation of the previous one. Ensure a seamless visual and narrative transition.`
        : '';

      const finalPrompt = [
        projectConfig.technicalSheet,
        characterInstruction,
        continuityInstruction,
        `---`,
        `SCENE DESCRIPTION:\n${sceneToGenerate.prompt}`,
      ]
        .filter(Boolean)
        .join('\n\n');
      // --- End Prompt Engineering ---

      const params: VeoApiParams = {
        prompt: finalPrompt,
        model: useVeoHighQuality ? VeoModel.VEO : VeoModel.VEO_FAST,
        // Enforce 720p and 16:9 for the high quality model (required for references/extending)
        aspectRatio: useVeoHighQuality
          ? AspectRatio.LANDSCAPE
          : projectConfig.aspectRatio,
        resolution: useVeoHighQuality
          ? Resolution.P720
          : projectConfig.resolution,
        referenceImages: projectConfig.characterImage
          ? [projectConfig.characterImage]
          : [],
        styleImage: projectConfig.styleImages[0] ?? null,
        inputVideo: previousVideo,
      };

      try {
        const {objectUrl, blob, video} = await generateVideo(params);
        setScenes((prev) =>
          prev.map((s) =>
            s.id === sceneId
              ? {
                  ...s,
                  status: SceneStatus.GENERATED,
                  videoUrl: objectUrl,
                  videoBlob: blob,
                  videoObject: video,
                  errorMessage: undefined,
                }
              : s,
          ),
        );
      } catch (error) {
        console.error('Scene generation failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        setScenes((prev) =>
          prev.map((s) =>
            s.id === sceneId
              ? {
                  ...s,
                  status: SceneStatus.ERROR,
                  errorMessage: errorMessage,
                }
              : s,
          ),
        );
      }
    },
    [projectConfig, scenes],
  );

  const renderContent = () => {
    switch (appMode) {
      case AppMode.SETUP:
        return <ProjectSetup onComplete={handleProjectSetupComplete} />;
      case AppMode.STORYBOARD:
        return (
          <Storyboard
            scenes={scenes}
            setScenes={setScenes}
            onGenerateScene={handleGenerateScene}
            onComplete={() => setAppMode(AppMode.FINAL_CUT)}
            projectConfig={projectConfig!}
          />
        );
      case AppMode.FINAL_CUT:
        return (
          <FinalCut
            scenes={scenes.filter((s) => s.status === SceneStatus.APPROVED)}
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
      <header className="py-6 flex flex-col justify-center items-center px-8 relative z-10 shrink-0 gap-8">
        <h1 className="text-5xl font-semibold tracking-wide text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Veo Studio
        </h1>
        <Stepper currentMode={appMode} />
      </header>
      <main className="w-full max-w-6xl mx-auto flex-grow flex flex-col p-4 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
