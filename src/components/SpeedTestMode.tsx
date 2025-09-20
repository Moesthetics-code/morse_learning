import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Trophy, Clock } from 'lucide-react';
import { textToMorse, TRAINING_WORDS } from '../utils/morse';
import AudioPlayer from './AudioPlayer';

interface SpeedTestProps {
  onUpdateProgress: (wpm: number, accuracy: number) => void;
}

type TestMode = 'encode' | 'decode';
type TestDuration = 1 | 2 | 5 | 10; // minutes

export default function SpeedTestMode({ onUpdateProgress }: SpeedTestProps) {
  const [testMode, setTestMode] = useState<TestMode>('encode');
  const [duration, setDuration] = useState<TestDuration>(2);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [currentChallenge, setCurrentChallenge] = useState('');
  const [currentMorse, setCurrentMorse] = useState('');
  const [userInput, setUserInput] = useState('');
  const [completedChallenges, setCompletedChallenges] = useState<{
    word: string;
    correct: boolean;
    time: number;
    wpm: number;
  }[]>([]);
  const [challengeStartTime, setChallengeStartTime] = useState(0);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateChallenge = useCallback(() => {
    const words = TRAINING_WORDS.filter(word => word.length >= 3 && word.length <= 8);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const morse = textToMorse(randomWord).output;
    
    setCurrentChallenge(randomWord);
    setCurrentMorse(morse);
    setUserInput('');
    setChallengeStartTime(Date.now());
  }, []);

  const startTest = useCallback(() => {
    setIsActive(true);
    setTimeLeft(duration * 60);
    setCompletedChallenges([]);
    setTotalCharacters(0);
    setCorrectCharacters(0);
    generateChallenge();
  }, [duration, generateChallenge]);

  const stopTest = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Calculate final WPM and accuracy
    const totalMinutes = (duration * 60 - timeLeft) / 60;
    const wpm = totalMinutes > 0 ? Math.round((correctCharacters / 5) / totalMinutes) : 0;
    const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;
    
    onUpdateProgress(wpm, accuracy);
  }, [duration, timeLeft, correctCharacters, totalCharacters, onUpdateProgress]);

  const checkAnswer = useCallback(() => {
    if (!currentChallenge) return;
    
    const challengeTime = Date.now() - challengeStartTime;
    const expectedAnswer = testMode === 'encode' ? currentMorse : currentChallenge;
    const normalizedInput = userInput.trim().toUpperCase().replace(/\s+/g, ' ');
    const normalizedExpected = expectedAnswer.trim().toUpperCase().replace(/\s+/g, ' ');
    
    const isCorrect = normalizedInput === normalizedExpected;
    const challengeWPM = Math.round((expectedAnswer.length / 5) / (challengeTime / 60000));
    
    // Update statistics
    setTotalCharacters(prev => prev + expectedAnswer.length);
    setCorrectCharacters(prev => prev + (isCorrect ? expectedAnswer.length : 0));
    
    setCompletedChallenges(prev => [...prev, {
      word: currentChallenge,
      correct: isCorrect,
      time: challengeTime,
      wpm: challengeWPM
    }]);
    
    generateChallenge();
  }, [currentChallenge, currentMorse, userInput, testMode, challengeStartTime, generateChallenge]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isActive) {
      checkAnswer();
    }
  };

  // Timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, stopTest]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentWPM = () => {
    const totalMinutes = (duration * 60 - timeLeft) / 60;
    return totalMinutes > 0 ? Math.round((correctCharacters / 5) / totalMinutes) : 0;
  };

  const currentAccuracy = () => {
    return totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center space-x-2">
          <Timer className="w-6 h-6 text-orange-600" />
          <span>Test de Vitesse</span>
        </h2>
        <p className="text-gray-600">Mesurez votre vitesse en mots par minute (WPM)</p>
      </div>

      {/* Test Configuration */}
      {!isActive && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Configuration du test</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de test
              </label>
              <select
                value={testMode}
                onChange={(e) => setTestMode(e.target.value as TestMode)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="encode">Encodage (Texte → Morse)</option>
                <option value="decode">Décodage (Morse → Texte)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée du test
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as TestDuration)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value={1}>1 minute</option>
                <option value={2}>2 minutes</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={startTest}
                className="w-full px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Commencer le test</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Instructions :</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• {testMode === 'encode' ? 'Convertissez le texte affiché en code Morse' : 'Écoutez le code Morse et tapez le texte correspondant'}</li>
              <li>• Appuyez sur Entrée pour valider chaque réponse</li>
              <li>• Soyez rapide et précis pour obtenir un bon score WPM</li>
              <li>• Le test s'arrête automatiquement à la fin du temps imparti</li>
            </ul>
          </div>
        </div>
      )}

      {/* Active Test */}
      {isActive && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Timer and Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className={`text-xl font-bold ${timeLeft <= 30 ? 'text-red-600' : 'text-gray-800'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                WPM: <span className="font-bold text-orange-600">{currentWPM()}</span>
              </div>
              <div className="text-sm text-gray-600">
                Précision: <span className="font-bold text-green-600">{currentAccuracy()}%</span>
              </div>
            </div>
            
            <button
              onClick={stopTest}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Pause className="w-4 h-4" />
              <span>Arrêter</span>
            </button>
          </div>

          {/* Challenge */}
          <div className="text-center space-y-4">
            {testMode === 'encode' ? (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Convertissez en code Morse :</h3>
                <div className="text-3xl font-bold text-orange-600 bg-orange-50 rounded-lg py-4 px-6 inline-block">
                  {currentChallenge}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Écoutez et tapez le texte :</h3>
                <div className="bg-orange-50 rounded-lg p-6">
                  <AudioPlayer morse={currentMorse} autoPlay={true} />
                </div>
              </div>
            )}

            {/* Input */}
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={testMode === 'encode' ? 'Entrez le code Morse...' : 'Entrez le texte...'}
                className="w-full px-4 py-3 text-lg border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                autoFocus
              />
            </div>

            <div className="text-sm text-gray-600">
              Défis complétés: {completedChallenges.length}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {completedChallenges.length > 0 && !isActive && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Résultats du test</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{currentWPM()}</div>
              <div className="text-sm text-orange-700">WPM</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{currentAccuracy()}%</div>
              <div className="text-sm text-green-700">Précision</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{completedChallenges.length}</div>
              <div className="text-sm text-blue-700">Défis</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {completedChallenges.filter(c => c.correct).length}
              </div>
              <div className="text-sm text-purple-700">Corrects</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Mot</th>
                  <th className="px-3 py-2 text-center">Résultat</th>
                  <th className="px-3 py-2 text-center">Temps</th>
                  <th className="px-3 py-2 text-center">WPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedChallenges.map((challenge, index) => (
                  <tr key={index} className={challenge.correct ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-3 py-2 font-mono">{challenge.word}</td>
                    <td className="px-3 py-2 text-center">
                      {challenge.correct ? '✅' : '❌'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {(challenge.time / 1000).toFixed(1)}s
                    </td>
                    <td className="px-3 py-2 text-center font-bold">
                      {challenge.wpm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                setCompletedChallenges([]);
                setTotalCharacters(0);
                setCorrectCharacters(0);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nouveau test</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}