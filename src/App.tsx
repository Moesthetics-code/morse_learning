import { useState, useEffect } from 'react';
import { Radio, BookOpen, RotateCcw, GraduationCap, Brain, Headphones, Timer, Trophy, Mic, FileText, HardDrive, Volume2, BarChart, Github, ExternalLink } from 'lucide-react';
import MorseTranslator from './components/MorseTranslator';
import TrainingMode from './components/TrainingMode';
import LessonsMode from './components/LessonsMode';
import MnemonicsHelper from './components/MnemonicsHelper';
import ListeningMode from './components/ListeningMode';
import SpeedTestMode from './components/SpeedTestMode';
import AchievementsSystem, { useAchievements, Achievement } from './components/AchievementsSystem';
import DictationMode from './components/DictationMode';
import CustomListsManager, { CustomList } from './components/CustomListsManager';
import OfflineStorageManager, { UserProgress } from './components/OfflineStorageManager';

// Configuration GitHub - Remplacez par vos vraies informations
const GITHUB_CONFIG = {
  username: 'Moesthetics-code',
  profileUrl: 'https://github.com/Moesthetics-code',
  displayName: 'Mohamed Ndiaye'
};

type ActiveTab = 'translator' | 'training' | 'lessons' | 'mnemonics' | 'listening' | 'speedtest' | 'achievements' | 'dictation' | 'customlists' | 'storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('translator');
  const [userStats, setUserStats] = useState<UserProgress>({
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
  
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [selectedCustomList, setSelectedCustomList] = useState<CustomList | null>(null);

  const { achievements, newAchievements: achievementNotifications, dismissNewAchievements } = useAchievements(userStats);

  // Update progress from various components
  const updateProgress = (updates: Partial<UserProgress>) => {
    setUserStats(prev => ({
      ...prev,
      ...updates,
      lastActivity: new Date()
    }));
  };

  // Handle new achievements
  useEffect(() => {
    if (achievementNotifications.length > 0) {
      setNewAchievements(achievementNotifications);
      setTimeout(() => {
        dismissNewAchievements();
        setNewAchievements([]);
      }, 5000);
    }
  }, [achievementNotifications, dismissNewAchievements]);

  // Progress handlers for different modes
  const handleTrainingProgress = (correct: number, total: number) => {
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    updateProgress({
      totalCorrect: userStats.totalCorrect + correct,
      totalAttempts: userStats.totalAttempts + total,
      bestAccuracy: Math.max(userStats.bestAccuracy, accuracy),
      currentStreak: correct > 0 ? userStats.currentStreak + correct : 0,
      bestStreak: Math.max(userStats.bestStreak, userStats.currentStreak),
    });
  };

  const handleSpeedTestProgress = (wpm: number, accuracy: number) => {
    updateProgress({
      bestWPM: Math.max(userStats.bestWPM, wpm),
      bestAccuracy: Math.max(userStats.bestAccuracy, accuracy)
    });
  };

  const handleLessonComplete = (lessonId: number, perfect: boolean) => {
    const completedLessons = [...userStats.lessonsCompleted];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }
    
    updateProgress({
      lessonsCompleted: completedLessons,
      perfectLessons: perfect ? userStats.perfectLessons + 1 : userStats.perfectLessons
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDictationProgress = (wordsSpoken: number, morseGenerated: number) => {
    updateProgress({
      totalCorrect: userStats.totalCorrect + wordsSpoken,
      timePlayedMinutes: userStats.timePlayedMinutes + 1
    });
  };

  const handleCustomListsChange = (lists: CustomList[]) => {
    setCustomLists(lists);
    updateProgress({
      customLists: lists.map(l => l.id)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-xl shadow-lg">
                <Radio className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Morse</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              
              {/* Navigation Tabs */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'translator', icon: RotateCcw, label: 'Traducteur' },
                  { id: 'lessons', icon: GraduationCap, label: 'Leçons' },
                  { id: 'training', icon: BookOpen, label: 'Entraînement' },
                  { id: 'listening', icon: Headphones, label: 'Écoute' },
                  { id: 'speedtest', icon: Timer, label: 'Vitesse' },
                  { id: 'dictation', icon: Mic, label: 'Dictée' },
                  { id: 'mnemonics', icon: Brain, label: 'Aide-mémoire' },
                  { id: 'achievements', icon: Trophy, label: 'Succès' },
                  { id: 'customlists', icon: FileText, label: 'Listes' },
                  { id: 'storage', icon: HardDrive, label: 'Données' }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs ${
                        activeTab === tab.id
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {newAchievements.map(achievement => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={achievement.id}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg shadow-lg transform animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-6 h-6" />
                  <div>
                    <div className="font-bold">{achievement.name}</div>
                    <div className="text-sm opacity-90">{achievement.description}</div>
                    <div className="text-xs">+{achievement.points} points</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'translator' && <MorseTranslator />}
        {activeTab === 'lessons' && (
          <LessonsMode 
            onLessonComplete={handleLessonComplete}
            onProgressUpdate={handleTrainingProgress}
          />
        )}
        {activeTab === 'training' && (
          <TrainingMode 
            onShowMnemonics={() => setActiveTab('mnemonics')}
            customWordList={selectedCustomList?.words}
            customListName={selectedCustomList?.name}
          />
        )}
        {activeTab === 'listening' && (
          <ListeningMode 
            onUpdateProgress={handleTrainingProgress}
            customWordList={selectedCustomList?.words}
            customListName={selectedCustomList?.name}
          />
        )}
        {activeTab === 'speedtest' && (
          <SpeedTestMode onUpdateProgress={handleSpeedTestProgress} />
        )}
        {activeTab === 'dictation' && (
          <DictationMode onUpdateProgress={handleDictationProgress} />
        )}
        {activeTab === 'mnemonics' && <MnemonicsHelper />}
        {activeTab === 'achievements' && (
          <AchievementsSystem 
            userStats={userStats} 
            onAchievementUnlocked={(achievement) => console.log('Achievement unlocked:', achievement)}
          />
        )}
        {activeTab === 'customlists' && (
          <CustomListsManager 
            onListSelected={(list) => {
              console.log('List selected:', list);
              setSelectedCustomList(list);
              setActiveTab('training'); // Rediriger vers le mode entraînement
            }}
            onListsChanged={handleCustomListsChange}
          />
        )}
        {activeTab === 'storage' && (
          <OfflineStorageManager 
            userProgress={userStats}
            onProgressUpdate={updateProgress}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">À propos du Code Morse</h3>
              <p className="text-gray-600 text-sm">
                Le code Morse est un système de communication développé par Samuel Morse en 1838. 
                Il utilise des signaux courts (points) et longs (traits) pour représenter les lettres et chiffres.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Modes d'apprentissage</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span><strong>Leçons</strong> : Apprentissage progressif</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span><strong>Entraînement</strong> : Pratique libre</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Headphones className="w-4 h-4 text-purple-500" />
                  <span><strong>Écoute active</strong> : Décodage auditif</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-orange-500" />
                  <span><strong>Tests vitesse</strong> : Mesure WPM</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-pink-500" />
                  <span><strong>Dictée vocale</strong> : Reconnaissance vocale</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Fonctionnalités avancées</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Système de succès et badges</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Listes personnalisées</span>
                </li>
                <li className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-gray-500" />
                  <span>Sauvegarde hors ligne</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>Audio et visuel adaptatifs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart className="w-4 h-4 text-emerald-500" />
                  <span>Statistiques détaillées</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Signal SOS</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-mono text-center text-slate-800 mb-2">
                  ... --- ...
                </div>
                <p className="text-gray-600 text-sm text-center">
                  Signal international de détresse
                </p>
              </div>
              
              {/* User Progress Summary */}
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <h4 className="font-medium text-emerald-800 mb-2">Votre progression</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-emerald-700">
                  <div>Réussite: {userStats.totalAttempts > 0 ? Math.round((userStats.totalCorrect / userStats.totalAttempts) * 100) : 0}%</div>
                  <div>Série: {userStats.currentStreak}</div>
                  <div>WPM: {userStats.bestWPM}</div>
                  <div>Leçons: {userStats.lessonsCompleted.length}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Développeur avec GitHub */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Info projet */}
              <div className="text-center md:text-left">
                <p className="text-gray-500 text-sm">
                  © 2025 Morse - École complète de code Morse avec fonctionnalités avancées
                </p>
                <p className="mt-1 text-gray-500 text-sm">
                  Modes: Traduction • Leçons • Entraînement • Écoute • Vitesse • Dictée • Succès • Données
                </p>
              </div>

              {/* Section Développeur avec GitHub */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Développé par</p>
                  <p className="font-medium text-slate-800 text-sm">{GITHUB_CONFIG.displayName}</p>
                </div>
                
                {/* GitHub Profile Link avec photo */}
                <a
                  href={GITHUB_CONFIG.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors group"
                >
                  {/* Photo de profil GitHub */}
                  <img
                    src={`https://github.com/${GITHUB_CONFIG.username}.png?size=32`}
                    alt={`${GITHUB_CONFIG.displayName} GitHub Profile`}
                    className="w-6 h-6 rounded-full border border-gray-300"
                    loading="lazy"
                  />
                  
                  {/* Icône GitHub */}
                  <Github className="w-4 h-4 text-gray-600 group-hover:text-slate-800" />
                  
                  {/* Username */}
                  <span className="text-sm text-gray-600 group-hover:text-slate-800 font-medium">
                    {GITHUB_CONFIG.username}
                  </span>
                  
                  {/* Icône lien externe */}
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-slate-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}