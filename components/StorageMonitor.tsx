/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';

const StorageMonitor: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<{
    usage: number;
    quota: number;
    available: number;
  } | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const info = await dbService.checkStorageQuota();
        setStorageInfo(info);
        
        // Mostrar aviso se menos de 100MB disponível
        if (info.available > 0 && info.available < 100 * 1024 * 1024) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('Failed to check storage:', error);
      }
    };

    checkStorage();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkStorage, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!storageInfo || storageInfo.quota === 0) {
    return null;
  }

  const usagePercent = (storageInfo.usage / storageInfo.quota) * 100;
  const usageMB = (storageInfo.usage / (1024 * 1024)).toFixed(1);
  const quotaMB = (storageInfo.quota / (1024 * 1024)).toFixed(0);
  const availableMB = (storageInfo.available / (1024 * 1024)).toFixed(0);

  return (
    <div className="fixed bottom-6 right-6 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 shadow-2xl z-50 max-w-xs transition-all hover:shadow-indigo-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-sm font-bold text-white">Armazenamento</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">{usageMB} / {quotaMB} MB</span>
      </div>
      
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden mb-2 shadow-inner">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            usagePercent > 90
              ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50'
              : usagePercent > 70
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50'
              : 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/50'
          }`}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        ></div>
      </div>
      
      {showWarning && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>Pouco espaço disponível ({availableMB} MB). Considere deletar cenas antigas.</span>
          </p>
        </div>
      )}

      {!showWarning && (
        <p className="text-xs text-gray-500 text-center mt-2">
          {availableMB} MB disponíveis
        </p>
      )}
    </div>
  );
};

export default StorageMonitor;