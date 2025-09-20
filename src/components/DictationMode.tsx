import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Trash2, Copy, Settings } from 'lucide-react';
import { textToMorse } from '../utils/morse';
import AudioPlayer from './AudioPlayer';

interface DictationModeProps {
  onUpdateProgress: (wordsSpoken: number, morseGenerated: number) => void;
}

export default function DictationMode({ onUpdateProgress }: DictationModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [morseOutput, setMorseOutput] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState('fr-FR');
  const [autoConvert, setAutoConvert] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<Array<{
    id: string;
    text: string;
    morse: string;
    timestamp: Date;
  }>>([]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for speech recognition support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = transcript + finalTranscript;
        setTranscript(fullTranscript + interimTranscript);
        
        if (finalTranscript && autoConvert) {
          const newText = transcript + finalTranscript;
          const morse = textToMorse(newText).output;
          setMorseOutput(morse);
          
          // Update progress
          const wordCount = newText.trim().split(/\s+/).length;
          onUpdateProgress(wordCount, morse.length);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Erreur de reconnaissance vocale: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      setError('La reconnaissance vocale n\'est pas supportée par ce navigateur');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, autoConvert, transcript, onUpdateProgress]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    setError(null);
    setIsListening(true);
    recognitionRef.current.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const convertToMorse = useCallback(() => {
    if (!transcript.trim()) return;
    
    const morse = textToMorse(transcript).output;
    setMorseOutput(morse);
    
    // Add to history
    const newEntry = {
      id: Date.now().toString(),
      text: transcript,
      morse: morse,
      timestamp: new Date()
    };
    
    setHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
  }, [transcript]);

  const clearAll = useCallback(() => {
    setTranscript('');
    setMorseOutput('');
    setError(null);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const restoreFromHistory = (entry: typeof history[0]) => {
    setTranscript(entry.text);
    setMorseOutput(entry.morse);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
            <Mic className="w-6 h-6 text-blue-600" />
            <span>Mode Dictée</span>
          </h2>
          <p className="text-gray-600">Dictez du texte et convertissez-le automatiquement en code Morse</p>
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
          <h3 className="font-semibold text-gray-800">Paramètres de dictée</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue de reconnaissance
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="fr-FR">Français (France)</option>
                <option value="en-US">Anglais (US)</option>
                <option value="en-GB">Anglais (UK)</option>
                <option value="es-ES">Espagnol</option>
                <option value="de-DE">Allemand</option>
                <option value="it-IT">Italien</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoConvert}
                  onChange={(e) => setAutoConvert(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Conversion automatique</span>
              </label>
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
          {!isSupported && (
            <div className="mt-2 text-sm text-red-600">
              Navigateurs supportés: Chrome, Safari (avec activation manuelle), Edge
            </div>
          )}
        </div>
      )}

      {/* Main Interface */}
      {isSupported && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Voice Recognition Area */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reconnaissance Vocale</h3>
              <div className="flex space-x-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-sm mb-2 ${isListening ? 'text-white' : 'text-blue-200'}`}>
                {isListening ? 'Écoute en cours... Parlez maintenant' : 'Cliquez sur le microphone pour commencer'}
              </div>
              
              {isListening && (
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-white rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Transcript Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Texte dicté</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(transcript)}
                    disabled={!transcript}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Le texte dicté apparaîtra ici... Vous pouvez aussi taper directement."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Convert Button */}
            {!autoConvert && (
              <div className="flex justify-center">
                <button
                  onClick={convertToMorse}
                  disabled={!transcript.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Convertir en Morse
                </button>
              </div>
            )}

            {/* Morse Output */}
            {morseOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Code Morse généré</label>
                  <button
                    onClick={() => copyToClipboard(morseOutput)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-mono text-lg text-gray-800 mb-4 break-all">
                    {morseOutput}
                  </div>
                  <AudioPlayer 
                    morse={morseOutput}
                    autoPlay={autoPlay}
                    className="justify-center"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-600 text-white p-4">
            <h3 className="font-semibold">Historique des dictées</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer" onClick={() => restoreFromHistory(entry)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(entry.morse);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm text-gray-800 mb-1">
                  <strong>Texte:</strong> {entry.text}
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  <strong>Morse:</strong> {entry.morse}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}