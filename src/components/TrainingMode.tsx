import React, { useState, useEffect } from 'react';
import {  RotateCcw,  Eye, Settings, BookOpen, CheckCircle, X } from 'lucide-react';
import { textToMorse } from '../utils/morse';
import AudioPlayer from './AudioPlayer';
import VisualPlayer from './VisualPlayer';

interface TrainingModeProps {
  onShowMnemonics: () => void;
  customWordList?: string[];
  customListName?: string;
}

const TRAINING_WORDS = {
  easy: [
    'E', 'T', 'I', 'A', 'N', 'M', 'S', 'U', 'R', 'W', 'D', 'K', 'G', 'O',
    'HI', 'AT', 'IT', 'TO', 'IN', 'IS', 'AN', 'AS', 'OR', 'ON', 'BE', 'WE',
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD'
  ],
  medium: [
    'HELLO', 'WORLD', 'MORSE', 'CODE', 'RADIO', 'SIGNAL', 'SOUND', 'LIGHT', 'QUICK', 'BROWN',
    'TELEGRAPH', 'AMATEUR', 'STATION', 'FREQUENCY', 'ANTENNA', 'CIRCUIT', 'BATTERY', 'GROUND',
    'EMERGENCY', 'RESCUE', 'MAYDAY', 'DISTRESS', 'SAFETY', 'WEATHER', 'REPORT', 'TRAFFIC'
  ],
  hard: [
    'COMMUNICATION', 'INTERNATIONAL', 'NAVIGATION', 'COORDINATION', 'TRANSMISSION', 'RECEPTION',
    'ELECTROMAGNETIC', 'PROPAGATION', 'INTERFERENCE', 'MODULATION', 'DEMODULATION', 'AMPLIFICATION',
    'THE QUICK BROWN FOX', 'JUMPS OVER THE LAZY DOG', 'PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS',
    'HOW QUICKLY DAFT JUMPING ZEBRAS VEX', 'SPHINX OF BLACK QUARTZ JUDGE MY VOW'
  ],
  expert: [
    'SUPERCALIFRAGILISTICEXPIALIDOCIOUS', 'PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSISS',
    'ANTIDISESTABLISHMENTARIANISM', 'FLOCCINAUCINIHILIPILIFICATION', 'HIPPOPOTOMONSTROSESQUIPPEDALIOPHOBIA',
    'THE FIVE BOXING WIZARDS JUMP QUICKLY AND FIGHT WITH JABS', 
    'AMAZINGLY FEW DISCOTHEQUES PROVIDE JUKEBOXES WITH QUITE EXOTIC MUSIC',
    'JACKDAWS LOVE MY BIG SPHINX OF QUARTZ WITH VERY COMPLEX FREQUENCY MODULATION'
  ]
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-orange-100 text-orange-800 border-orange-200',
  expert: 'bg-red-100 text-red-800 border-red-200'
};

export default function TrainingMode({ onShowMnemonics, customWordList, customListName }: TrainingModeProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState<keyof typeof TRAINING_WORDS>('easy');
  const [showSettings, setShowSettings] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [showVisual, setShowVisual] = useState(true);
  
  const generateNewWord = () => {
    let availableWords;
    
    // Utiliser la liste personnalisée si disponible
    if (customWordList && customWordList.length > 0) {
      availableWords = customWordList;
    } else {
      // Sinon utiliser les mots par difficulté
      availableWords = TRAINING_WORDS[difficulty];
    }
    
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord);
    setUserInput('');
    setIsCorrect(null);
    setShowAnswer(false);
  };

  useEffect(() => {
    generateNewWord();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const checkAnswer = () => {
    const correctMorse = textToMorse(currentWord).output;
    const normalizedInput = userInput.trim().replace(/\s+/g, ' ');
    const normalizedCorrect = correctMorse.trim().replace(/\s+/g, ' ');
    
    const correct = normalizedInput === normalizedCorrect;
    setIsCorrect(correct);
    setAttempts(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 1);
      setTimeout(() => {
        generateNewWord();
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const currentMorse = textToMorse(currentWord).output;
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Mode Entraînement</h2>
          {customWordList && customListName ? (
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border bg-purple-100 text-purple-800 border-purple-200`}>
                Liste: {customListName}
              </span>
              <button
                onClick={() => window.location.reload()} // Simple way to clear selection
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                Utiliser liste par défaut
              </button>
            </div>
          ) : (
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${DIFFICULTY_COLORS[difficulty]}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Score: <span className="font-bold text-blue-600">{score}/{attempts}</span>
            {attempts > 0 && (
              <span className="ml-2">({accuracy}%)</span>
            )}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">Paramètres d'entraînement</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulté
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as keyof typeof TRAINING_WORDS)}
                disabled={!!customWordList}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="easy">Facile (lettres, mots courts)</option>
                <option value="medium">Moyen (mots courants)</option>
                <option value="hard">Difficile (mots longs, phrases)</option>
                <option value="expert">Expert (phrases complexes)</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showVisual}
                  onChange={(e) => setShowVisual(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Affichage visuel</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Current Challenge */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <h3 className="text-lg font-medium text-gray-700">Traduisez en code Morse :</h3>
            <button
              onClick={onShowMnemonics}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Aide mémoire</span>
            </button>
          </div>
          
          <div className="text-3xl font-bold text-blue-600 bg-blue-50 rounded-lg py-4 px-6 inline-block">
            {currentWord}
          </div>

          {/* Audio and Visual Players */}
          <div className="flex items-center justify-center space-x-4">
            <AudioPlayer 
              morse={currentMorse} 
              autoPlay={autoPlay}
              speed={playSpeed}
            />
            {showVisual && <VisualPlayer morse={currentMorse} />}
          </div>

          {/* Answer Input */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Entrez le code Morse..."
              className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition-colors ${
                isCorrect === null 
                  ? 'border-gray-300 focus:border-blue-500' 
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Vérifier
            </button>
            
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>{showAnswer ? 'Masquer' : 'Réponse'}</span>
            </button>
            
            <button
              onClick={generateNewWord}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Suivant</span>
            </button>
          </div>

          {/* Feedback */}
          {isCorrect !== null && (
            <div className={`p-3 rounded-lg ${
              isCorrect 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Correct !</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-600" />
                    <span>Incorrect, essayez encore</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Show Answer */}
          {showAnswer && (
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Réponse :</p>
              <p className="text-xl font-mono text-gray-800">{currentMorse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-sm text-gray-600">Réponses correctes</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{attempts}</div>
          <div className="text-sm text-gray-600">Total tentatives</div>
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