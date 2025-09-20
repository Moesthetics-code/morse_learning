import { useState, useCallback } from 'react';
import { textToMorse, morseToText, MorseTranslationResult } from '../utils/morse';

export interface Translation {
  id: string;
  input: string;
  output: string;
  type: 'encode' | 'decode';
  timestamp: number;
}

export function useMorse() {
  const [textInput, setTextInput] = useState('');
  const [morseInput, setMorseInput] = useState('');
  const [history, setHistory] = useState<Translation[]>([]);

  const addToHistory = useCallback((translation: Translation) => {
    setHistory(prev => [translation, ...prev.slice(0, 19)]); // Garder seulement les 20 dernières
  }, []);

  const encodeToMorse = useCallback(() => {
    if (!textInput.trim()) return null;
    
    const result = textToMorse(textInput);
    if (result.isValid) {
      setMorseInput(result.output);
      addToHistory({
        id: Date.now().toString(),
        input: textInput,
        output: result.output,
        type: 'encode',
        timestamp: Date.now()
      });
    }
    return result;
  }, [textInput, addToHistory]);

  const decodeFromMorse = useCallback(() => {
    if (!morseInput.trim()) return null;
    
    const result = morseToText(morseInput);
    if (result.isValid) {
      setTextInput(result.output);
      addToHistory({
        id: Date.now().toString(),
        input: morseInput,
        output: result.output,
        type: 'decode',
        timestamp: Date.now()
      });
    }
    return result;
  }, [morseInput, addToHistory]);

  const clearAll = useCallback(() => {
    setTextInput('');
    setMorseInput('');
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    textInput,
    setTextInput,
    morseInput,
    setMorseInput,
    history,
    encodeToMorse,
    decodeFromMorse,
    clearAll,
    clearHistory
  };
}