/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface LocalApiKeyDialogProps {
  onSave: (apiKey: string) => void;
}

const LocalApiKeyDialog: React.FC<LocalApiKeyDialogProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 flex flex-col items-center">
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Insira sua Chave de API Gemini</h2>
        <p className="text-gray-300 mb-6 text-center">
          Para gerar vídeos, esta aplicação requer uma chave de API do Google Gemini. Por favor, insira sua chave abaixo para começar.
        </p>
        <div className="w-full mb-6">
          <input
            type="password"
            value={apiKey}
            // Fix: Cannot find name 'HTMLInputElement'.
            // Fix: Property 'value' does not exist on type 'EventTarget & HTMLInputElement'.
            onChange={(e: React.ChangeEvent<any>) =>
              setApiKey((e.target as any).value)
            }
            placeholder="Insira sua Chave de API"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <p className="text-gray-400 mb-8 text-sm text-center">
          Você pode obter sua chave no{' '}
          <a
            href="https://ai.google.dev/gemini-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline font-medium"
          >
            Google AI Studio
          </a>
          . Sua chave é armazenada apenas no armazenamento local do seu navegador.
        </p>
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Salvar e Continuar
        </button>
      </div>
    </div>
  );
};

export default LocalApiKeyDialog;