/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { ProjectConfig, Scene } from '../types';

const DB_NAME = 'dreamdirectorDB';
const DB_VERSION = 2; // Incrementado para nova estrutura
const SCENES_STORE = 'scenes';
const CONFIG_STORE = 'projectConfig';
const BLOBS_STORE = 'videoBlobs'; // Nova store separada para blobs
const CONFIG_KEY = 'current';

let db: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (db) {
    return Promise.resolve(db);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      dbPromise = null;
      reject(new Error('Error opening database: ' + request.error?.message));
    };

    request.onsuccess = () => {
      db = request.result;
      
      db.onclose = () => {
        console.warn('Database connection closed unexpectedly');
        db = null;
        dbPromise = null;
      };
      
      db.onerror = (event) => {
        console.error('Database error event:', event);
      };
      
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;
      
      // Criar store de cenas (SEM indexar o blob!)
      if (!dbInstance.objectStoreNames.contains(SCENES_STORE)) {
        const sceneStore = dbInstance.createObjectStore(SCENES_STORE, { keyPath: 'id' });
        // Indexar apenas campos pequenos e úteis para queries
        sceneStore.createIndex('timestamp', 'timestamp', { unique: false });
        sceneStore.createIndex('status', 'status', { unique: false });
      }
      
      // Store separada para blobs grandes (não indexada)
      if (!dbInstance.objectStoreNames.contains(BLOBS_STORE)) {
        dbInstance.createObjectStore(BLOBS_STORE, { keyPath: 'sceneId' });
      }
      
      if (!dbInstance.objectStoreNames.contains(CONFIG_STORE)) {
        dbInstance.createObjectStore(CONFIG_STORE);
      }
      
      // Migração: mover blobs existentes para nova store
      if (event.oldVersion < 2 && dbInstance.objectStoreNames.contains(SCENES_STORE)) {
        const sceneStore = transaction.objectStore(SCENES_STORE);
        const blobStore = transaction.objectStore(BLOBS_STORE);
        
        sceneStore.openCursor().onsuccess = (cursorEvent) => {
          const cursor = (cursorEvent.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const scene = cursor.value;
            if (scene.videoBlob) {
              // Salvar blob na store separada
              blobStore.put({ sceneId: scene.id, blob: scene.videoBlob });
              // Remover blob da cena
              delete scene.videoBlob;
              cursor.update(scene);
            }
            cursor.continue();
          }
        };
      }
    };
    
    request.onblocked = () => {
      console.warn('Database upgrade blocked. Close other tabs with this app open.');
      reject(new Error('Database upgrade blocked'));
    };
  });

  return dbPromise;
};

const validateBlob = (blob: Blob): boolean => {
  if (!blob || !(blob instanceof Blob)) {
    return false;
  }
  if (blob.size === 0) {
    console.warn('Blob is empty');
    return false;
  }
  if (blob.size > 100 * 1024 * 1024) { // 100MB limit
    console.warn('Blob exceeds 100MB limit:', blob.size);
    return false;
  }
  return true;
};

const saveScene = async (scene: Scene): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readwrite');
      
      transaction.onerror = () => {
        console.error('Transaction error:', transaction.error);
        reject(transaction.error || new Error('Transaction failed'));
      };
      
      transaction.onabort = () => {
        console.error('Transaction aborted');
        reject(new Error('Transaction aborted'));
      };
      
      const sceneStore = transaction.objectStore(SCENES_STORE);
      const blobStore = transaction.objectStore(BLOBS_STORE);
      
      // Separar blob do resto dos dados da cena
      const sceneData = { ...scene };
      const blobToSave = sceneData.videoBlob;
      delete sceneData.videoBlob;
      delete sceneData.videoUrl; // URLs não devem ser salvos
      
      // Salvar dados da cena (sem blob)
      const sceneRequest = sceneStore.put(sceneData);
      
      sceneRequest.onerror = () => {
        console.error('Error saving scene data:', sceneRequest.error);
        reject(sceneRequest.error || new Error('Failed to save scene'));
      };
      
      // Se houver blob, salvar separadamente
      if (blobToSave) {
        if (!validateBlob(blobToSave)) {
          console.error('Invalid blob for scene:', scene.id);
          reject(new Error('Invalid video blob'));
          return;
        }
        
        const blobRequest = blobStore.put({ sceneId: scene.id, blob: blobToSave });
        
        blobRequest.onerror = () => {
          console.error('Error saving blob:', blobRequest.error);
          
          // Verificar se é erro de quota
          if (blobRequest.error?.name === 'QuotaExceededError') {
            reject(new Error('Storage quota exceeded. Please free up space or delete old scenes.'));
          } else {
            reject(blobRequest.error || new Error('Failed to save video blob'));
          }
        };
      }
      
      transaction.oncomplete = () => {
        resolve();
      };
      
    } catch (error) {
      console.error('Error in saveScene:', error);
      reject(error);
    }
  });
};

const getScenes = async (): Promise<Scene[]> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readonly');
      
      transaction.onerror = () => {
        reject(transaction.error || new Error('Transaction failed'));
      };
      
      const sceneStore = transaction.objectStore(SCENES_STORE);
      const blobStore = transaction.objectStore(BLOBS_STORE);
      
      const sceneRequest = sceneStore.getAll();
      
      sceneRequest.onsuccess = () => {
        const scenes = sceneRequest.result;
        let processedCount = 0;
        
        if (scenes.length === 0) {
          resolve([]);
          return;
        }
        
        // Buscar blobs para cada cena
        scenes.forEach((scene) => {
          const blobRequest = blobStore.get(scene.id);
          
          blobRequest.onsuccess = () => {
            const blobData = blobRequest.result;
            if (blobData && blobData.blob) {
              scene.videoBlob = blobData.blob;
            }
            
            processedCount++;
            if (processedCount === scenes.length) {
              resolve(scenes);
            }
          };
          
          blobRequest.onerror = () => {
            console.warn('Failed to load blob for scene:', scene.id);
            processedCount++;
            if (processedCount === scenes.length) {
              resolve(scenes);
            }
          };
        });
      };
      
      sceneRequest.onerror = () => {
        reject(sceneRequest.error || new Error('Failed to load scenes'));
      };
      
    } catch (error) {
      console.error('Error in getScenes:', error);
      reject(error);
    }
  });
};

const deleteScene = async (id: string): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readwrite');
      
      transaction.onerror = () => {
        reject(transaction.error || new Error('Transaction failed'));
      };
      
      const sceneStore = transaction.objectStore(SCENES_STORE);
      const blobStore = transaction.objectStore(BLOBS_STORE);
      
      sceneStore.delete(id);
      blobStore.delete(id);
      
      transaction.oncomplete = () => {
        resolve();
      };
      
    } catch (error) {
      console.error('Error in deleteScene:', error);
      reject(error);
    }
  });
};

const clearScenes = async (): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readwrite');
      
      transaction.onerror = () => {
        reject(transaction.error || new Error('Transaction failed'));
      };
      
      transaction.objectStore(SCENES_STORE).clear();
      transaction.objectStore(BLOBS_STORE).clear();
      
      transaction.oncomplete = () => {
        resolve();
      };
      
    } catch (error) {
      console.error('Error in clearScenes:', error);
      reject(error);
    }
  });
};

const saveProjectConfig = async (config: ProjectConfig): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = currentDb.transaction([CONFIG_STORE], 'readwrite');
      
      transaction.onerror = () => {
        reject(transaction.error || new Error('Transaction failed'));
      };
      
      const store = transaction.objectStore(CONFIG_STORE);
      const configToStore = { ...config, audioUrl: null };
      
      const request = store.put(configToStore, CONFIG_KEY);
      
      request.onerror = () => {
        if (request.error?.name === 'QuotaExceededError') {
          reject(new Error('Storage quota exceeded. Please free up space.'));
        } else {
          reject(request.error || new Error('Failed to save config'));
        }
      };
      
      transaction.oncomplete = () => {
        resolve();
      };
      
    } catch (error) {
      console.error('Error in saveProjectConfig:', error);
      reject(error);
    }
  });
};

const getProjectConfig = async (): Promise<ProjectConfig | null> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = currentDb.transaction([CONFIG_STORE], 'readonly');
      
      transaction.onerror = () => {
        reject(transaction.error || new Error('Transaction failed'));
      };
      
      const store = transaction.objectStore(CONFIG_STORE);
      const request = store.get(CONFIG_KEY);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(request.error || new Error('Failed to load config'));
      };
      
    } catch (error) {
      console.error('Error in getProjectConfig:', error);
      reject(error);
    }
  });
};

// Verificar quota de armazenamento disponível
const checkStorageQuota = async (): Promise<{ usage: number; quota: number; available: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        };
    } catch (error) {
        console.warn("Could not estimate storage quota:", error);
        return { usage: 0, quota: 0, available: 0 };
    }
  }
  return { usage: 0, quota: 0, available: 0 };
};

export const dbService = {
  getDB,
  saveScene,
  getScenes,
  deleteScene,
  clearScenes,
  saveProjectConfig,
  getProjectConfig,
  checkStorageQuota,
};