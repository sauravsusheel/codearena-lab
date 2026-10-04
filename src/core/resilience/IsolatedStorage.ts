// UniSphere Resilience Tier: Isolated Namespaced Storage
// Ensures module state, caches, or quotas in one module can never corrupt another module or core session.

export class IsolatedStorage {
  private prefix: string;

  constructor(moduleId: string) {
    this.prefix = `cu_mod_${moduleId}_`;
  }

  public setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${this.prefix}${key}`, serialized);
      return true;
    } catch (err: any) {
      console.warn(`[IsolatedStorage] Failed to write key ${key} for module:`, err);
      return false;
    }
  }

  public getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      if (item === null) return fallback;
      return JSON.parse(item) as T;
    } catch (err: any) {
      console.warn(`[IsolatedStorage] Failed to read/parse key ${key}. Returning fallback.`, err);
      return fallback;
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (err) {
      // ignore
    }
  }

  public clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (err) {
      // ignore
    }
  }
}
