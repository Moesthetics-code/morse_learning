import React, { useState, useEffect, useCallback } from 'react';
import {  RotateCcw, Eye, EyeOff, Settings, CheckCircle, X } from 'lucide-react';
import { textToMorse } from '../utils/morse';
import AudioPlayer from './AudioPlayer';

interface ListeningModeProps {
  onUpdateProgress: (correct: number, total: number) => void;
  customWordList?: string[];
  customListName?: string;
}

const DIFFICULTY_WORDS = {
  easy: ['E', 'T', 'I', 'A', 'N', 'M', 'S', 'O', 'HI', 'AT', 'IT', 'TO', 'IN', 'IS'],
  medium: ['HELLO', 'WORLD', 'MORSE', 'CODE', 'RADIO', 'SIGNAL', 'SOUND', 'LIGHT'],
  hard: ['COMMUNICATION', 'TELEGRAPH', 'FREQUENCY', 'EMERGENCY', 'NAVIGATION']
};

export default function ListeningMode({ onUpdateProgress, customWordList, customListName }: ListeningModeProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [currentMorse, setCurrentMorse] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showMorse, setShowMorse] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY_WORDS>('easy');
  const [autoPlay, setAutoPlay] = useState(true);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const generateNewChallenge = useCallback(() => {
    let availableWords;
    
    // Utiliser la liste personnalisée si disponible
    if (customWordList && customWordList.length > 0) {
      availableWords = customWordList;
    } else {
      // Sinon utiliser les mots par difficulté
      availableWords = DIFFICULTY_WORDS[difficulty];
    }
    
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    const morse = textToMorse(randomWord).output;
    
    setCurrentWord(randomWord);
    setCurrentMorse(morse);
    setUserInput('');
    setShowMorse(false);
    setIsCorrect(null);
  }, [difficulty, customWordList]);

  useEffect(() => {
    generateNewChallenge();
  }, [generateNewChallenge]);

  const checkAnswer = useCallback(() => {
    const normalizedInput = userInput.toUpperCase().trim();
    const correct = normalizedInput === currentWord;
    
    setIsCorrect(correct);
    const newAttempts = attempts + 1;
    const newScore = score + (correct ? 1 : 0);
    
    setAttempts(newAttempts);
    setScore(newScore);
    
    onUpdateProgress(newScore, newAttempts);
    
    if (correct) {
      setTimeout(() => {
        generateNewChallenge();
      }, 1500);
    }
  }, [userInput, currentWord, attempts, score, onUpdateProgress, generateNewChallenge]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Settings */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Mode Écoute Active</h2>
          {customWordList && customListName ? (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Liste: {customListName}
              </span>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                Utiliser liste par défaut
              </button>
            </div>
          ) : (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">Paramètres d'écoute</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulté
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as keyof typeof DIFFICULTY_WORDS)}
                disabled={!!customWordList}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="easy">Facile (lettres simples)</option>
                <option value="medium">Moyen (mots courants)</option>
                <option value="hard">Difficile (mots complexes)</option>
              </select>
              {customWordList && (
                <p className="text-xs text-gray-500 mt-1">
                  Difficulté désactivée - utilisation de la liste personnalisée
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vitesse audio
              </label>
              <select
                value={playSpeed}
                onChange={(e) => setPlaySpeed(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value={0.5}>Très lent (0.5x)</option>
                <option value={0.75}>Lent (0.75x)</option>
                <option value={1}>Normal (1x)</option>
                <option value={1.25}>Rapide (1.25x)</option>
                <option value={1.5}>Très rapide (1.5x)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Lecture automatique</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center space-y-6">
          <h3 className="text-lg font-medium text-gray-700">
            Écoutez le code Morse et tapez le texte correspondant :
          </h3>

          {/* Audio Player */}
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex justify-center mb-4">
              <AudioPlayer 
                morse={currentMorse}
                autoPlay={autoPlay}
                speed={playSpeed}
                className="scale-110"
              />
            </div>
            
            {/* Show/Hide Morse Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowMorse(!showMorse)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showMorse ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showMorse ? 'Masquer' : 'Voir'} le code Morse</span>
              </button>
            </div>
            
            {showMorse && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <div className="text-xl font-mono text-center text-gray-800 tracking-wider">
                  {currentMorse}
                </div>
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez ce que vous avez entendu..."
              className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition-colors ${
                isCorrect === null 
                  ? 'border-gray-300 focus:border-purple-500' 
                  : isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={checkAnswer}
              disabled={!userInput.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Vérifier
            </button>
            
            <button
              onClick={generateNewChallenge}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nouveau</span>
            </button>
          </div>

          {/* Feedback */}
          {isCorrect !== null && (
            <div className={`p-4 rounded-lg ${
              isCorrect 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {isCorrect ? (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Correct !</span>
                  <span className="text-sm">("{currentWord}")</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <X className="w-5 h-5 text-red-600" />
                    <span>Incorrect</span>
                  </div>
                  <div className="mt-1">
                    La réponse était : <strong>{currentWord}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{score}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{attempts}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className={`text-2xl font-bold ${accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {accuracy}%
          </div>
          <div className="text-sm text-gray-600">Précision</div>
        </div>
      </div>
    </div>
  );
}