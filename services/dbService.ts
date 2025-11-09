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
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      db.onclose = () => {
        db = null;
        dbPromise = null;
      };
      resolve(db);
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

  return dbPromise;
};


const saveScene = async (scene: Scene): Promise<void> => {
  const currentDb = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction([SCENES_STORE], 'readwrite');
    const store = transaction.objectStore(SCENES_STORE);
    const request = store.put(scene);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getScenes = async (): Promise<Scene[]> => {
  const currentDb = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = currentDb.transaction([SCENES_STORE], 'readonly');
    const store = transaction.objectStore(SCENES_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteScene = async (id: string): Promise<void> => {
    const currentDb = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = currentDb.transaction([SCENES_STORE], 'readwrite');
        const store = transaction.objectStore(SCENES_STORE);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const clearScenes = async (): Promise<void> => {
    const currentDb = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = currentDb.transaction([SCENES_STORE], 'readwrite');
        const store = transaction.objectStore(SCENES_STORE);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};


const saveProjectConfig = async (config: ProjectConfig): Promise<void> => {
    const currentDb = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = currentDb.transaction([CONFIG_STORE], 'readwrite');
        const store = transaction.objectStore(CONFIG_STORE);
        const configToStore = { ...config, audioUrl: null };
        const request = store.put(configToStore, CONFIG_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getProjectConfig = async (): Promise<ProjectConfig | null> => {
    const currentDb = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = currentDb.transaction([CONFIG_STORE], 'readonly');
        const store = transaction.objectStore(CONFIG_STORE);
        const request = store.get(CONFIG_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};


export const dbService = {
  getDB,
  saveScene,
  getScenes,
  deleteScene,
  clearScenes,
  saveProjectConfig,
  getProjectConfig,
};