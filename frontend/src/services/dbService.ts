/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { ProjectConfig, Scene } from '../src/types';

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
      if (event.oldVersion < 2 && transaction.objectStoreNames.contains(SCENES_STORE)) {
        console.log('Migrating database from v1 to v2...');
        const sceneStore = transaction.objectStore(SCENES_STORE);
        
        // This can only be created within the upgrade transaction
        const blobStore = dbInstance.objectStoreNames.contains(BLOBS_STORE) 
            ? transaction.objectStore(BLOBS_STORE)
            : dbInstance.createObjectStore(BLOBS_STORE, { keyPath: 'sceneId' });
        
        sceneStore.openCursor().onsuccess = (cursorEvent) => {
          const cursor = (cursorEvent.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const scene = cursor.value;
            if (scene.videoBlob && scene.videoBlob instanceof Blob) {
              console.log(`Migrating blob for scene ${scene.id}`);
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
    console.warn('Invalid blob provided:', blob);
    return false;
  }
  if (blob.size === 0) {
    console.warn('Blob is empty');
    return false;
  }
  // Increased limit to 200MB to be safe
  if (blob.size > 200 * 1024 * 1024) { 
    console.warn('Blob exceeds 200MB limit:', blob.size);
    return false;
  }
  return true;
};

const saveScene = async (scene: Scene): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
      const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readwrite');
      
      transaction.oncomplete = () => {
        resolve();
      };
      
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
      
      const sceneData = { ...scene };
      const blobToSave = sceneData.videoBlob;
      delete sceneData.videoBlob;
      delete sceneData.videoUrl; 
      
      sceneStore.put(sceneData);
      
      if (blobToSave) {
        if (!validateBlob(blobToSave)) {
          transaction.abort();
          reject(new Error('Invalid video blob for scene ' + scene.id));
          return;
        }
        
        const blobRequest = blobStore.put({ sceneId: scene.id, blob: blobToSave });
        
        blobRequest.onerror = () => {
          if (blobRequest.error?.name === 'QuotaExceededError') {
            reject(new Error('Storage quota exceeded. Please free up space or delete old scenes.'));
          } else {
            reject(blobRequest.error || new Error('Failed to save video blob'));
          }
        };
      }
  });
};

const getScenes = async (): Promise<Scene[]> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
      const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readonly');
      const sceneStore = transaction.objectStore(SCENES_STORE);
      const blobStore = transaction.objectStore(BLOBS_STORE);
      
      const sceneRequest = sceneStore.getAll();
      
      sceneRequest.onerror = () => reject(sceneRequest.error);
      
      sceneRequest.onsuccess = () => {
        const scenes: Scene[] = sceneRequest.result;
        if (scenes.length === 0) {
          resolve([]);
          return;
        }
        
        const promises = scenes.map(scene => 
          new Promise<Scene>((res, rej) => {
            const blobRequest = blobStore.get(scene.id);
            blobRequest.onerror = () => {
              console.warn('Failed to load blob for scene:', scene.id);
              res(scene); // Resolve scene without blob on error
            };
            blobRequest.onsuccess = () => {
              if (blobRequest.result?.blob) {
                scene.videoBlob = blobRequest.result.blob;
              }
              res(scene);
            };
          })
        );
        
        Promise.all(promises).then(resolve).catch(reject);
      };
  });
};

const deleteScene = async (id: string): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    
    transaction.objectStore(SCENES_STORE).delete(id);
    transaction.objectStore(BLOBS_STORE).delete(id);
  });
};

const clearScenes = async (): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction([SCENES_STORE, BLOBS_STORE], 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
      
    transaction.objectStore(SCENES_STORE).clear();
    transaction.objectStore(BLOBS_STORE).clear();
  });
};

const saveProjectConfig = async (config: ProjectConfig): Promise<void> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction([CONFIG_STORE], 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);

    const store = transaction.objectStore(CONFIG_STORE);
    // Never store blob URLs in the database.
    const configToStore = { ...config, audioUrl: null };
    
    const request = store.put(configToStore, CONFIG_KEY);
    request.onerror = () => {
      if (request.error?.name === 'QuotaExceededError') {
        reject(new Error('Storage quota exceeded. Please free up space.'));
      } else {
        reject(request.error || new Error('Failed to save config'));
      }
    };
  });
};

const getProjectConfig = async (): Promise<ProjectConfig | null> => {
  const currentDb = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction([CONFIG_STORE], 'readonly');
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.get(CONFIG_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

const checkStorageQuota = async (): Promise<{ usage: number; quota: number; available: number }> => {
  if (navigator.storage && navigator.storage.estimate) {
    try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage ?? 0,
          quota: estimate.quota ?? 0,
          available: (estimate.quota ?? 0) - (estimate.usage ?? 0)
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
  validateBlob,
};
