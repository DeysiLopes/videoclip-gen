/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  ImageFile,
  ProjectConfig,
  Resolution,
} from '../types';
import AudioTrackManager from './AudioTrackManager';
import {
  ArrowRightIcon,
  UploadIcon,
  XMarkIcon,
} from './icons';

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64});
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const extractVideoFrame = (videoFile: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
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
        const canvas = document.createElement('canvas');
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

const defaultTechnicalSheet = `Technical Sheet (applicable to all scenes)

Resolution: 4K (3840×2160)
Frame Rate: 24 fps
Aspect Ratio: 16:9
Simulated Cameras: 50mm (close-up) and 24mm (wide-angle)
Lighting: warm soft-key (#f6d27b) + golden backlight
Environment: light or mirrored floor, white columns, hanging lights, soft atmosphere with golden haze
Costume: Greek-style white dress, golden belt and bracelet, white sandals, long straight hair
Camera Movements: slow travellings, lateral pans, 360° rotation, final zoom-out
Visual Effects: golden particles, soft glow, warm flare, natural fade-in/fade-out`;

const StyleUploader: React.FC<{
  onSelect: (frame: ImageFile, sourceFile: File) => void;
  onRemove: () => void;
  styleSourceFile: File | null;
  label: string;
  description: string;
}> = ({onSelect, onRemove, styleSourceFile, label, description}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        let frame: ImageFile;
        if (file.type.startsWith('video/')) {
          frame = await extractVideoFrame(file);
        } else if (file.type.startsWith('image/')) {
          frame = await fileToImageFile(file);
        } else {
          alert('Unsupported file type. Please upload an image or video.');
          return;
        }
        onSelect(frame, file);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(
          `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
      {styleSourceFile ? (
        <div className="relative w-32 h-32 group flex-shrink-0">
          {styleSourceFile.type.startsWith('video/') ? (
            <video
              src={URL.createObjectURL(styleSourceFile)}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <img
              src={URL.createObjectURL(styleSourceFile)}
              alt="preview"
              className="w-full h-full object-cover rounded-lg"
            />
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove file">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-32 h-32 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0">
          <UploadIcon className="w-8 h-8" />
          <span className="text-sm mt-2">Upload</span>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
        </button>
      )}
    </div>
  );
};

interface ProjectSetupProps {
  onComplete: (config: ProjectConfig) => void;
  initialConfig?: ProjectConfig | null;
}

const parseConfigFromSheet = (text: string) => {
  let aspectRatio = AspectRatio.LANDSCAPE;
  let resolution = Resolution.P1080;

  const arMatch = text.match(/Aspect Ratio:\s*([^\n\r]*)/i);
  if (arMatch && arMatch[1]) {
    const parsedAr = arMatch[1].trim();
    if (Object.values(AspectRatio).includes(parsedAr as AspectRatio)) {
      aspectRatio = parsedAr as AspectRatio;
    }
  }

  const resMatch = text.match(/Resolution:\s*([^\n\r]*)/i);
  if (resMatch && resMatch[1]) {
    const parsedRes = resMatch[1].trim().toLowerCase();
    if (parsedRes.includes('720p')) {
      resolution = Resolution.P720;
    } else if (parsedRes.includes('4k') || parsedRes.includes('1080p')) {
      resolution = Resolution.P1080;
    }
  }
  return {aspectRatio, resolution};
};

const ProjectSetup: React.FC<ProjectSetupProps> = ({
  onComplete,
  initialConfig,
}) => {
  const [technicalSheet, setTechnicalSheet] = useState(defaultTechnicalSheet);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    () => parseConfigFromSheet(defaultTechnicalSheet).aspectRatio,
  );
  const [resolution, setResolution] = useState<Resolution>(
    () => parseConfigFromSheet(defaultTechnicalSheet).resolution,
  );

  const [characterImages, setCharacterImages] = useState<ImageFile[]>([]);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [styleSourceFile, setStyleSourceFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const characterImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialConfig) {
      setTechnicalSheet(initialConfig.technicalSheet);
      const {aspectRatio, resolution} = parseConfigFromSheet(
        initialConfig.technicalSheet,
      );
      setAspectRatio(aspectRatio);
      setResolution(resolution);
      setCharacterImages(initialConfig.characterImages);
      const firstStyleImage = initialConfig.styleImages?.[0];
      if (firstStyleImage) {
        setStyleImage(firstStyleImage);
        setStyleSourceFile(firstStyleImage.file);
      } else {
        setStyleImage(null);
        setStyleSourceFile(null);
      }
      setAudioFile(initialConfig.audioFile);
      setAudioUrl(initialConfig.audioUrl);
    }
  }, [initialConfig]);

  const handleAudioUpload = useCallback(
    (file: File) => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    },
    [audioUrl],
  );

  const handleRemoveAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl(null);
  }, [audioUrl]);

  const handleStyleSelect = (frame: ImageFile, sourceFile: File) => {
    setStyleImage(frame);
    setStyleSourceFile(sourceFile);
  };

  const handleStyleRemove = () => {
    setStyleImage(null);
    setStyleSourceFile(null);
  };

  const handleTechnicalSheetChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newText = e.target.value;
    setTechnicalSheet(newText);
    const {aspectRatio, resolution} = parseConfigFromSheet(newText);
    setAspectRatio(aspectRatio);
    setResolution(resolution);
  };

  const handleCharacterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && characterImages.length < 5) {
        try {
            const imageFile = await fileToImageFile(file);
            setCharacterImages(prev => [...prev, imageFile]);
        } catch (error) {
            console.error('Error converting file:', error);
        }
    }
    if (characterImageInputRef.current) {
        characterImageInputRef.current.value = '';
    }
  };

  const handleRemoveCharacterImage = (index: number) => {
      setCharacterImages(prev => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      technicalSheet,
      aspectRatio,
      resolution,
      characterImages,
      styleImages: styleImage ? [styleImage] : [],
      audioFile,
      audioUrl,
    });
  };

  return (
    <div className="flex-grow flex items-start justify-center pt-8">
      <div className="w-full max-w-3xl space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-200">
          Create a New Video Project
        </h2>
        <p className="text-center text-gray-400">
          Start by setting up the technical details and creative direction for
          your music video.
        </p>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Technical Sheet */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              1. Technical Sheet
            </h3>
            <textarea
              value={technicalSheet}
              onChange={handleTechnicalSheetChange}
              className="w-full h-72 bg-gray-900/70 border border-gray-600 rounded-lg p-4 font-mono text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
              placeholder="Enter your technical specifications for all scenes..."
            />
            <div className="mt-2 text-xs text-gray-500">
              <p>
                The app will parse Resolution and Aspect Ratio from this sheet.
              </p>
              <p className="mt-1">
                Detected - Resolution:{' '}
                <span className="text-gray-300 font-semibold">
                  {resolution}
                </span>
                , Aspect Ratio:{' '}
                <span className="text-gray-300 font-semibold">
                  {aspectRatio}
                </span>
              </p>
            </div>
          </div>

          {/* Character & Style */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white text-center">
              2. Character & Style (Optional)
            </h3>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white">Main Character</h3>
                <p className="text-gray-400 text-sm mt-1">Upload up to 5 images of the main character for better likeness.</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    {characterImages.map((image, index) => (
                        <div key={index} className="relative w-24 h-24 group flex-shrink-0">
                            <img
                                src={URL.createObjectURL(image.file)}
                                alt={`character preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveCharacterImage(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {characterImages.length < 5 && (
                        <button
                            type="button"
                            onClick={() => characterImageInputRef.current?.click()}
                            className="w-24 h-24 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0">
                            <UploadIcon className="w-8 h-8" />
                            <span className="text-xs mt-2">Upload ({characterImages.length}/5)</span>
                            <input
                                type="file"
                                ref={characterImageInputRef}
                                onChange={handleCharacterImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </button>
                    )}
                </div>
            </div>
            <StyleUploader
              label="Style Reference"
              description="Upload an image or short video to influence the video's artistic style, colors, and lighting."
              styleSourceFile={styleSourceFile}
              onSelect={handleStyleSelect}
              onRemove={handleStyleRemove}
            />
          </div>

          {/* Audio */}
          <div>
            <h3 className="text-xl font-semibold text-white text-center mb-4">
              3. Music Track
            </h3>
            <AudioTrackManager
              audioFile={audioFile}
              audioUrl={audioUrl}
              onUpload={handleAudioUpload}
              onRemove={handleRemoveAudio}
            />
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={!audioFile}
              className="w-full max-w-md px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg inline-flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed">
              Start Building Scenes
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            {!audioFile && (
              <p className="text-gray-400 text-sm mt-2">
                Please upload an audio track to continue.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSetup;