import { useState } from 'react';
import { Brain, Search } from 'lucide-react';
import { MORSE_CODE, LETTER_MNEMONICS } from '../utils/morse';
import AudioPlayer from './AudioPlayer';

export default function MnemonicsHelper() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'letters' | 'numbers' | 'punctuation'>('all');

  const getFilteredItems = () => {
    let items = Object.keys(MORSE_CODE);
    
    switch (selectedCategory) {
      case 'letters':
        items = items.filter(key => key.match(/[A-Z]/));
        break;
      case 'numbers':
        items = items.filter(key => key.match(/[0-9]/));
        break;
      case 'punctuation':
        items = items.filter(key => !key.match(/[A-Z0-9]/));
        break;
    }
    
    if (searchTerm) {
      items = items.filter(key => 
        key.includes(searchTerm.toUpperCase()) ||
        (LETTER_MNEMONICS[key] && 
         LETTER_MNEMONICS[key].word.toUpperCase().includes(searchTerm.toUpperCase()))
      );
    }
    
    return items.sort();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'letters': return 'bg-blue-100 text-blue-800';
      case 'numbers': return 'bg-green-100 text-green-800';
      case 'punctuation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemCategory = (item: string) => {
    if (item.match(/[A-Z]/)) return 'letters';
    if (item.match(/[0-9]/)) return 'numbers';
    return 'punctuation';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center justify-center space-x-2">
          <Brain className="w-6 h-6 text-amber-600" />
          <span>Aide-mémoire Morse</span>
        </h2>
        <p className="text-gray-600">Techniques mnémotechniques pour mémoriser le code Morse</p>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une lettre, chiffre ou mot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {(['all', 'letters', 'numbers', 'punctuation'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'Tout' : 
               cat === 'letters' ? 'Lettres' :
               cat === 'numbers' ? 'Chiffres' : 'Ponctuation'}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des caractères */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredItems().map(item => (
          <div key={item} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-slate-800 bg-white rounded-lg w-12 h-12 flex items-center justify-center">
                  {item}
                </div>
                <div className="font-mono text-lg text-emerald-600 font-semibold">
                  {MORSE_CODE[item]}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(getItemCategory(item))}`}>
                {getItemCategory(item) === 'letters' ? 'Lettre' :
                 getItemCategory(item) === 'numbers' ? 'Chiffre' : 'Ponctuation'}
              </span>
            </div>

            {LETTER_MNEMONICS[item] && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    {LETTER_MNEMONICS[item].word}
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 italic">
                  "{LETTER_MNEMONICS[item].phrase}"
                </div>
                
                <div className="text-xs text-gray-600">
                  {LETTER_MNEMONICS[item].description}
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <AudioPlayer morse={MORSE_CODE[item]} className="scale-75" />
                </div>
              </div>
            )}

            {!LETTER_MNEMONICS[item] && (
              <div className="pt-2">
                <AudioPlayer morse={MORSE_CODE[item]} className="scale-75" />
              </div>
            )}
          </div>
        ))}
      </div>

      {getFilteredItems().length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun résultat trouvé pour "{searchTerm}"</p>
        </div>
      )}

      {/* Conseils d'apprentissage */}
      <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>Conseils pour mémoriser</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
          <div>
            <h4 className="font-medium mb-2">Méthode rythmique</h4>
            <p>Associez chaque lettre à un rythme musical. Les points sont des notes courtes, les traits des notes longues.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Méthode phonétique</h4>
            <p>Utilisez les mots mnémotechniques fournis. Par exemple, "A-bout" pour A (.-)</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Méthode visuelle</h4>
            <p>Visualisez les lettres comme des formes. Le H (4 points) ressemble à une échelle.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Répétition espacée</h4>
            <p>Révisez les lettres difficiles plus souvent. Commencez par E et T, les plus simples.</p>
          </div>
        </div>
      </div>
    </div>
  );
}