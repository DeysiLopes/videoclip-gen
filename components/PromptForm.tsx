/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  GenerateVideoParams,
  GenerationMode,
  ImageFile,
  Resolution,
  VeoModel,
  VideoFile,
} from '../types';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  FilmIcon,
  FramesModeIcon,
  PlusIcon,
  RectangleStackIcon,
  ReferencesModeIcon,
  ReplaceIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TextModeIcon,
  TvIcon,
  XMarkIcon,
} from './icons';

const aspectRatioDisplayNames: Record<AspectRatio, string> = {
  [AspectRatio.LANDSCAPE]: 'Landscape (16:9)',
  [AspectRatio.PORTRAIT]: 'Portrait (9:16)',
};

const modeIcons: Record<GenerationMode, React.ReactNode> = {
  [GenerationMode.TEXT_TO_VIDEO]: <TextModeIcon className="w-5 h-5" />,
  [GenerationMode.FRAMES_TO_VIDEO]: <FramesModeIcon className="w-5 h-5" />,
  [GenerationMode.REFERENCES_TO_VIDEO]: (
    <ReferencesModeIcon className="w-5 h-5" />
  ),
  [GenerationMode.REMIX_VIDEO]: <ReplaceIcon className="w-5 h-5" />,
  [GenerationMode.EXTEND_VIDEO]: <FilmIcon className="w-5 h-5" />,
};

const fileToBase64 = <T extends {file: File; base64: string}>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64} as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
  fileToBase64<ImageFile>(file);
const fileToVideoFile = (file: File): Promise<VideoFile> =>
  fileToBase64<VideoFile>(file);

const extractVideoFrame = (videoFile: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    // Fix: Cannot find name 'document'.
    const video = (window as any).document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
    };

    video.onloadeddata = () => {
      video.currentTime = 0;
    };

    video.onseeked = () => {
      setTimeout(() => {
        // Fix: Cannot find name 'document'.
        const canvas = (window as any).document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              cleanup();
              return reject(new Error('Canvas to Blob conversion failed'));
            }
            try {
              const newFile = new File([blob], 'frame.jpg', {
                type: 'image/jpeg',
              });
              const imageFile = await fileToImageFile(newFile);
              cleanup();
              resolve(imageFile);
            } catch (error) {
              cleanup();
              reject(error);
            }
          },
          'image/jpeg',
          0.95,
        );
      }, 200);
    };

    video.onerror = (e) => {
      cleanup();
      const errorEvent = e as ErrorEvent;
      reject(new Error(`Error loading video file: ${errorEvent.message}`));
    };
  });
};

const parseMMSS = (value: string): number => {
  const parts = value.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

const CustomSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({label, value, onChange, icon, children, disabled = false}) => (
  <div>
    <label
      className={`text-xs block mb-1.5 font-medium ${
        disabled ? 'text-gray-500' : 'text-gray-400'
      }`}>
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {icon}
      </div>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-700/50 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed">
        {children}
      </select>
      <ChevronDownIcon
        className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
          disabled ? 'text-gray-600' : 'text-gray-400'
        }`}
      />
    </div>
  </div>
);

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
}> = ({onSelect, onRemove, image, label}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Cast to any to access files property, due to a potential TS configuration issue.
    const file = (e.target as any).files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    // Reset input value to allow selecting the same file again
    if (inputRef.current) {
      (inputRef.current as any).value = '';
    }
  };

  if (image) {
    return (
      <div className="relative w-28 h-20 group">
        <img
          src={URL.createObjectURL(image.file)}
          alt="preview"
          className="w-full h-full object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (inputRef.current as any)?.click()}
      className="w-28 h-20 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors">
      <PlusIcon className="w-6 h-6" />
      <span className="text-xs mt-1">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

const VideoUpload: React.FC<{
  onSelect: (video: VideoFile) => void;
  onRemove?: () => void;
  video?: VideoFile | null;
  label: React.ReactNode;
}> = ({onSelect, onRemove, video, label}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Cast to any to access files property, due to a potential TS configuration issue.
    const file = (e.target as any).files?.[0];
    if (file) {
      try {
        const videoFile = await fileToVideoFile(file);
        onSelect(videoFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
  };

  if (video) {
    return (
      <div className="relative w-48 h-28 group">
        <video
          src={URL.createObjectURL(video.file)}
          muted
          loop
          className="w-full h-full object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove video">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (inputRef.current as any)?.click()}
      className="w-48 h-28 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors text-center">
      <PlusIcon className="w-6 h-6" />
      <span className="text-xs mt-1 px-2">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
    </button>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateVideoParams) => void;
  initialValues?: GenerateVideoParams | null;
  isAudioUploaded: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  initialValues,
  isAudioUploaded,
}) => {
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '');
  const [model, setModel] = useState<VeoModel>(
    initialValues?.model ?? VeoModel.VEO_FAST,
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    initialValues?.aspectRatio ?? AspectRatio.LANDSCAPE,
  );
  const [resolution, setResolution] = useState<Resolution>(
    initialValues?.resolution ?? Resolution.P720,
  );
  const [generationMode, setGenerationMode] = useState<GenerationMode>(
    initialValues?.mode ?? GenerationMode.TEXT_TO_VIDEO,
  );
  const [startFrame, setStartFrame] = useState<ImageFile | null>(
    initialValues?.startFrame ?? null,
  );
  const [endFrame, setEndFrame] = useState<ImageFile | null>(
    initialValues?.endFrame ?? null,
  );
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>(
    initialValues?.referenceImages ?? [],
  );
  const [styleImage, setStyleImage] = useState<ImageFile | null>(
    initialValues?.styleImage ?? null,
  );
  const [inputVideo, setInputVideo] = useState<VideoFile | null>(
    initialValues?.inputVideo ?? null,
  );
  const [inputVideoObject, setInputVideoObject] = useState<Video | null>(
    initialValues?.inputVideoObject ?? null,
  );
  const [isLooping, setIsLooping] = useState(initialValues?.isLooping ?? false);

  const [remixSubjectImage, setRemixSubjectImage] = useState<ImageFile | null>(
    null,
  );
  const [sourceVideo, setSourceVideo] = useState<VideoFile | null>(null);
  const [startTimeStr, setStartTimeStr] = useState('00:00');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeSelectorRef = useRef<HTMLDivElement>(null);

  // Sync state with initialValues prop when it changes (e.g., for "Extend" or "Try Again")
  useEffect(() => {
    if (initialValues) {
      setPrompt(initialValues.prompt ?? '');
      setModel(initialValues.model ?? VeoModel.VEO_FAST);
      setAspectRatio(initialValues.aspectRatio ?? AspectRatio.LANDSCAPE);
      setResolution(initialValues.resolution ?? Resolution.P720);
      setGenerationMode(initialValues.mode ?? GenerationMode.TEXT_TO_VIDEO);
      setStartFrame(initialValues.startFrame ?? null);
      setEndFrame(initialValues.endFrame ?? null);
      setReferenceImages(initialValues.referenceImages ?? []);
      setStyleImage(initialValues.styleImage ?? null);
      setInputVideo(initialValues.inputVideo ?? null);
      setInputVideoObject(initialValues.inputVideoObject ?? null);
      setIsLooping(initialValues.isLooping ?? false);
      const sceneStartTime = initialValues.sceneStartTime ?? 0;
      const minutes = Math.floor(sceneStartTime / 60);
      const seconds = Math.floor(sceneStartTime % 60);
      setStartTimeStr(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
      setRemixSubjectImage(null);
      setSourceVideo(null);
    } else {
      setStartTimeStr('00:00');
    }
  }, [initialValues]);

  useEffect(() => {
    if (
      generationMode === GenerationMode.REFERENCES_TO_VIDEO ||
      generationMode === GenerationMode.REMIX_VIDEO
    ) {
      setModel(VeoModel.VEO);
      setAspectRatio(AspectRatio.LANDSCAPE);
      setResolution(Resolution.P720);
    } else if (generationMode === GenerationMode.EXTEND_VIDEO) {
      setResolution(Resolution.P720);
    }
  }, [generationMode]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Fix: Property 'style' does not exist on type 'HTMLTextAreaElement'.
      (textarea as any).style.height = 'auto';
      // Fix: Property 'style' and 'scrollHeight' do not exist on type 'HTMLTextAreaElement'.
      (textarea as any).style.height = `${(textarea as any).scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Fix: Property 'contains' does not exist on type 'HTMLDivElement'.
      if (
        modeSelectorRef.current &&
        !(modeSelectorRef.current as any).contains(event.target as any)
      ) {
        setIsModeSelectorOpen(false);
      }
    };
    (window as any).document.addEventListener('mousedown', handleClickOutside);
    return () => (window as any).document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const params: GenerateVideoParams = {
        prompt,
        model,
        aspectRatio,
        resolution,
        mode: generationMode,
        sceneStartTime: isAudioUploaded ? parseMMSS(startTimeStr) : undefined,
        startFrame,
        endFrame,
        referenceImages:
          generationMode === GenerationMode.REMIX_VIDEO
            ? remixSubjectImage
              ? [remixSubjectImage]
              : []
            : referenceImages,
        styleImage,
        inputVideo,
        inputVideoObject,
        isLooping,
      };

      if (generationMode === GenerationMode.REMIX_VIDEO) {
        params.model = VeoModel.VEO;
        params.aspectRatio = AspectRatio.LANDSCAPE;
        params.resolution = Resolution.P720;
      }

      onGenerate(params);
    },
    [
      prompt,
      model,
      aspectRatio,
      resolution,
      generationMode,
      startFrame,
      endFrame,
      referenceImages,
      styleImage,
      inputVideo,
      inputVideoObject,
      onGenerate,
      isLooping,
      remixSubjectImage,
      isAudioUploaded,
      startTimeStr,
    ],
  );

  const handleSelectMode = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setIsModeSelectorOpen(false);
    // Reset media when mode changes to avoid confusion
    setStartFrame(null);
    setEndFrame(null);
    setReferenceImages([]);
    setStyleImage(null);
    setInputVideo(null);
    setInputVideoObject(null);
    setIsLooping(false);
    setRemixSubjectImage(null);
    setSourceVideo(null);
  };

  const promptPlaceholder = {
    [GenerationMode.TEXT_TO_VIDEO]: 'Describe the video you want to create...',
    [GenerationMode.FRAMES_TO_VIDEO]:
      'Describe motion between start and end frames (optional)...',
    [GenerationMode.REFERENCES_TO_VIDEO]:
      'Describe a video using reference and style images...',
    [GenerationMode.REMIX_VIDEO]: 'Describe the video with the new subject...',
    [GenerationMode.EXTEND_VIDEO]: 'Describe what happens next (optional)...',
  }[generationMode];

  const selectableModes = [
    GenerationMode.TEXT_TO_VIDEO,
    GenerationMode.FRAMES_TO_VIDEO,
    GenerationMode.REFERENCES_TO_VIDEO,
    GenerationMode.REMIX_VIDEO,
  ];

  const renderMediaUploads = () => {
    if (generationMode === GenerationMode.FRAMES_TO_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <ImageUpload
              label="Start Frame"
              image={startFrame}
              onSelect={setStartFrame}
              onRemove={() => {
                setStartFrame(null);
                setIsLooping(false);
              }}
            />
            {!isLooping && (
              <ImageUpload
                label="End Frame"
                image={endFrame}
                onSelect={setEndFrame}
                onRemove={() => setEndFrame(null)}
              />
            )}
          </div>
          {startFrame && !endFrame && (
            <div className="mt-3 flex items-center">
              <input
                id="loop-video-checkbox"
                type="checkbox"
                checked={isLooping}
                // Fix: Cast to any to access checked property, due to a potential TS configuration issue.
                onChange={(e) => setIsLooping((e.target as any).checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-offset-gray-800 cursor-pointer"
              />
              <label
                htmlFor="loop-video-checkbox"
                className="ml-2 text-sm font-medium text-gray-300 cursor-pointer">
                Create a looping video
              </label>
            </div>
          )}
        </div>
      );
    }
    if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2 text-center">
              Reference Images
            </h4>
            <p className="text-xs text-gray-500 mb-3 text-center px-4">
              Provide up to 3 images of characters or objects to include in the
              video.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {referenceImages.map((img, index) => (
                <ImageUpload
                  key={index}
                  image={img}
                  label=""
                  onSelect={() => {}}
                  onRemove={() =>
                    setReferenceImages((imgs) =>
                      imgs.filter((_, i) => i !== index),
                    )
                  }
                />
              ))}
              {referenceImages.length < 3 && (
                <ImageUpload
                  label="Add Reference"
                  onSelect={(img) =>
                    setReferenceImages((imgs) => [...imgs, img])
                  }
                />
              )}
            </div>
          </div>
          <div className="border-t border-gray-600"></div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2 text-center">
              Style Image
            </h4>
            <p className="text-xs text-gray-500 mb-3 text-center px-4">
              Provide one image to influence the video's artistic style,
              colors, and lighting.
            </p>
            <div className="flex items-center justify-center">
              <ImageUpload
                label="Style Image"
                image={styleImage}
                onSelect={setStyleImage}
                onRemove={() => setStyleImage(null)}
              />
            </div>
          </div>
        </div>
      );
    }
    if (generationMode === GenerationMode.REMIX_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <VideoUpload
              label="Source Video"
              video={sourceVideo}
              onSelect={async (video) => {
                setSourceVideo(video);
                try {
                  const frame = await extractVideoFrame(video.file);
                  setStyleImage(frame);
                } catch (error) {
                  console.error('Failed to extract frame:', error);
                  (window as any).alert(
                    `Failed to extract frame from video: ${error instanceof Error ? error.message : 'Unknown error'}`,
                  );
                }
              }}
              onRemove={() => {
                setSourceVideo(null);
                setStyleImage(null);
              }}
            />
            <ImageUpload
              label="New Subject"
              image={remixSubjectImage}
              onSelect={setRemixSubjectImage}
              onRemove={() => setRemixSubjectImage(null)}
            />
          </div>
          {styleImage && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-400 mb-2">
                Style frame from video:
              </p>
              <img
                src={URL.createObjectURL(styleImage.file)}
                alt="extracted frame"
                className="w-28 h-20 object-cover rounded-lg inline-block"
              />
            </div>
          )}
        </div>
      );
    }
    if (generationMode === GenerationMode.EXTEND_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex items-center justify-center gap-4">
          <VideoUpload
            label={
              <>
                Input Video
                <br />
                (must be 720p veo generated)
              </>
            }
            video={inputVideo}
            onSelect={setInputVideo}
            onRemove={() => {
              setInputVideo(null);
              setInputVideoObject(null);
            }}
          />
        </div>
      );
    }
    return null;
  };

  const isRefMode =
    generationMode === GenerationMode.REFERENCES_TO_VIDEO ||
    generationMode === GenerationMode.REMIX_VIDEO;
  const isExtendMode = generationMode === GenerationMode.EXTEND_VIDEO;

  let isSubmitDisabled = false;
  let tooltipText = '';

  switch (generationMode) {
    case GenerationMode.TEXT_TO_VIDEO:
      isSubmitDisabled = !prompt.trim();
      if (isSubmitDisabled) {
        tooltipText = 'Please enter a prompt.';
      }
      break;
    case GenerationMode.FRAMES_TO_VIDEO:
      isSubmitDisabled = !startFrame;
      if (isSubmitDisabled) {
        tooltipText = 'A start frame is required.';
      }
      break;
    case GenerationMode.REFERENCES_TO_VIDEO:
      const hasNoRefs = referenceImages.length === 0 && !styleImage;
      const hasNoPrompt = !prompt.trim();
      isSubmitDisabled = hasNoRefs || hasNoPrompt;
      if (hasNoRefs && hasNoPrompt) {
        tooltipText =
          'Please add reference or style image(s) and enter a prompt.';
      } else if (hasNoRefs) {
        tooltipText = 'At least one reference or style image is required.';
      } else if (hasNoPrompt) {
        tooltipText = 'Please enter a prompt.';
      }
      break;
    case GenerationMode.REMIX_VIDEO:
      isSubmitDisabled = !sourceVideo || !remixSubjectImage || !prompt.trim();
      if (!sourceVideo) {
        tooltipText = 'A source video is required.';
      } else if (!remixSubjectImage) {
        tooltipText = 'A new subject image is required.';
      } else if (!prompt.trim()) {
        tooltipText = 'A prompt is required for Remix mode.';
      }
      break;
    case GenerationMode.EXTEND_VIDEO:
      isSubmitDisabled = !inputVideoObject;
      if (isSubmitDisabled) {
        tooltipText =
          'An input video from a previous generation is required to extend.';
      }
      break;
  }

  return (
    <div className="relative w-full">
      {isSettingsOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomSelect
              label="Model"
              value={model}
              // Fix: Cast to any to access value property, due to a potential TS configuration issue.
              onChange={(e) => setModel((e.target as any).value as VeoModel)}
              icon={<SparklesIcon className="w-5 h-5 text-gray-400" />}
              disabled={isRefMode}>
              {Object.values(VeoModel).map((modelValue) => (
                <option key={modelValue} value={modelValue}>
                  {modelValue}
                </option>
              ))}
            </CustomSelect>
            <CustomSelect
              label="Aspect Ratio"
              value={aspectRatio}
              // Fix: Cast to any to access value property, due to a potential TS configuration issue.
              onChange={(e) => setAspectRatio((e.target as any).value as AspectRatio)}
              icon={<RectangleStackIcon className="w-5 h-5 text-gray-400" />}
              disabled={isRefMode || isExtendMode}>
              {Object.entries(aspectRatioDisplayNames).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </CustomSelect>
            <div>
              <CustomSelect
                label="Resolution"
                value={resolution}
                // Fix: Cast to any to access value property, due to a potential TS configuration issue.
                onChange={(e) => setResolution((e.target as any).value as Resolution)}
                icon={<TvIcon className="w-5 h-5 text-gray-400" />}
                disabled={isRefMode || isExtendMode}>
                <option value={Resolution.P720}>720p</option>
                <option value={Resolution.P1080}>1080p</option>
              </CustomSelect>
              {resolution === Resolution.P1080 && (
                <p className="text-xs text-yellow-400/80 mt-2">
                  1080p videos can't be extended.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        {renderMediaUploads()}
        {isAudioUploaded && (
          <div className="mb-3 p-3 bg-[#2c2c2e] rounded-xl border border-gray-700 flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <label
              htmlFor="start-time"
              className="text-sm font-medium text-gray-300">
              Scene Start Time:
            </label>
            <input
              id="start-time"
              type="text"
              value={startTimeStr}
              // Fix: Cast to any to access value property, due to a potential TS configuration issue.
              onChange={(e) => setStartTimeStr((e.target as any).value)}
              placeholder="MM:SS"
              className="w-24 bg-[#1f1f1f] border border-gray-600 rounded-md px-2 py-1 text-center font-mono focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}
        <div className="flex items-end gap-2 bg-[#1f1f1f] border border-gray-600 rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500">
          <div className="relative" ref={modeSelectorRef}>
            <button
              type="button"
              onClick={() => setIsModeSelectorOpen((prev) => !prev)}
              className="flex shrink-0 items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              aria-label="Select generation mode">
              {modeIcons[generationMode]}
              <span className="font-medium text-sm whitespace-nowrap">
                {generationMode}
              </span>
            </button>
            {isModeSelectorOpen && (
              <div className="absolute bottom-full mb-2 w-60 bg-[#2c2c2e] border border-gray-600 rounded-lg shadow-xl overflow-hidden z-10">
                {selectableModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleSelectMode(mode)}
                    className={`w-full text-left flex items-center gap-3 p-3 hover:bg-indigo-600/50 ${generationMode === mode ? 'bg-indigo-600/30 text-white' : 'text-gray-300'}`}>
                    {modeIcons[mode]}
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={prompt}
            // Fix: Cast to any to access value property, due to a potential TS configuration issue.
            onChange={(e) => setPrompt((e.target as any).value)}
            placeholder={promptPlaceholder}
            className="flex-grow bg-transparent focus:outline-none resize-none text-base text-gray-200 placeholder-gray-500 max-h-48 py-2"
            rows={1}
          />
          <button
            type="button"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`p-2.5 rounded-full hover:bg-gray-700 ${isSettingsOpen ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
            aria-label="Toggle settings">
            <SlidersHorizontalIcon className="w-5 h-5" />
          </button>
          <div className="relative group">
            <button
              type="submit"
              className="p-2.5 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
              aria-label="Generate video"
              disabled={isSubmitDisabled}>
              <ArrowRightIcon className="w-5 h-5 text-white" />
            </button>
            {isSubmitDisabled && tooltipText && (
              <div
                role="tooltip"
                className="absolute bottom-full right-0 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {tooltipText}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2 px-4">
          Veo is a paid-only model. You will be charged on your Cloud project. See{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/pricing#veo-3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            pricing details
          </a>
          .
        </p>
      </form>
    </div>
  );
};

export default PromptForm;