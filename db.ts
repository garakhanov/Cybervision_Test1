
import { WazuhLog, AIAnalysisResult } from './types';

const DB_NAME = 'AI_SIEM_DB';
const DB_VERSION = 1;
const LOGS_STORE = 'logs';
const ANALYSIS_STORE = 'analysis';

export interface StoredAnalysis extends AIAnalysisResult {
  id: string; // matches log set hash or latest log id
  timestamp: string;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(LOGS_STORE)) {
        db.createObjectStore(LOGS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ANALYSIS_STORE)) {
        db.createObjectStore(ANALYSIS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveLogs = async (logs: WazuhLog[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(LOGS_STORE, 'readwrite');
  const store = tx.objectStore(LOGS_STORE);
  logs.forEach(log => store.put(log));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllLogs = async (): Promise<WazuhLog[]> => {
  const db = await initDB();
  const tx = db.transaction(LOGS_STORE, 'readonly');
  const store = tx.objectStore(LOGS_STORE);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
    request.onerror = () => reject(request.error);
  });
};

export const saveAnalysis = async (analysis: StoredAnalysis): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(ANALYSIS_STORE, 'readwrite');
  const store = tx.objectStore(ANALYSIS_STORE);
  store.put(analysis);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getLatestAnalysis = async (): Promise<StoredAnalysis | null> => {
  const db = await initDB();
  const tx = db.transaction(ANALYSIS_STORE, 'readonly');
  const store = tx.objectStore(ANALYSIS_STORE);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results = request.result;
      if (results.length === 0) resolve(null);
      resolve(results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]);
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearDatabase = async (): Promise<void> => {
  const db = await initDB();
  const txLogs = db.transaction(LOGS_STORE, 'readwrite');
  txLogs.objectStore(LOGS_STORE).clear();
  const txAnalysis = db.transaction(ANALYSIS_STORE, 'readwrite');
  txAnalysis.objectStore(ANALYSIS_STORE).clear();
};
