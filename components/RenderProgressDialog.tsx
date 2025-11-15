/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

interface RenderProgressDialogProps {
    message: string;
    progress: number;
    currentPhase?: 'encoding' | 'concatenating' | 'finalizing' | 'unknown';
}

const RenderProgressDialog: React.FC<RenderProgressDialogProps> = ({
    message,
    progress,
    currentPhase = 'unknown'
}) => {
    const [startTime] = useState(Date.now());
    const [estimatedTime, setEstimatedTime] = useState<string>('Calculando...');
    const [elapsedTime, setElapsedTime] = useState<string>('0s');

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            if (elapsed < 60) {
                setElapsedTime(`${elapsed}s`);
            } else {
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                setElapsedTime(`${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    useEffect(() => {
        if (progress > 0 && progress < 100) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = progress / elapsed;
            const remaining = (100 - progress) / rate;

            if (remaining > 60) {
                const minutes = Math.ceil(remaining / 60);
                setEstimatedTime(`~${minutes} minuto${minutes > 1 ? 's' : ''}`);
            } else {
                const seconds = Math.ceil(remaining);
                setEstimatedTime(`~${seconds}s`);
            }
        } else if (progress === 0) {
            setEstimatedTime('Processando...');
        }
    }, [progress, startTime]);

    const barColor = progress < 20 ? 'bg-yellow-500' : progress < 50 ? 'bg-blue-500' : 'bg-indigo-600';

    // Mapear fases com descrições detalhadas
    const phaseInfo = {
        encoding: {
            icon: '🎬',
            title: 'Codificando Vídeos + Áudio',
            description: 'VP9 está encodando os 5 vídeos + áudio. Etapa mais demorada.',
            details: [
                '• Cada vídeo é processado individualmente',
                '• Áudio sendo sincronizado',
                '• Isso pode levar 10-15 minutos em WASM'
            ],
            bgColor: 'bg-orange-900/20',
            borderColor: 'border-orange-600/50',
            textColor: 'text-orange-300'
        },
        concatenating: {
            icon: '🔗',
            title: 'Concatenando Streams',
            description: 'Os vídeos codificados estão sendo unidos.',
            details: [
                '• Vídeos sendo fusionados',
                '• Áudio sincronizado',
                '• Etapa intermediária do processo'
            ],
            bgColor: 'bg-blue-900/20',
            borderColor: 'border-blue-600/50',
            textColor: 'text-blue-300'
        },
        finalizing: {
            icon: '✅',
            title: 'Finalizando Renderização',
            description: 'Último passo: muxando o arquivo MP4 final.',
            details: [
                '• Compactando arquivo final',
                '• Otimizando para reprodução',
                '• Falta pouco!'
            ],
            bgColor: 'bg-green-900/20',
            borderColor: 'border-green-600/50',
            textColor: 'text-green-300'
        },
        unknown: {
            icon: '⏳',
            title: 'Processando Vídeos',
            description: 'FFmpeg está trabalhando em background.',
            details: [
                '• Encoding individual de cada vídeo',
                '• Sincronização de áudio',
                '• Callbacks de progresso inativos (é normal)'
            ],
            bgColor: 'bg-gray-700/50',
            borderColor: 'border-gray-600/50',
            textColor: 'text-gray-300'
        }
    };

    const current = phaseInfo[currentPhase];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center flex flex-col items-center">
                <h2 className="text-3xl font-bold text-white mb-2">Renderizando Vídeo Final</h2>
                <p className="text-gray-400 text-sm mb-6">{message}</p>

                {/* CARD DE FASE ATUAL */}
                <div className={`w-full p-4 rounded-lg mb-6 border-l-4 border-l-orange-500 ${current.bgColor} border ${current.borderColor}`}>
                    <p className="text-xl font-bold mb-2">
                        <span className="text-2xl mr-2">{current.icon}</span>
                        {current.title}
                    </p>
                    <p className={`text-sm mb-3 ${current.textColor}`}>{current.description}</p>
                    <div className="text-xs text-gray-400 space-y-1">
                        {current.details.map((detail, idx) => (
                            <p key={idx}>{detail}</p>
                        ))}
                    </div>
                </div>

                {/* BARRA DE PROGRESSO */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                        className={`${barColor} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.max(progress, 2)}%` }}
                    ></div>
                </div>

                {/* MÉTRICAS */}
                <div className="flex gap-3 justify-center mb-6 w-full text-center">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">PROGRESSO</p>
                        <p className="text-2xl font-bold text-indigo-400">{progress}%</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">DECORRIDO</p>
                        <p className="text-2xl font-bold text-blue-400">{elapsedTime}</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">ESTIMADO</p>
                        <p className="text-2xl font-bold text-yellow-400">{estimatedTime}</p>
                    </div>
                </div>

                {/* AVISO: PROGRESSO 0% MAS PROCESSANDO (Encoding) */}
                {progress === 0 && currentPhase === 'encoding' && (
                    <div className="text-xs text-orange-300 mt-4 p-3 bg-orange-900/30 border border-orange-600/50 rounded-lg w-full">
                        <p className="font-semibold mb-2">🔄 Encoding em Background</p>
                        <p className="mb-2">
                            <strong>Não está parado!</strong> VP9 está encodando os vídeos individuais.
                            Esta é a etapa mais demorada do processo.
                        </p>
                        <p className="text-orange-400 font-bold">
                            ⏳ Pode levar 10-15 minutos. Progresso só aparecerá após os vídeos serem codificados.
                        </p>
                    </div>
                )}

                {/* AVISO: PROCESSANDO (genérico) */}
                {progress === 0 && currentPhase === 'unknown' && (
                    <div className="text-xs text-gray-300 mt-4 p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg w-full">
                        <p className="font-semibold mb-2">⏱️ Processamento Ativo</p>
                        <p className="mb-2">
                            FFmpeg está codificando <strong>5 vídeos + 1 áudio</strong> em paralelo.
                            Progresso: 0% é esperado nesta fase.
                        </p>
                        <p className="text-yellow-400 font-bold">
                            🎬 Aguarde 10-15 minutos...
                        </p>
                    </div>
                )}

                <p className="text-sm text-gray-400 mt-6 text-center">
                    ❌ <strong>NÃO FECHE</strong> esta aba ou atualize a página
                </p>
            </div>
        </div>
    );
};

export default RenderProgressDialog;
