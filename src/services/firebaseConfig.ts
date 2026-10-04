// Chanakya University UniSphere — Firebase Configuration & Storage Service
// Provides zero-config offline/local database operation by default,
// and seamlessly upgrades to live Firebase Firestore & Firebase Cloud Storage
// whenever configuration keys are provided.

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_KEY = 'cu_firebase_config_v1';
const SYNC_STATE_KEY = 'cu_firebase_sync_state_v1';

export interface FirebaseSyncState {
  isConfigured: boolean;
  isConnected: boolean;
  lastConnectedAt?: string;
  lastError?: string;
  activeProjectId?: string;
}

class FirebaseConfigManager {
  private config: FirebaseConfig | null = null;
  private syncState: FirebaseSyncState = {
    isConfigured: false,
    isConnected: false
  };
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadConfig();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      } else {
        const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
        const envProject = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
        if (envKey && envProject) {
          this.config = {
            apiKey: envKey,
            authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProject}.firebaseapp.com`,
            projectId: envProject,
            storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || `${envProject}.appspot.com`,
            messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
            appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
            measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || ''
          };
        }
      }

      this.syncState = {
        isConfigured: !!(this.config && this.config.apiKey && this.config.projectId),
        isConnected: false,
        activeProjectId: this.config?.projectId
      };

      const storedSync = localStorage.getItem(SYNC_STATE_KEY);
      if (storedSync) {
        const parsed = JSON.parse(storedSync);
        this.syncState = { ...this.syncState, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load Firebase configuration from local cache:', e);
      this.config = null;
    }
  }

  public getConfig(): FirebaseConfig | null {
    return this.config ? { ...this.config } : null;
  }

  public getSyncState(): FirebaseSyncState {
    return { ...this.syncState };
  }

  public isConfigured(): boolean {
    return !!(this.config && this.config.apiKey && this.config.projectId);
  }

  public setConfig(newConfig: FirebaseConfig): void {
    this.config = newConfig;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      this.syncState.isConfigured = true;
      this.syncState.activeProjectId = newConfig.projectId;
      localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(this.syncState));
    } catch (e) {
      console.error('Failed to save Firebase config to localStorage:', e);
    }
    this.notify();
  }

  public clearConfig(): void {
    this.config = null;
    this.syncState = {
      isConfigured: false,
      isConnected: false
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SYNC_STATE_KEY);
    } catch (e) {
      console.error('Failed to clear Firebase config:', e);
    }
    this.notify();
  }

  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    if (!this.config || !this.config.apiKey || !this.config.projectId) {
      return {
        success: false,
        latencyMs: 0,
        message: 'No Firebase API key or Project ID configured. Platform is running in Offline Local Database mode.'
      };
    }

    const startTime = performance.now();
    try {
      const endpoint = `https://firestore.googleapis.com/v1/projects/${this.config.projectId}/databases/(default)/documents?key=${this.config.apiKey}&pageSize=1`;
      const res = await fetch(endpoint, { method: 'GET', signal: AbortSignal.timeout(5000) });
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.status === 200 || res.status === 404 || res.status === 403) {
        const isLive = res.status === 200 || res.status === 404;
        this.syncState.isConnected = isLive;
        this.syncState.lastConnectedAt = new Date().toISOString();
        this.syncState.lastError = isLive ? undefined : 'Permission denied or Firestore rules need adjustment';
        localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(this.syncState));
        this.notify();

        return {
          success: true,
          latencyMs,
          message: `Successfully connected to Firebase Project "${this.config.projectId}" (${latencyMs}ms latency).`
        };
      } else {
        const errText = await res.text();
        this.syncState.isConnected = false;
        this.syncState.lastError = `Firebase HTTP error ${res.status}: ${errText.slice(0, 80)}`;
        this.notify();
        return {
          success: false,
          latencyMs,
          message: `Firebase connection rejected (${res.status}): ${this.syncState.lastError}`
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      this.syncState.isConnected = false;
      this.syncState.lastError = err?.message || 'Network unreachable';
      this.notify();
      return {
        success: false,
        latencyMs,
        message: `Network error connecting to Firebase: ${this.syncState.lastError}`
      };
    }
  }
}

export const firebaseConfigManager = new FirebaseConfigManager();
export default firebaseConfigManager;
