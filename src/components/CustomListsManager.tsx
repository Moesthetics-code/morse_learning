/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Plus, Trash2, Edit3, Save, X, FileText } from 'lucide-react';

export interface CustomList {
  id: string;
  name: string;
  description: string;
  words: string[];
  category: 'personal' | 'professional' | 'technical' | 'emergency' | 'other';
  createdAt: Date;
  updatedAt: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CustomListsManagerProps {
  onListSelected?: (list: CustomList) => void;
  onListsChanged?: (lists: CustomList[]) => void;
}

const CATEGORY_COLORS = {
  personal: 'bg-blue-100 text-blue-800',
  professional: 'bg-green-100 text-green-800',
  technical: 'bg-purple-100 text-purple-800',
  emergency: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800'
};

const SAMPLE_LISTS: Partial<CustomList>[] = [
  {
    name: 'Urgences Médicales',
    description: 'Termes médicaux d\'urgence',
    category: 'emergency',
    difficulty: 'medium',
    words: ['DOCTOR', 'HOSPITAL', 'AMBULANCE', 'MEDICINE', 'EMERGENCY', 'URGENT', 'HELP', 'PAIN', 'INJURY', 'RESCUE']
  },
  {
    name: 'Technologie',
    description: 'Vocabulaire informatique et technique',
    category: 'technical',
    difficulty: 'hard',
    words: ['COMPUTER', 'SOFTWARE', 'HARDWARE', 'INTERNET', 'DATABASE', 'NETWORK', 'SECURITY', 'PROGRAMMING', 'ALGORITHM', 'SYSTEM']
  },
  {
    name: 'Famille',
    description: 'Mots liés à la famille',
    category: 'personal',
    difficulty: 'easy',
    words: ['MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'FAMILY', 'HOME', 'LOVE', 'CHILD', 'PARENT', 'GRANDMA']
  }
];

export default function CustomListsManager({ onListSelected, onListsChanged }: CustomListsManagerProps) {
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [editingList, setEditingList] = useState<CustomList | null>(null);
  const [newListForm, setNewListForm] = useState<{
    name: string;
    description: string;
    category: CustomList['category'];
    difficulty: CustomList['difficulty'];
    words: string[];
    wordsText: string;
  }>({
    name: '',
    description: '',
    category: 'other',
    difficulty: 'medium',
    words: [],
    wordsText: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveToLocalStorage = useCallback((lists: CustomList[]) => {
    try {
      localStorage.setItem('morse_custom_lists', JSON.stringify(lists));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('morse_custom_lists');
      if (saved) {
        const parsed = JSON.parse(saved);
        const lists = parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt)
        }));
        setCustomLists(lists);
        return lists;
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
    return [];
  }, []);

  // Load lists on component mount
  React.useEffect(() => {
    const lists = loadFromLocalStorage();
    if (onListsChanged) {
      onListsChanged(lists);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array vide pour n'exécuter qu'au montage

  const createList = useCallback(() => {
    const words = newListForm.wordsText
      .split('\n')
      .map(word => word.trim().toUpperCase())
      .filter(word => word.length > 0);

    if (!newListForm.name.trim() || words.length === 0) {
      return;
    }

    const newList: CustomList = {
      id: Date.now().toString(),
      name: newListForm.name.trim(),
      description: newListForm.description.trim(),
      category: newListForm.category,
      difficulty: newListForm.difficulty,
      words: words,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedLists = [...customLists, newList];
    setCustomLists(updatedLists);
    saveToLocalStorage(updatedLists);
    
    if (onListsChanged) {
      onListsChanged(updatedLists);
    }

    // Reset form
    setNewListForm({
      name: '',
      description: '',
      category: 'other',
      difficulty: 'medium',
      words: [],
      wordsText: ''
    });
    setShowCreateForm(false);
  }, [newListForm, customLists, saveToLocalStorage, onListsChanged]);

  const updateList = useCallback((updatedList: CustomList) => {
    const updatedLists = customLists.map(list => 
      list.id === updatedList.id 
        ? { ...updatedList, updatedAt: new Date() }
        : list
    );
    
    setCustomLists(updatedLists);
    saveToLocalStorage(updatedLists);
    setEditingList(null);
    
    if (onListsChanged) {
      onListsChanged(updatedLists);
    }
  }, [customLists, saveToLocalStorage, onListsChanged]);

  const deleteList = useCallback((listId: string) => {
    const updatedLists = customLists.filter(list => list.id !== listId);
    setCustomLists(updatedLists);
    saveToLocalStorage(updatedLists);
    
    if (onListsChanged) {
      onListsChanged(updatedLists);
    }
  }, [customLists, saveToLocalStorage, onListsChanged]);

  const exportList = useCallback((list: CustomList) => {
    const exportData = {
      ...list,
      exportedAt: new Date().toISOString(),
      morseVersion: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `morse-list-${list.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, []);

  const exportAllLists = useCallback(() => {
    const exportData = {
      lists: customLists,
      exportedAt: new Date().toISOString(),
      morseVersion: '1.0',
      totalLists: customLists.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `morse-all-lists-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [customLists]);

  const importLists = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        setImportError(null);
        
        // Handle different import formats
        let listsToImport: CustomList[] = [];
        
        if (data.lists && Array.isArray(data.lists)) {
          // Multi-list export format
          listsToImport = data.lists;
        } else if (data.words && Array.isArray(data.words)) {
          // Single list format
          listsToImport = [data as CustomList];
        } else {
          throw new Error('Format de fichier non reconnu');
        }

        // Validate and process imported lists
        const processedLists: CustomList[] = [];
        
        for (const listData of listsToImport) {
          if (!listData.name || !Array.isArray(listData.words)) {
            continue;
          }
          
          const processedList: CustomList = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: listData.name + ' (importé)',
            description: listData.description || '',
            category: listData.category || 'other',
            difficulty: listData.difficulty || 'medium',
            words: listData.words.filter(word => typeof word === 'string' && word.trim().length > 0),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          if (processedList.words.length > 0) {
            processedLists.push(processedList);
          }
        }
        
        if (processedLists.length === 0) {
          throw new Error('Aucune liste valide trouvée dans le fichier');
        }
        
        // Add imported lists
        const updatedLists = [...customLists, ...processedLists];
        setCustomLists(updatedLists);
        saveToLocalStorage(updatedLists);
        
        if (onListsChanged) {
          onListsChanged(updatedLists);
        }
        
      } catch (error) {
        setImportError(`Erreur d'importation: ${error instanceof Error ? error.message : 'Format invalide'}`);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }, [customLists, saveToLocalStorage, onListsChanged]);

  const createSampleList = useCallback((sample: Partial<CustomList>) => {
    const newList: CustomList = {
      id: Date.now().toString(),
      name: sample.name!,
      description: sample.description!,
      category: sample.category!,
      difficulty: sample.difficulty!,
      words: sample.words!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedLists = [...customLists, newList];
    setCustomLists(updatedLists);
    saveToLocalStorage(updatedLists);
    
    if (onListsChanged) {
      onListsChanged(updatedLists);
    }
  }, [customLists, saveToLocalStorage, onListsChanged]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-green-600" />
            <span>Listes Personnalisées</span>
          </h2>
          <p className="text-gray-600">Créez et gérez vos propres listes de mots d'entraînement</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          
          <button
            onClick={exportAllLists}
            disabled={customLists.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter tout</span>
          </button>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Créer</span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importLists}
        style={{ display: 'none' }}
      />

      {/* Import Error */}
      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{importError}</div>
          <button
            onClick={() => setImportError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Créer une nouvelle liste</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la liste
                </label>
                <input
                  type="text"
                  value={newListForm.name}
                  onChange={(e) => setNewListForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Vocabulaire médical"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={newListForm.category}
                  onChange={(e) => setNewListForm(prev => ({ ...prev, category: e.target.value as CustomList['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="personal">Personnel</option>
                  <option value="professional">Professionnel</option>
                  <option value="technical">Technique</option>
                  <option value="emergency">Urgence</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newListForm.description}
                  onChange={(e) => setNewListForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Description optionnelle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulté
                </label>
                <select
                  value={newListForm.difficulty}
                  onChange={(e) => setNewListForm(prev => ({ ...prev, difficulty: e.target.value as CustomList['difficulty'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mots (un par ligne)
              </label>
              <textarea
                value={newListForm.wordsText}
                onChange={(e) => setNewListForm(prev => ({ ...prev, wordsText: e.target.value }))}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="HELLO&#10;WORLD&#10;MORSE&#10;CODE"
              />
              <div className="text-sm text-gray-500 mt-1">
                {newListForm.wordsText.split('\n').filter(w => w.trim()).length} mots
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createList}
                disabled={!newListForm.name.trim() || !newListForm.wordsText.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Créer la liste</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Lists */}
      {customLists.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Listes d'exemple</h3>
          <p className="text-gray-600 mb-4">Commencez avec ces listes prêtes à l'emploi :</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_LISTS.map((sample, index) => (
              <div key={index} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{sample.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${CATEGORY_COLORS[sample.category!]}`}>
                    {sample.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{sample.description}</p>
                <div className="text-xs text-gray-500 mb-3">
                  {sample.words?.length} mots • {sample.difficulty}
                </div>
                <button
                  onClick={() => createSampleList(sample)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Ajouter cette liste
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customLists.map(list => (
          <div key={list.id} className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 truncate">{list.name}</h3>
                <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${CATEGORY_COLORS[list.category]}`}>
                  {list.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{list.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{list.words.length} mots</span>
                <span>{list.difficulty}</span>
                <span>{list.updatedAt.toLocaleDateString()}</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onListSelected && onListSelected(list)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Utiliser
                </button>
                
                <button
                  onClick={() => setEditingList(list)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => exportList(list)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => deleteList(list.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Modifier la liste</h3>
                <button
                  onClick={() => setEditingList(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la liste
                    </label>
                    <input
                      type="text"
                      value={editingList.name}
                      onChange={(e) => setEditingList(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={editingList.category}
                      onChange={(e) => setEditingList(prev => prev ? { ...prev, category: e.target.value as CustomList['category'] } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="personal">Personnel</option>
                      <option value="professional">Professionnel</option>
                      <option value="technical">Technique</option>
                      <option value="emergency">Urgence</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingList.description}
                    onChange={(e) => setEditingList(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulté
                  </label>
                  <select
                    value={editingList.difficulty}
                    onChange={(e) => setEditingList(prev => prev ? { ...prev, difficulty: e.target.value as CustomList['difficulty'] } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mots (un par ligne)
                  </label>
                  <textarea
                    value={editingList.words.join('\n')}
                    onChange={(e) => setEditingList(prev => prev ? { 
                      ...prev, 
                      words: e.target.value.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0)
                    } : null)}
                    className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {editingList.words.length} mots
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingList(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => updateList(editingList)}
                    disabled={!editingList.name.trim() || editingList.words.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}