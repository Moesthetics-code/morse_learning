import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Download, Upload, HardDrive, Cloud, Trash2, AlertCircle } from 'lucide-react';

export interface UserProgress {
  totalCorrect: number;
  totalAttempts: number;
  currentStreak: number;
  bestStreak: number;
  bestAccuracy: number;
  bestWPM: number;
  lessonsCompleted: number[];
  timePlayedMinutes: number;
  perfectLessons: number;
  lastActivity: Date;
  achievements: string[];
  customLists: string[];
  preferences: {
    playSpeed: number;
    autoPlay: boolean;
    showVisual: boolean;
    language: string;
  };
}

interface OfflineStorageManagerProps {
  userProgress: UserProgress;
  onProgressUpdate: (progress: UserProgress) => void;
}

const STORAGE_KEYS = {
  USER_PROGRESS: 'morse_user_progress',
  CUSTOM_LISTS: 'morse_custom_lists',
  ACHIEVEMENTS: 'morse_achievements',
  PREFERENCES: 'morse_preferences',
  CACHE_VERSION: 'morse_cache_version'
};

const CACHE_VERSION = '1.0.0';

export default function OfflineStorageManager({ userProgress, onProgressUpdate }: OfflineStorageManagerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageSize, setStorageSize] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [storageQuota, setStorageQuota] = useState<{ used: number; total: number } | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate storage usage
  const calculateStorageSize = useCallback(() => {
    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      });
      setStorageSize(totalSize);
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
  }, []);

  // Get storage quota if available
  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageQuota({
          used: estimate.usage || 0,
          total: estimate.quota || 0
        });
      });
    }
    calculateStorageSize();
  }, [calculateStorageSize]);

  // Save progress to localStorage
  const saveToLocal = useCallback((progress: UserProgress) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
      localStorage.setItem(STORAGE_KEYS.CACHE_VERSION, CACHE_VERSION);
      calculateStorageSize();
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }, [calculateStorageSize]);

  // Load progress from localStorage
  const loadFromLocal = useCallback((): UserProgress | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      const version = localStorage.getItem(STORAGE_KEYS.CACHE_VERSION);
      
      if (stored && version === CACHE_VERSION) {
        const progress = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (progress.lastActivity) {
          progress.lastActivity = new Date(progress.lastActivity);
        }
        return progress;
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }, []);

  // Export all data
  const exportAllData = useCallback(() => {
    try {
      const exportData = {
        userProgress,
        customLists: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_LISTS) || '[]'),
        achievements: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || '[]'),
        preferences: JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) || '{}'),
        exportedAt: new Date().toISOString(),
        version: CACHE_VERSION,
        appVersion: 'Morse 1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `morse-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  }, [userProgress]);

  // Import data
  const importData = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // Validate data structure
          if (!data.userProgress || !data.version) {
            throw new Error('Format de fichier invalide');
          }

          // Import user progress
          if (data.userProgress) {
            const progress = {
              ...data.userProgress,
              lastActivity: new Date(data.userProgress.lastActivity || new Date())
            };
            saveToLocal(progress);
            onProgressUpdate(progress);
          }

          // Import other data
          if (data.customLists) {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_LISTS, JSON.stringify(data.customLists));
          }
          if (data.achievements) {
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
          }
          if (data.preferences) {
            localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
          }

          calculateStorageSize();
          setLastSync(new Date());
          resolve(true);
        } catch (error) {
          console.error('Error importing data:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, [saveToLocal, onProgressUpdate, calculateStorageSize]);

  // Clear all data
  const clearAllData = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      setStorageSize(0);
      setLastSync(null);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    saveToLocal(userProgress);
  }, [userProgress, saveToLocal]);

  // Load progress on mount
  useEffect(() => {
    const savedProgress = loadFromLocal();
    if (savedProgress) {
      onProgressUpdate(savedProgress);
      setLastSync(savedProgress.lastActivity);
    }
  }, [loadFromLocal, onProgressUpdate]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!storageQuota || storageQuota.total === 0) return 0;
    return (storageQuota.used / storageQuota.total) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
            <HardDrive className="w-6 h-6 text-indigo-600" />
            <span>Stockage et Synchronisation</span>
          </h2>
          <p className="text-gray-600">Gérez vos données hors ligne et votre progression</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Mode hors ligne</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Vous travaillez actuellement hors ligne. Vos progrès sont sauvegardés localement 
                et seront synchronisés lors de votre prochaine connexion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-2">
            <HardDrive className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Stockage local</h3>
              <p className="text-sm text-gray-600">{formatBytes(storageSize)}</p>
            </div>
          </div>
          {storageQuota && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Utilisé</span>
                <span>{getStoragePercentage().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Cloud className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Dernière sync</h3>
              <p className="text-sm text-gray-600">
                {lastSync ? lastSync.toLocaleString() : 'Jamais'}
              </p>
            </div>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${
            syncStatus === 'success' ? 'bg-green-100 text-green-800' :
            syncStatus === 'error' ? 'bg-red-100 text-red-800' :
            syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {syncStatus === 'success' ? 'Synchronisé' :
             syncStatus === 'error' ? 'Erreur de sync' :
             syncStatus === 'syncing' ? 'Synchronisation...' :
             'En attente'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Download className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Sauvegarde</h3>
              <p className="text-sm text-gray-600">Données protégées</p>
            </div>
          </div>
          <div className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
            Automatique
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestion des données</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Exporter vos données</h4>
            <p className="text-sm text-gray-600 mb-4">
              Créez une sauvegarde complète de votre progression, listes personnalisées et paramètres.
            </p>
            <button
              onClick={exportAllData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger la sauvegarde</span>
            </button>
          </div>

          {/* Import Section */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Importer des données</h4>
            <p className="text-sm text-gray-600 mb-4">
              Restaurez vos données à partir d'un fichier de sauvegarde précédent.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSyncStatus('syncing');
                  const success = await importData(file);
                  setSyncStatus(success ? 'success' : 'error');
                  setTimeout(() => setSyncStatus('idle'), 3000);
                }
                e.target.value = '';
              }}
              className="hidden"
              id="import-data"
            />
            <label
              htmlFor="import-data"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Importer une sauvegarde</span>
            </label>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé de votre progression</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userProgress.totalCorrect}</div>
            <div className="text-sm text-gray-600">Réponses correctes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{userProgress.bestWPM}</div>
            <div className="text-sm text-gray-600">Meilleur WPM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userProgress.lessonsCompleted.length}</div>
            <div className="text-sm text-gray-600">Leçons terminées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{Math.round(userProgress.timePlayedMinutes)}</div>
            <div className="text-sm text-gray-600">Minutes jouées</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-md border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4">Zone de danger</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ces actions sont irréversibles. Assurez-vous d'avoir exporté vos données avant de continuer.
        </p>
        
        <button
          onClick={() => {
            if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.')) {
              clearAllData();
              onProgressUpdate({
                totalCorrect: 0,
                totalAttempts: 0,
                currentStreak: 0,
                bestStreak: 0,
                bestAccuracy: 0,
                bestWPM: 0,
                lessonsCompleted: [],
                timePlayedMinutes: 0,
                perfectLessons: 0,
                lastActivity: new Date(),
                achievements: [],
                customLists: [],
                preferences: {
                  playSpeed: 1,
                  autoPlay: true,
                  showVisual: true,
                  language: 'fr-FR'
                }
              });
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Effacer toutes les données</span>
        </button>
      </div>
    </div>
  );
}