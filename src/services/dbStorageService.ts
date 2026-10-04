// Chanakya University UniSphere — Unified Database & Media Storage Service
// Seamlessly operates in Local Database mode with instant localStorage/IndexedDB persistence,
// and automatically connects to Firebase Firestore & Firebase Cloud Storage when configured.

import { firebaseConfigManager, FirebaseConfig } from './firebaseConfig';

export interface StorageUploadResult {
  url: string;
  storageType: 'LOCAL' | 'FIREBASE';
  path: string;
  sizeBytes?: number;
}

class DbStorageService {
  private localPrefix = 'cu_db_';

  // Helper: Read from LocalStorage database
  private getLocalCollection<T>(collectionName: string): Record<string, T> {
    try {
      const raw = localStorage.getItem(`${this.localPrefix}${collectionName}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  // Helper: Save to LocalStorage database
  private saveLocalCollection<T>(collectionName: string, items: Record<string, T>): void {
    try {
      localStorage.setItem(`${this.localPrefix}${collectionName}`, JSON.stringify(items));
    } catch (e) {
      console.error(`Failed saving local collection ${collectionName}:`, e);
    }
  }

  /**
   * Upsert a document record into a collection
   */
  public async saveRecord<T extends Record<string, any>>(
    collectionName: string,
    id: string,
    data: T
  ): Promise<void> {
    // 1. Always save locally first for instant offline responsiveness
    const local = this.getLocalCollection<T>(collectionName);
    local[id] = { ...data, updatedAt: new Date().toISOString() };
    this.saveLocalCollection(collectionName, local);

    // 2. If Firebase is configured, sync to Firestore REST API
    const config = firebaseConfigManager.getConfig();
    if (config && firebaseConfigManager.isConfigured()) {
      try {
        const fields: Record<string, any> = {};
        for (const [key, val] of Object.entries(data)) {
          if (typeof val === 'string') fields[key] = { stringValue: val };
          else if (typeof val === 'number') fields[key] = { doubleValue: val };
          else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
          else if (Array.isArray(val)) fields[key] = { stringValue: JSON.stringify(val) };
          else if (val && typeof val === 'object') fields[key] = { stringValue: JSON.stringify(val) };
        }

        const endpoint = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${collectionName}/${id}?key=${config.apiKey}`;
        await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields })
        });
      } catch (err) {
        console.warn(`Background Firestore sync failed for ${collectionName}/${id}:`, err);
      }
    }
  }

  /**
   * Retrieve a document record by ID
   */
  public async getRecord<T>(collectionName: string, id: string): Promise<T | null> {
    const local = this.getLocalCollection<T>(collectionName);
    return local[id] || null;
  }

  /**
   * List all records in a collection
   */
  public async listRecords<T>(collectionName: string): Promise<T[]> {
    const local = this.getLocalCollection<T>(collectionName);
    return Object.values(local);
  }

  /**
   * Delete a record by ID
   */
  public async deleteRecord(collectionName: string, id: string): Promise<void> {
    const local = this.getLocalCollection(collectionName);
    delete local[id];
    this.saveLocalCollection(collectionName, local);

    const config = firebaseConfigManager.getConfig();
    if (config && firebaseConfigManager.isConfigured()) {
      try {
        const endpoint = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${collectionName}/${id}?key=${config.apiKey}`;
        await fetch(endpoint, { method: 'DELETE' });
      } catch (err) {
        console.warn(`Background Firestore delete failed for ${collectionName}/${id}:`, err);
      }
    }
  }

  /**
   * Upload an image or media asset
   * - In Local Mode: returns dataURL or object URL stored in browser memory/storage
   * - In Firebase Mode: uploads to Firebase Cloud Storage bucket and returns permanent HTTPS download URL
   */
  public async uploadMedia(
    fileOrBase64: File | string,
    destinationPath: string
  ): Promise<StorageUploadResult> {
    const config = firebaseConfigManager.getConfig();

    // Check if Firebase Cloud Storage is active
    if (config && config.storageBucket && firebaseConfigManager.isConfigured()) {
      try {
        let blob: Blob;
        let contentType = 'image/jpeg';

        if (typeof fileOrBase64 === 'string') {
          // Parse data URL
          const parts = fileOrBase64.split(';base64,');
          if (parts.length === 2) {
            contentType = parts[0].replace('data:', '');
            const binary = atob(parts[1]);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
            blob = new Blob([array], { type: contentType });
          } else {
            blob = new Blob([fileOrBase64], { type: 'text/plain' });
          }
        } else {
          blob = fileOrBase64;
          contentType = fileOrBase64.type || 'image/jpeg';
        }

        const encodedPath = encodeURIComponent(destinationPath);
        const endpoint = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o?name=${encodedPath}`;

        const uploadRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': contentType },
          body: blob
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          // Construct Firebase Storage Public Download URL
          const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${encodedPath}?alt=media&token=${data.downloadTokens || ''}`;
          return {
            url: downloadUrl,
            storageType: 'FIREBASE',
            path: destinationPath,
            sizeBytes: blob.size
          };
        }
      } catch (e) {
        console.warn('Firebase Storage upload failed, falling back to local storage URL:', e);
      }
    }

    // Fallback: Local database storage mode
    if (typeof fileOrBase64 === 'string') {
      return {
        url: fileOrBase64,
        storageType: 'LOCAL',
        path: destinationPath
      };
    } else {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });

      return {
        url: dataUrl,
        storageType: 'LOCAL',
        path: destinationPath,
        sizeBytes: fileOrBase64.size
      };
    }
  }
}

export const dbStorageService = new DbStorageService();
export default dbStorageService;
