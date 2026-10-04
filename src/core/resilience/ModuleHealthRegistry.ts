// UniSphere Resilience Tier: Central Module Health & Fault Telemetry Registry
// Real-time health monitoring and fault isolation telemetry across all 8 campus modules.

export type ModuleHealthStatus = 'HEALTHY' | 'DEGRADED' | 'FAULT_ISOLATED';

export interface ModuleHealthEntry {
  id: string;
  name: string;
  team: string;
  status: ModuleHealthStatus;
  lastIncident?: {
    timestamp: string;
    errorType: string;
    message: string;
  };
  restartCount: number;
}

type HealthListener = (modules: Record<string, ModuleHealthEntry>) => void;

class ModuleHealthRegistryManager {
  private registry: Record<string, ModuleHealthEntry> = {
    hrms: { id: 'hrms', name: 'EduHRMS (Faculty & Staff)', team: 'Team 01', status: 'HEALTHY', restartCount: 0 },
    academics: { id: 'academics', name: 'EduAttend AI (Smart Attendance)', team: 'Team 02', status: 'HEALTHY', restartCount: 0 },
    exams: { id: 'exams', name: 'EduExam AI (ExamShield)', team: 'Team 03', status: 'HEALTHY', restartCount: 0 },
    codearena: { id: 'codearena', name: 'EduCode Judge (Arena)', team: 'Team 04', status: 'HEALTHY', restartCount: 0 },
    presentation: { id: 'presentation', name: 'EduPresent AI (Viva Voce)', team: 'Team 05', status: 'HEALTHY', restartCount: 0 },
    bot: { id: 'bot', name: 'EduAssist AI (CampusBot)', team: 'Team 06', status: 'HEALTHY', restartCount: 0 },
    unihub: { id: 'unihub', name: 'UniHub (Git & Research)', team: 'Team 07', status: 'HEALTHY', restartCount: 0 },
    trackit: { id: 'trackit', name: 'TrackIt (Projects & Internships)', team: 'Team 08', status: 'HEALTHY', restartCount: 0 }
  };

  private listeners: Set<HealthListener> = new Set();

  public getSnapshot(): Record<string, ModuleHealthEntry> {
    return { ...this.registry };
  }

  public getModule(id: string): ModuleHealthEntry | undefined {
    return this.registry[id];
  }

  public recordFault(moduleId: string, error: Error | string): void {
    const entry = this.registry[moduleId];
    if (entry) {
      entry.status = 'FAULT_ISOLATED';
      entry.lastIncident = {
        timestamp: new Date().toLocaleTimeString(),
        errorType: typeof error === 'string' ? 'RuntimeFault' : error.name,
        message: typeof error === 'string' ? error : error.message
      };
      this.notifyListeners();
    }
  }

  public recordRecovery(moduleId: string): void {
    const entry = this.registry[moduleId];
    if (entry) {
      entry.status = 'HEALTHY';
      entry.restartCount += 1;
      this.notifyListeners();
    }
  }

  public recordDegraded(moduleId: string, reason: string): void {
    const entry = this.registry[moduleId];
    if (entry) {
      entry.status = 'DEGRADED';
      entry.lastIncident = {
        timestamp: new Date().toLocaleTimeString(),
        errorType: 'CircuitBreakerOpen',
        message: reason
      };
      this.notifyListeners();
    }
  }

  public subscribe(listener: HealthListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(fn => fn(snapshot));
  }
}

export const ModuleHealthRegistry = new ModuleHealthRegistryManager();
