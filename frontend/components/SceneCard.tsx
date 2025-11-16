/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useRef, useState} from 'react';
import {Scene, SceneStatus} from '../src/types';
import {
  ApproveIcon,
  ArrowPathIcon,
  ClockIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  LoopIcon,
  UploadIcon,
} from './icons';
import LoadingIndicator from './LoadingIndicator';
import {getVideoDuration} from '../src/services/utils';

const formatSeconds = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

interface SceneCardProps {
  scene: Scene;
  sceneNumber: number;
  onUpdate: (id: string, updates: Partial<Scene>) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  onSeekToScene?: (sceneId: string) => void;
  isActive: boolean;
  isPlaying: boolean;
  masterCurrentTime: number;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  sceneNumber,
  onUpdate,
  onDelete,
  onGenerate,
  onSeekToScene,
  isActive,
  isPlaying,
  masterCurrentTime,
}) => {
  const [isEditing, setIsEditing] = useState(scene.status === SceneStatus.DRAFT);
  const [prompt, setPrompt] = useState(scene.prompt);
  const [showUploadDurationModal, setShowUploadDurationModal] = useState(false);
  const [uploadDuration, setUploadDuration] = useState<number>(scene.intendedDuration ?? 35);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  // Fix: Cannot find name 'HTMLTextAreaElement'.
  const textareaRef = useRef<any>(null);
  // Fix: Cannot find name 'HTMLVideoElement'.
  const videoRef = useRef<any>(null);
  // Fix: Cannot find name 'HTMLInputElement'.
  const uploadInputRef = useRef<any>(null);

  const isApproved = scene.status === SceneStatus.APPROVED;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // Fix: Property 'style' does not exist on type 'HTMLTextAreaElement'.
      (textareaRef.current as any).style.height = 'auto';
      // Fix: Property 'style', 'scrollHeight' do not exist on type 'HTMLTextAreaElement'.
      (textareaRef.current as any).style.height = `${(textareaRef.current as any).scrollHeight}px`;
    }
  }, [prompt, isEditing]);

   useEffect(() => {
    const video = videoRef.current;
    if (!video || !scene.duration) return;
    
    if (isActive && isPlaying) {
      // This is the core logic for synchronized looping
      const relativeTime = (masterCurrentTime - scene.timestamp) % scene.duration;
      
      // Seek only if the difference is significant to prevent stuttering from minor updates
      // Fix: Property 'currentTime' does not exist on type 'HTMLVideoElement'.
      if (Math.abs((video as any).currentTime - relativeTime) > 0.2) {
        // Fix: Property 'currentTime' does not exist on type 'HTMLVideoElement'.
        (video as any).currentTime = relativeTime;
      }
      // Fix: Property 'paused' does not exist on type 'HTMLVideoElement'.
      if ((video as any).paused) {
        // Fix: Property 'play' does not exist on type 'HTMLVideoElement'.
        (video as any).play().catch(e => console.error("Video play failed:", e));
      }
    } else {
      // Fix: Property 'paused' does not exist on type 'HTMLVideoElement'.
      if (!(video as any).paused) {
        // Fix: Property 'pause' does not exist on type 'HTMLVideoElement'.
        (video as any).pause();
      }
    }
  }, [isActive, isPlaying, masterCurrentTime, scene.timestamp, scene.duration]);

  const handleSave = () => {
    onUpdate(scene.id, {
      prompt: prompt,
    });
    setIsEditing(false);
  };

  const handleApprove = () => {
    onUpdate(scene.id, {status: SceneStatus.APPROVED});
  }

  const handleUnapprove = () => {
    onUpdate(scene.id, { status: SceneStatus.GENERATED });
  }

  const handleDownload = () => {
    if (!scene.videoUrl || !scene.videoBlob) return;
    const a = (window as any).document.createElement('a');
    a.href = scene.videoUrl;
    a.download = `DreamDirector_Scene_${sceneNumber}.mp4`;
    (window as any).document.body.appendChild(a);
    a.click();
    (window as any).document.body.removeChild(a);
  };

  // Fix: Cannot find name 'HTMLInputElement'.
  const handleUpload = async (e: React.ChangeEvent<any>) => {
    // Fix: Property 'files' does not exist on type 'EventTarget & HTMLInputElement'.
    const file = (e.target as any).files?.[0];
    if (!file) return;

    // Armazenar arquivo e mostrar modal para pedir duração
    setUploadingFile(file);
    setUploadDuration(scene.intendedDuration ?? 35); // Usar duração planejada ou padrão
    setShowUploadDurationModal(true);
  };

  const handleConfirmUpload = async () => {
    if (!uploadingFile) return;

    onUpdate(scene.id, {status: SceneStatus.GENERATING}); // Show a loading state

    try {
      const videoBlob = new Blob([uploadingFile], {type: uploadingFile.type});
      const objectUrl = URL.createObjectURL(videoBlob);
      const actualDuration = await getVideoDuration(objectUrl);

      console.log(`[Upload] Vídeo upload: duração real=${actualDuration.toFixed(2)}s, duração desejada=${uploadDuration}s`);

      onUpdate(scene.id, {
        status: SceneStatus.GENERATED,
        videoUrl: objectUrl,
        videoBlob: videoBlob,
        duration: actualDuration,
        intendedDuration: uploadDuration, // ✅ Armazenar duração desejada
        errorMessage: undefined,
        errorType: undefined,
        isUploaded: true,
        videoObject: undefined, // ensure no stale videoObject
      });
      setIsEditing(false); // Exit editing mode on successful upload
      setShowUploadDurationModal(false);
      setUploadingFile(null);
    } catch (error) {
      console.error('Video upload failed:', error);
      onUpdate(scene.id, {
        status: SceneStatus.ERROR,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Failed to process uploaded video.',
      });
    }

    if (uploadInputRef.current) {
      // Fix: Property 'value' does not exist on type 'HTMLInputElement'.
      (uploadInputRef.current as any).value = '';
    }
  };

  const durationLabel = scene.intendedDuration ? ` / ${formatSeconds(scene.intendedDuration)}` : '';
  const isLooping = scene.intendedDuration && scene.duration && scene.intendedDuration > scene.duration + 0.1;

  return (
    <div className={`bg-gray-800/60 rounded-xl border ${isApproved ? 'border-green-500/50' : 'border-gray-700'} shadow-lg transition-all flex flex-col`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white">Cena {sceneNumber}</h3>
          <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700 rounded-md px-2 py-1" title={`Começa em ${formatSeconds(scene.timestamp)}`}>
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-sm text-gray-300">{formatSeconds(scene.timestamp)}</span>
          </div>
        </div>
         {isEditing ? (
          <textarea
            ref={textareaRef}
            value={prompt}
            // Fix: Cannot find name 'HTMLTextAreaElement'.
            // Fix: Property 'value' does not exist on type 'EventTarget & HTMLTextAreaElement'.
            onChange={(e: React.ChangeEvent<any>) =>
              setPrompt((e.target as any).value)
            }
            placeholder="Descreva esta cena... ex: 'CENA 1 (0:00 – 0:35) - Uma cantora aparece...'"
            className="w-full bg-gray-700/50 p-2 rounded-md resize-none text-gray-200 placeholder-gray-500 max-h-40"
            rows={3}
          />
        ) : (
          <p className="text-gray-300 min-h-[40px] text-sm line-clamp-3">{scene.prompt}</p>
        )}
      </div>

      {!isEditing && scene.status !== SceneStatus.DRAFT && (
        <div className="bg-black/30 aspect-video flex items-center justify-center overflow-hidden relative">
          {scene.status === SceneStatus.GENERATING && <LoadingIndicator />}
          {scene.videoUrl && (
            <>
              <video 
                ref={videoRef}
                src={scene.videoUrl} 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => onSeekToScene?.(scene.id)}
                title="Clique para reproduzir esta cena"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-mono flex items-center gap-1.5">
                {formatSeconds(scene.duration ?? 0)}{durationLabel}
                {isLooping && <span title="Este clipe está em loop para preencher a duração pretendida"><LoopIcon className="w-3 h-3" /></span>}
              </div>
              <button
                onClick={handleDownload}
                className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                title="Baixar vídeo">
                <DownloadIcon className="w-4 h-4" />
              </button>
            </>
          )}
          {scene.status === SceneStatus.ERROR && (
            <div className="p-4 text-center">
              <p className="text-red-400 font-semibold mb-2">Falha na Geração</p>
              {scene.errorType === 'QUOTA_EXCEEDED' ? (
                  <p className="text-red-400/80 text-xs">
                      Você excedeu sua cota de API. Verifique seu plano e detalhes de faturamento.
                      <a 
                          href="https://ai.google.dev/gemini-api/docs/rate-limits?hl=pt-br" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline hover:text-red-300 ml-1"
                      >
                          Saiba mais.
                      </a>
                  </p>
              ) : (
                  <p className="text-red-400/80 text-xs">{scene.errorMessage}</p>
              )}
            </div>
          )}
          {isApproved && (
            <div className="absolute top-2 right-2 bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full border border-green-500 flex items-center gap-1">
              <ApproveIcon className="w-3 h-3"/> Aprovado
            </div>
          )}
        </div>
      )}

      <div className="p-3 bg-gray-900/30 rounded-b-xl flex items-center justify-between gap-2 mt-auto">
        <div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" title="Editar Cena"><EditIcon className="w-4 h-4"/></button>
          )}
          <button onClick={() => onDelete(scene.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full" title="Excluir Cena"><DeleteIcon className="w-4 h-4"/></button>
        </div>
        <div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={uploadInputRef}
              onChange={handleUpload}
              className="hidden"
              accept="video/*"
            />
            <button
              // Fix: Property 'click' does not exist on type 'HTMLInputElement'.
              onClick={() => (uploadInputRef.current as any)?.click()}
              className="px-4 py-1.5 bg-gray-600 rounded-md text-sm font-semibold hover:bg-gray-700 flex items-center gap-2">
              <UploadIcon className="w-4 h-4"/>
              Enviar
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 bg-indigo-600 rounded-md text-sm font-semibold hover:bg-indigo-700">Salvar Prompt</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {(scene.status === SceneStatus.GENERATED || scene.status === SceneStatus.ERROR) && (
              <button onClick={() => onGenerate(scene.id)} className="px-4 py-1.5 bg-gray-600 rounded-md text-sm font-semibold hover:bg-gray-700 flex items-center gap-2"><ArrowPathIcon className="w-4 h-4"/>Gerar Novamente</button>
            )}
            {scene.status === SceneStatus.GENERATED && (
              <button onClick={handleApprove} className="px-4 py-1.5 bg-green-600 rounded-md text-sm font-semibold hover:bg-green-700 flex items-center gap-2"><ApproveIcon className="w-4 h-4"/>Aprovar</button>
            )}
             {isApproved && (
                <button onClick={handleUnapprove} className="px-4 py-1.5 bg-yellow-600 rounded-md text-sm font-semibold hover:bg-yellow-700">Desaprovar</button>
             )}
            {scene.status === SceneStatus.DRAFT && (
               <button onClick={() => onGenerate(scene.id)} className="px-4 py-1.5 bg-indigo-600 rounded-md text-sm font-semibold hover:bg-indigo-700">Gerar</button>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Modal para selecionar duração desejada ao fazer upload */}
      {showUploadDurationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">⏱️ Duração do Loop</h3>
            <p className="text-gray-300 mb-4">
              O vídeo será repetido (loop) até alcançar a duração definida abaixo.
            </p>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Duração Desejada (segundos)
              </label>
              <input
                type="number"
                value={uploadDuration}
                onChange={(e) => setUploadDuration(Math.max(1, parseFloat(e.target.value) || 1))}
                min="1"
                max="300"
                step="1"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Mínimo: 1s | Máximo: 300s (5 min)
              </p>
            </div>

            <div className="mb-4 p-3 bg-indigo-900/30 border border-indigo-600/50 rounded-lg">
              <p className="text-sm text-indigo-300">
                💡 Exemplo: Se o vídeo tem 8s e você quer 35s, ele fará loop ~4 vezes.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadDurationModal(false);
                  setUploadingFile(null);
                  setUploadDuration(35);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUpload}
                className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneCard;