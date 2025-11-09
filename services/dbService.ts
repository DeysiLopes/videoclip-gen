/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { ProjectConfig, Scene } from '../types';

const DB_NAME = 'dreamdirectorDB';
const DB_VERSION = 1;
const SCENES_STORE = 'scenes';
const CONFIG_STORE = 'projectConfig';
const CONFIG_KEY = 'current';

let db: IDBDatabase;

const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(SCENES_STORE)) {
        dbInstance.createObjectStore(SCENES_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(CONFIG_STORE)) {
        dbInstance.createObjectStore(CONFIG_STORE);
      }
    };
  });
};

const saveScene = (scene: Scene): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction([SCENES_STORE], 'readwrite');
    const store = transaction.objectStore(SCENES_STORE);
    const request = store.put(scene);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getScenes = (): Promise<Scene[]> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction([SCENES_STORE], 'readonly');
    const store = transaction.objectStore(SCENES_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteScene = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction([SCENES_STORE], 'readwrite');
        const store = transaction.objectStore(SCENES_STORE);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const clearScenes = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction([SCENES_STORE], 'readwrite');
        const store = transaction.objectStore(SCENES_STORE);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};


const saveProjectConfig = (config: ProjectConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction([CONFIG_STORE], 'readwrite');
        const store = transaction.objectStore(CONFIG_STORE);
        const configToStore = { ...config, audioUrl: null };
        const request = store.put(configToStore, CONFIG_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getProjectConfig = (): Promise<ProjectConfig | null> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction([CONFIG_STORE], 'readonly');
        const store = transaction.objectStore(CONFIG_STORE);
        const request = store.get(CONFIG_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};


export const dbService = {
  initDB,
  saveScene,
  getScenes,
  deleteScene,
  clearScenes,
  saveProjectConfig,
  getProjectConfig,
};
