/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { generateMorseSequence } from '../utils/morse';

interface AudioPlayerProps {
  morse: string;
  className?: string;
  autoPlay?: boolean;
  speed?: number;
}

export default function AudioPlayer({ 
  morse, 
  className = '', 
  autoPlay = false, 
  speed = 1 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Validation et nettoyage de la prop morse
  const morseString = typeof morse === 'string' ? morse.trim() : '';

  const playMorse = useCallback(async () => {
    if (!morseString || isPlaying || isMuted) return;

    setIsPlaying(true);
    
    try {
      // Vérifier si AudioContext est disponible
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('AudioContext non supporté dans ce navigateur');
        setIsPlaying(false);
        return;
      }

      const audioContext = new AudioContextClass();
      
      // Reprendre le contexte s'il est suspendu (requis par les navigateurs modernes)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const sequence = generateMorseSequence(morseString);

      for (const signal of sequence) {
        if (signal.type === 'pause') {
          await new Promise(resolve => setTimeout(resolve, signal.duration / speed));
        } else {
          // Créer un oscillateur pour le bip
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.type = 'sine';
          
          const adjustedDuration = signal.duration / speed / 1000;
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
          gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + adjustedDuration - 0.01);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + adjustedDuration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + adjustedDuration);
          
          await new Promise(resolve => setTimeout(resolve, signal.duration / speed));
        }
      }
      
      await audioContext.close();
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
    }
    
    setIsPlaying(false);
  }, [morseString, isPlaying, isMuted, volume, speed]);

  // Auto-play si demandé
  React.useEffect(() => {
    if (autoPlay && morseString && !isPlaying && !isMuted) {
      // Petit délai pour éviter les conflits
      const timer = setTimeout(() => {
        playMorse();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, morseString, playMorse, isPlaying, isMuted]);

  if (!morseString) return null;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        onClick={playMorse}
        disabled={isPlaying}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isPlaying
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span>{isPlaying ? 'En cours...' : 'Écouter'}</span>
      </button>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            isMuted
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          disabled={isMuted}
          className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />
      </div>
    </div>
  );
}