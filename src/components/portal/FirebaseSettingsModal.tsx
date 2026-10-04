import React, { useState, useEffect } from 'react';
import { 
  Database, Cloud, Key, CheckCircle2, AlertTriangle, 
  RefreshCw, X, Save, Shield, HardDrive, Zap, Info
} from 'lucide-react';
import { firebaseConfigManager, FirebaseConfig } from '../../services/firebaseConfig';

interface FirebaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSettingsModal: React.FC<FirebaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  });

  const [rawJsonInput, setRawJsonInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const existing = firebaseConfigManager.getConfig();
    if (existing) {
      setConfig(existing);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily set to test
      firebaseConfigManager.setConfig(config);
      const res = await firebaseConfigManager.testConnection();
      setTestResult({
        success: res.success,
        message: res.message
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    firebaseConfigManager.setConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    firebaseConfigManager.clearConfig();
    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: ''
    });
    setTestResult(null);
  };

  const handleParseJson = () => {
    try {
      // Handle standard "const firebaseConfig = { ... };" or raw JSON
      const jsonString = rawJsonInput
        .replace(/const\s+firebaseConfig\s*=\s*/g, '')
        .replace(/;\s*$/g, '')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/'/g, '"');

      const parsed = JSON.parse(jsonString);
      setConfig({
        apiKey: parsed.apiKey || '',
        authDomain: parsed.authDomain || '',
        projectId: parsed.projectId || '',
        storageBucket: parsed.storageBucket || '',
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || '',
        measurementId: parsed.measurementId || ''
      });
      setRawJsonInput('');
    } catch {
      alert('Could not parse Firebase configuration snippet. Please check JSON syntax or input fields directly.');
    }
  };

  const isConfigured = firebaseConfigManager.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cu-border animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-cu-navy">Database &amp; Cloud Storage Configuration</h3>
              <p className="text-xs text-gray-500">Local Database (Default) &bull; Pluggable Firebase Firestore &amp; Cloud Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Current Status Pill */}
          <div className="p-4 rounded-2xl border flex items-center justify-between gap-4 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <div className="font-bold text-gray-900 text-sm">
                  {isConfigured ? 'Firebase Cloud Mode Active' : 'Offline Local Database Mode (Active)'}
                </div>
                <div className="text-gray-500 text-[11px] mt-0.5">
                  {isConfigured 
                    ? `Synchronizing collections & media with project: "${config.projectId}"`
                    : 'Operating with fast isolated LocalStorage & browser media storage (No setup needed).'}
                </div>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-700 shadow-2xs">
              {isConfigured ? 'CLOUD SYNC' : 'OFFLINE-FIRST'}
            </div>
          </div>

          {/* Quick Paste Snippet */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <Zap size={14} className="text-cu-gold" />
                <span>Quick Paste from Firebase Console:</span>
              </label>
            </div>
            <p className="text-[11px] text-gray-500">
              Paste the <code className="px-1.5 py-0.5 bg-gray-200 rounded font-mono text-[10px]">const firebaseConfig = {'{ ... }'}</code> snippet from your Firebase Project Settings.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={rawJsonInput}
                onChange={(e) => setRawJsonInput(e.target.value)}
                placeholder='{"apiKey": "AIzaSy...", "projectId": "chanakya-app", ...}'
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleParseJson}
                className="px-3 py-2 bg-cu-navy hover:bg-cu-navy-light text-white rounded-xl font-bold text-xs transition whitespace-nowrap"
              >
                Auto-Fill Fields
              </button>
            </div>
          </div>

          {/* Field Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
              <Key size={14} className="text-cu-navy" />
              <span>Firebase Credentials &amp; Buckets</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">API Key (apiKey):</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="AIzaSyA_..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Project ID (projectId):</label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  placeholder="chanakya-unisphere-2026"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Storage Bucket (storageBucket):</label>
                <input
                  type="text"
                  value={config.storageBucket}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  placeholder="chanakya-unisphere.appspot.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Auth Domain (authDomain):</label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  placeholder="chanakya-unisphere.firebaseapp.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">App ID (appId):</label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Messaging Sender ID:</label>
                <input
                  type="text"
                  value={config.messagingSenderId}
                  onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                  placeholder="123456789012"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{testResult.success ? 'Firebase Reachable' : 'Connection Notice'}</div>
                <div className="text-[11px] mt-0.5 opacity-90">{testResult.message}</div>
              </div>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Firebase configuration saved! Database storage adapter updated.</span>
            </div>
          )}

          {/* Information Note */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-[11px] text-blue-900">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Local-First Guarantee:</strong> When Firebase is unconfigured or offline, UniSphere persists all faculty dossiers, admissions applications, event announcements, timetables, and student leaves seamlessly in your local browser storage. Connecting Firebase gives you multi-device cloud replication.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/80 rounded-b-3xl">
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
          >
            Reset to Local DB Only
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !config.apiKey || !config.projectId}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-cu-navy hover:bg-cu-navy-light text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Save size={13} />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FirebaseSettingsModal;
