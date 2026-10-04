// UniSphere Resilience Tier: Sandboxed Decoupled Campus Event Bus
// Enables cross-module communication (e.g. Attendance 75% Gate -> Exam Eligibility)
// All event listeners are wrapped in isolated try/catch boundaries so a fault in one listener never crashes others.

import { ModuleHealthRegistry } from './ModuleHealthRegistry';

export interface CampusEvent<T = any> {
  type: string;
  sourceModule: string;
  payload: T;
  timestamp: string;
}

type EventListener<T = any> = (event: CampusEvent<T>) => void;

class CampusEventBusManager {
  private listeners: Map<string, Set<{ listener: EventListener; targetModule: string }>> = new Map();

  public subscribe<T = any>(
    eventType: string,
    targetModule: string,
    listener: EventListener<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const entry = { listener, targetModule };
    this.listeners.get(eventType)!.add(entry);

    return () => {
      this.listeners.get(eventType)?.delete(entry);
    };
  }

  public publish<T = any>(eventType: string, sourceModule: string, payload: T): void {
    const event: CampusEvent<T> = {
      type: eventType,
      sourceModule,
      payload,
      timestamp: new Date().toISOString()
    };

    const subscribers = this.listeners.get(eventType);
    if (!subscribers) return;

    subscribers.forEach(({ listener, targetModule }) => {
      try {
        listener(event);
      } catch (err: any) {
        console.error(
          `[CampusEventBus] Fault isolated in subscriber for ${eventType} in module ${targetModule}:`,
          err
        );
        ModuleHealthRegistry.recordFault(
          targetModule,
          `Event listener fault on '${eventType}': ${err.message}`
        );
      }
    });
  }
}

export const CampusEventBus = new CampusEventBusManager();
