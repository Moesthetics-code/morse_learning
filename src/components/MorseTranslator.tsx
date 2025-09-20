import { ArrowUpDown, Trash2, Copy, History } from 'lucide-react';
import { useMorse } from '../hooks/useMorse';
import { validateMorseInput } from '../utils/morse';
import AudioPlayer from './AudioPlayer';
import VisualPlayer from './VisualPlayer';

export default function MorseTranslator() {
  const {
    textInput,
    setTextInput,
    morseInput,
    setMorseInput,
    history,
    encodeToMorse,
    decodeFromMorse,
    clearAll,
    clearHistory
  } = useMorse();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Vous pourriez ajouter une notification toast ici
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const isMorseValid = validateMorseInput(morseInput);

  return (
    <div className="space-y-6">
      {/* Traducteur principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Traducteur Morse</h2>
          <p className="opacity-90">Convertissez du texte en code Morse et vice versa</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Zone de texte */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Texte normal</label>
              <button
                onClick={() => copyToClipboard(textInput)}
                disabled={!textInput}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tapez votre texte ici..."
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Boutons de conversion */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={encodeToMorse}
              disabled={!textInput.trim()}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Encoder en Morse</span>
            </button>
            
            <button
              onClick={decodeFromMorse}
              disabled={!morseInput.trim() || !isMorseValid}
              className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Décoder du Morse</span>
            </button>
          </div>

          {/* Zone de morse */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Code Morse</label>
              <button
                onClick={() => copyToClipboard(morseInput)}
                disabled={!morseInput}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={morseInput}
              onChange={(e) => setMorseInput(e.target.value)}
              placeholder="Ou votre code Morse ici... (utilisez . - / pour espace)"
              className={`w-full h-24 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none font-mono ${
                morseInput && !isMorseValid
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-emerald-500'
              }`}
            />
            {morseInput && !isMorseValid && (
              <p className="text-red-600 text-sm mt-1">
                Caractères invalides détectés. Utilisez seulement: . - / et espaces
              </p>
            )}
          </div>

          {/* Lecteurs audio et visuels */}
          {morseInput && isMorseValid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <AudioPlayer morse={morseInput} />
              <VisualPlayer morse={morseInput} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={clearAll}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Effacer tout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <h3 className="font-semibold">Historique</h3>
            </div>
            <button
              onClick={clearHistory}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {history.map((item) => (
              <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    item.type === 'encode' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.type === 'encode' ? 'Encodage' : 'Décodage'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Entrée:</span> {item.input}
                  </div>
                  <div className="text-sm text-gray-800 font-mono">
                    <span className="font-medium">Sortie:</span> {item.output}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}