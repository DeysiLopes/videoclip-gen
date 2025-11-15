/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface RenderProgressDialogProps {
    message: string;
    progress: number;
}

const RenderProgressDialog: React.FC<RenderProgressDialogProps> = ({ message, progress }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center flex flex-col items-center">
                <h2 className="text-3xl font-bold text-white mb-4">Renderizando Vídeo Final</h2>
                <p className="text-gray-300 mb-6 min-h-[40px]">
                    {message}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-150"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-400">Por favor, mantenha esta aba do navegador aberta.</p>
            </div>
        </div>
    );
};

export default RenderProgressDialog;
