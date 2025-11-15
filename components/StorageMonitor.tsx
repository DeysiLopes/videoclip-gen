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
    <div className="fixed bottom-4 right-4 bg-gray-800/95 border border-gray-700 rounded-lg p-3 shadow-xl z-50 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-300">Armazenamento</span>
        <span className="text-xs text-gray-400">{usageMB} / {quotaMB} MB</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            usagePercent > 90
              ? 'bg-red-500'
              : usagePercent > 70
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        ></div>
      </div>
      
      {showWarning && (
        <p className="text-xs text-yellow-400 mt-1">
          ⚠️ Pouco espaço disponível ({availableMB} MB). Considere deletar cenas antigas.
        </p>
      )}
    </div>
  );
};

export default StorageMonitor;