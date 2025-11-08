/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { MusicIcon, XMarkIcon } from './icons';

interface AudioTrackManagerProps {
  onUpload: (file: File) => void;
  onRemove: () => void;
  audioFile: File | null;
  audioUrl: string | null;
}

const AudioTrackManager: React.FC<AudioTrackManagerProps> = ({
  onUpload,
  onRemove,
  audioFile,
  audioUrl,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
     if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (audioUrl && audioFile) {
    return (
      <div className="mb-4 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-grow min-w-0">
          <MusicIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate" title={audioFile.name}>
              {audioFile.name}
            </p>
            <audio src={audioUrl} controls className="w-full max-w-md h-8 mt-1" />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Remove audio track"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 w-full">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full p-4 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        <MusicIcon className="w-6 h-6 mr-3" />
        <span className="font-medium">Add Music Track (.mp3, .wav)</span>
      </button>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="audio/mpeg,audio/wav"
        className="hidden"
      />
    </div>
  );
};

export default AudioTrackManager;
