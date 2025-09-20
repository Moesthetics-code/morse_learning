import { useState, useCallback } from 'react';
import { Eye, EyeOff, Play } from 'lucide-react';
import { generateMorseSequence } from '../utils/morse';

interface VisualPlayerProps {
  morse: string;
  className?: string;
}

export default function VisualPlayer({ morse, className = '' }: VisualPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentSignal, setCurrentSignal] = useState<'dot' | 'dash' | 'pause' | null>(null);

  // Validation et nettoyage de la prop morse
  const morseString = typeof morse === 'string' ? morse.trim() : '';

  const playVisual = useCallback(async () => {
    if (!morseString || isPlaying || !isVisible) return;

    setIsPlaying(true);
    
    try {
      const sequence = generateMorseSequence(morseString);

      for (const signal of sequence) {
        setCurrentSignal(signal.type);
        await new Promise(resolve => setTimeout(resolve, signal.duration));
      }
    } catch (error) {
      console.error('Erreur lors de la lecture visuelle:', error);
    }
    
    setCurrentSignal(null);
    setIsPlaying(false);
  }, [morseString, isPlaying, isVisible]);

  if (!morseString) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={playVisual}
          disabled={isPlaying || !isVisible}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isPlaying || !isVisible
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>{isPlaying ? 'En cours...' : 'Afficher'}</span>
        </button>

        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            !isVisible
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {isVisible && (
        <div className="flex justify-center">
          <div
            className={`w-32 h-32 rounded-full border-4 transition-all duration-200 ${
              currentSignal === 'dot'
                ? 'bg-emerald-400 border-emerald-600 shadow-lg shadow-emerald-400/50 animate-pulse'
                : currentSignal === 'dash'
                ? 'bg-amber-400 border-amber-600 shadow-lg shadow-amber-400/50 animate-pulse'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center h-full text-gray-600 font-mono text-lg">
              {currentSignal === 'dot' && '•'}
              {currentSignal === 'dash' && '─'}
              {currentSignal === 'pause' && '⏸'}
              {!currentSignal && '○'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}