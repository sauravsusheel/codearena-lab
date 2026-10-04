// UniSphere Resilience Tier: Client-Side Circuit Breaker Engine
// Prevents network failures or worker timeouts in any module from freezing the portal shell.

import { ModuleHealthRegistry } from './ModuleHealthRegistry';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions<T> {
  moduleId: string;
  operationName: string;
  failureThreshold?: number; // default: 3
  resetTimeoutMs?: number; // default: 10000ms
  fallbackSupplier: () => T;
}

export class CircuitBreaker<T> {
  private moduleId: string;
  private operationName: string;
  private failureThreshold: number;
  private resetTimeoutMs: number;
  private fallbackSupplier: () => T;

  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(options: CircuitBreakerOptions<T>) {
    this.moduleId = options.moduleId;
    this.operationName = options.operationName;
    this.failureThreshold = options.failureThreshold ?? 3;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 10000;
    this.fallbackSupplier = options.fallbackSupplier;
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  public async execute(action: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      console.warn(`[CircuitBreaker:OPEN] ${this.moduleId}::${this.operationName} failed fast. Serving fallback.`);
      ModuleHealthRegistry.recordDegraded(this.moduleId, `Circuit open for ${this.operationName}`);
      return this.fallbackSupplier();
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      return this.fallbackSupplier();
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
      ModuleHealthRegistry.recordRecovery(this.moduleId);
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(err: Error): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    console.error(`[CircuitBreaker] Failure in ${this.moduleId}::${this.operationName}:`, err.message);

    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      ModuleHealthRegistry.recordDegraded(
        this.moduleId,
        `Breaker triggered after ${this.failureCount} errors: ${err.message}`
      );
    }
  }
}
