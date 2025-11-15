/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useRef, useState} from 'react';
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

const defaultTechnicalSheet = `Ficha Técnica (aplicável a todas as cenas)

Resolução: 4K (3840×2160)
Taxa de Quadros: 24 fps
Proporção de Tela: 16:9
Câmeras Simuladas: 50mm (close-up) e 24mm (grande-angular)
Iluminação: soft-key quente (#f6d27b) + luz de fundo dourada
Ambiente: piso claro ou espelhado, colunas brancas, luzes suspensas, atmosfera suave com névoa dourada
Figurino: vestido branco estilo grego, cinto e pulseira dourados, sandálias brancas, cabelo longo e liso
Movimentos de Câmera: travellings lentos, panorâmicas laterais, rotação 360°, zoom-out final
Efeitos Visuais: partículas douradas, brilho suave, reflexo quente, fade-in/fade-out natural`;

const StyleUploader: React.FC<{
  onSelect: (frame: ImageFile, sourceFile: File) => void;
  onRemove: () => void;
  styleSourceFile: File | null;
  label: string;
  description: string;
}> = ({onSelect, onRemove, styleSourceFile, label, description}) => {
  // Fix: Cannot find name 'HTMLInputElement'.
  const inputRef = useRef<any>(null);
  const [styleSourceUrl, setStyleSourceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (styleSourceFile) {
      const url = URL.createObjectURL(styleSourceFile);
      setStyleSourceUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setStyleSourceUrl(null);
  }, [styleSourceFile]);

  // Fix: Cannot find name 'HTMLInputElement'.
  const handleFileChange = async (e: React.ChangeEvent<any>) => {
    // Fix: Property 'files' does not exist on type 'EventTarget & HTMLInputElement'.
    const file = (e.target as any).files?.[0];
    if (file) {
      try {
        let frame: ImageFile;
        if (file.type.startsWith('video/')) {
          frame = await extractVideoFrame(file);
        } else if (file.type.startsWith('image/')) {
          frame = await fileToImageFile(file);
        } else {
          (window as any).alert('Tipo de arquivo não suportado. Por favor, envie uma imagem ou vídeo.');
          return;
        }
        onSelect(frame, file);
      } catch (error) {
        console.error('Error processing file:', error);
        (window as any).alert(
          `Erro ao processar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        );
      }
    }
    if (inputRef.current) {
      // Fix: Property 'value' does not exist on type 'HTMLInputElement'.
      (inputRef.current as any).value = '';
    }
  };

  return (
    <div className="card-modern flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
      {styleSourceFile && styleSourceUrl ? (
        <div className="relative w-32 h-32 group flex-shrink-0">
          {styleSourceFile.type.startsWith('video/') ? (
            <video
              src={styleSourceUrl}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-xl border-2 border-gray-700 group-hover:border-indigo-500 transition-all"
            />
          ) : (
            <img
              src={styleSourceUrl}
              alt="preview"
              className="w-full h-full object-cover rounded-xl border-2 border-gray-700 group-hover:border-indigo-500 transition-all"
            />
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-red-600/90 hover:bg-red-700 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
            aria-label="Remove file">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          // Fix: Property 'click' does not exist on type 'HTMLInputElement'.
          onClick={() => (inputRef.current as any)?.click()}
          className="w-32 h-32 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500 transition-all hover:scale-105 flex-shrink-0">
          <UploadIcon className="w-10 h-10" />
          <span className="text-sm mt-2 font-semibold">Enviar</span>
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

  const arMatch = text.match(/Proporção de Tela:\s*([^\n\r]*)/i) || text.match(/Aspect Ratio:\s*([^\n\r]*)/i);
  if (arMatch && arMatch[1]) {
    const parsedAr = arMatch[1].trim();
    if (Object.values(AspectRatio).includes(parsedAr as AspectRatio)) {
      aspectRatio = parsedAr as AspectRatio;
    }
  }

  const resMatch = text.match(/Resolução:\s*([^\n\r]*)/i) || text.match(/Resolution:\s*([^\n\r]*)/i);
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
  const [technicalSheet, setTechnicalSheet] = useState(initialConfig?.technicalSheet || defaultTechnicalSheet);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    () => parseConfigFromSheet(initialConfig?.technicalSheet || defaultTechnicalSheet).aspectRatio,
  );
  const [resolution, setResolution] = useState<Resolution>(
    () => parseConfigFromSheet(initialConfig?.technicalSheet || defaultTechnicalSheet).resolution,
  );

  const [characterImages, setCharacterImages] = useState<ImageFile[]>(initialConfig?.characterImages || []);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(initialConfig?.styleImages?.[0] || null);
  const [styleSourceFile, setStyleSourceFile] = useState<File | null>(initialConfig?.styleImages?.[0]?.file || null);
  const [audioFile, setAudioFile] = useState<File | null>(initialConfig?.audioFile || null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Fix: Cannot find name 'HTMLInputElement'.
  const characterImageInputRef = useRef<any>(null);
  
  // Effect to sync with prop, runs only when the component mounts or config prop identity changes.
  useEffect(() => {
    if (initialConfig) {
      setTechnicalSheet(initialConfig.technicalSheet);
      const {aspectRatio, resolution} = parseConfigFromSheet(initialConfig.technicalSheet);
      setAspectRatio(aspectRatio);
      setResolution(resolution);
      setCharacterImages(initialConfig.characterImages);
      const firstStyleImage = initialConfig.styleImages?.[0];
      setStyleImage(firstStyleImage || null);
      setStyleSourceFile(firstStyleImage?.file || null);
      setAudioFile(initialConfig.audioFile);
    }
  }, [initialConfig]);
  
  // Manage audio URL lifecycle
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setAudioUrl(null);
  }, [audioFile]);

  const handleAudioUpload = (file: File) => {
    setAudioFile(file);
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
  };

  const handleStyleSelect = (frame: ImageFile, sourceFile: File) => {
    setStyleImage(frame);
    setStyleSourceFile(sourceFile);
  };

  const handleStyleRemove = () => {
    setStyleImage(null);
    setStyleSourceFile(null);
  };

  const handleTechnicalSheetChange = (
    // Fix: Cannot find name 'HTMLTextAreaElement'.
    e: React.ChangeEvent<any>,
  ) => {
    // Fix: Property 'value' does not exist on type 'EventTarget & HTMLTextAreaElement'.
    const newText = (e.target as any).value;
    setTechnicalSheet(newText);
    const {aspectRatio, resolution} = parseConfigFromSheet(newText);
    setAspectRatio(aspectRatio);
    setResolution(resolution);
  };

  // Fix: Cannot find name 'HTMLInputElement'.
  const handleCharacterImageUpload = async (e: React.ChangeEvent<any>) => {
    // Fix: Property 'files' does not exist on type 'EventTarget & HTMLInputElement'.
    const files = (e.target as any).files;
    if (!files || files.length === 0) return;

    const currentImageCount = characterImages.length;
    const slotsAvailable = 5 - currentImageCount;

    if (slotsAvailable <= 0) {
      (window as any).alert('Você já atingiu o limite de 5 imagens.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, slotsAvailable) as File[];
    
    if (files.length > slotsAvailable) {
        (window as any).alert(`Limite de 5 imagens excedido. Apenas as primeiras ${slotsAvailable} imagens serão adicionadas.`);
    }

    try {
        const newImageFiles = await Promise.all(filesToProcess.map(fileToImageFile));
        setCharacterImages(prev => [...prev, ...newImageFiles]);
    } catch (error) {
        console.error('Error converting files:', error);
        (window as any).alert('Houve um erro ao processar uma ou mais imagens.');
    }

    if (characterImageInputRef.current) {
        // Fix: Property 'value' does not exist on type 'HTMLInputElement'.
        (characterImageInputRef.current as any).value = '';
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
      audioUrl: null, // Pass null, App component will manage its own URL lifecycle
    });
  };

  const CharacterImagePreview: React.FC<{image: ImageFile, onRemove: () => void}> = ({ image, onRemove }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const newUrl = URL.createObjectURL(image.file);
        setUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
    }, [image]);

    if (!url) return null;

    return (
        <div className="relative w-24 h-24 group flex-shrink-0">
            <img
                src={url}
                alt={`character preview`}
                className="w-full h-full object-cover rounded-xl border-2 border-gray-700 group-hover:border-indigo-500 transition-all shadow-lg"
            />
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 w-7 h-7 bg-red-600/90 hover:bg-red-700 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
                aria-label="Remove image">
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
  };


  return (
    <div className="flex-grow flex items-start justify-center pt-8">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold gradient-text">
            Criar um Novo Projeto de Vídeo
          </h2>
          <p className="text-gray-400 text-lg">
            Comece configurando os detalhes técnicos e a direção criativa do seu videoclipe.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Technical Sheet */}
          <div className="card-modern space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <span className="text-indigo-400 font-bold text-lg">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-white">
                Ficha Técnica
              </h3>
            </div>
            <textarea
              value={technicalSheet}
              onChange={handleTechnicalSheetChange}
              className="w-full h-72 bg-gray-900/70 border border-gray-600 rounded-xl p-4 font-mono text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y transition-all"
              placeholder="Insira suas especificações técnicas para todas as cenas..."
            />
            <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-2">
                O aplicativo analisará a Resolução e a Proporção de Tela desta ficha.
              </p>
              <div className="flex gap-6">
                <div className="badge-info">
                  Resolução: <span className="font-bold ml-1">{resolution}</span>
                </div>
                <div className="badge-info">
                  Proporção: <span className="font-bold ml-1">{aspectRatio}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Character & Style */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                <span className="text-purple-400 font-bold text-lg">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-white">
                Personagem e Estilo (Opcional)
              </h3>
            </div>
            <div className="card-modern space-y-4">
                <h3 className="text-lg font-semibold text-white">Personagem Principal</h3>
                <p className="text-gray-400 text-sm">Envie até 5 imagens do personagem principal para melhor semelhança.</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    {characterImages.map((image, index) => (
                        <CharacterImagePreview 
                          key={`${image.file.name}-${index}`} 
                          image={image} 
                          onRemove={() => handleRemoveCharacterImage(index)} 
                        />
                    ))}
                    {characterImages.length < 5 && (
                        <button
                            type="button"
                            // Fix: Property 'click' does not exist on type 'HTMLInputElement'.
                            onClick={() => (characterImageInputRef.current as any)?.click()}
                            className="w-24 h-24 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-all hover:border-indigo-500 hover:scale-105 flex-shrink-0">
                            <UploadIcon className="w-8 h-8" />
                            <span className="text-xs mt-2 font-semibold">Enviar ({characterImages.length}/5)</span>
                            <input
                                type="file"
                                ref={characterImageInputRef}
                                onChange={handleCharacterImageUpload}
                                accept="image/*"
                                className="hidden"
                                multiple
                            />
                        </button>
                    )}
                </div>
            </div>
            <StyleUploader
              label="Referência de Estilo"
              description="Envie uma imagem ou um vídeo curto para influenciar o estilo artístico, as cores e a iluminação do vídeo."
              styleSourceFile={styleSourceFile}
              onSelect={handleStyleSelect}
              onRemove={handleStyleRemove}
            />
          </div>

          {/* Audio */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-pink-600/20 flex items-center justify-center">
                <span className="text-pink-400 font-bold text-lg">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-white">
                Faixa de Música
              </h3>
            </div>
            <AudioTrackManager
              audioFile={audioFile}
              audioUrl={audioUrl}
              onUpload={handleAudioUpload}
              onRemove={handleRemoveAudio}
            />
          </div>

          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={!audioFile}
              className="btn-primary w-full max-w-md text-lg inline-flex items-center justify-center gap-3">
              Começar a Construir Cenas
              <ArrowRightIcon className="w-6 h-6" />
            </button>
            {!audioFile && (
              <p className="text-gray-400 text-sm mt-3 animate-pulse">
                Por favor, envie uma faixa de áudio para continuar.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSetup;