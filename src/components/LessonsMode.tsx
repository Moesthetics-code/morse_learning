import React, { useState, useCallback } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Star, Lock, CheckCircle, Brain } from 'lucide-react';
import { MORSE_CODE, textToMorse, LETTER_MNEMONICS } from '../utils/morse';
import AudioPlayer from './AudioPlayer';

interface Lesson {
  id: number;
  title: string;
  description: string;
  letters: string[];
  words: string[];
  completed: boolean;
  unlocked: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface LessonProgress {
  correct: number;
  total: number;
  stars: number;
}

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Premiers pas - E",
    description: "La lettre la plus simple : un seul point",
    letters: ['E'],
    words: ['E'],
    completed: false,
    unlocked: true,
    difficulty: 'beginner'
  },
  {
    id: 2,
    title: "Ajout de T",
    description: "La lettre T : un seul trait",
    letters: ['E', 'T'],
    words: ['E', 'T', 'ET', 'TEE'],
    completed: false,
    unlocked: false,
    difficulty: 'beginner'
  },
  {
    id: 3,
    title: "Ajout de I et A",
    description: "I (2 points) et A (point-trait)",
    letters: ['E', 'T', 'I', 'A'],
    words: ['I', 'A', 'IT', 'AT', 'EAT', 'TEA', 'TIE', 'ATE'],
    completed: false,
    unlocked: false,
    difficulty: 'beginner'
  },
  {
    id: 4,
    title: "Groupe N et M",
    description: "N (trait-point) et M (trait-trait)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M'],
    words: ['N', 'M', 'AN', 'MAN', 'TEAM', 'MEAT', 'NAME', 'MEAN'],
    completed: false,
    unlocked: false,
    difficulty: 'beginner'
  },
  {
    id: 5,
    title: "Ajout de O et S",
    description: "O (3 traits) et S (3 points)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S'],
    words: ['O', 'S', 'SO', 'SOS', 'MOST', 'SOME', 'ATOMS', 'MOATS'],
    completed: false,
    unlocked: false,
    difficulty: 'beginner'
  },
  {
    id: 6,
    title: "Groupe R et U",
    description: "R (point-trait-point) et U (point-point-trait)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U'],
    words: ['R', 'U', 'RUN', 'TURN', 'RUST', 'MUST', 'STORM', 'ROAST'],
    completed: false,
    unlocked: false,
    difficulty: 'beginner'
  },
  {
    id: 7,
    title: "Groupe D et K",
    description: "D (trait-point-point) et K (trait-point-trait)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K'],
    words: ['D', 'K', 'DARK', 'DESK', 'MASK', 'DISK', 'DUSK', 'ASKED'],
    completed: false,
    unlocked: false,
    difficulty: 'beginner'
  },
  {
    id: 8,
    title: "Groupe G et W",
    description: "G (trait-trait-point) et W (point-trait-trait)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K', 'G', 'W'],
    words: ['G', 'W', 'GROW', 'WING', 'WAGER', 'WRONG', 'WAGON', 'GUARD'],
    completed: false,
    unlocked: false,
    difficulty: 'beginner'
  },
  {
    id: 9,
    title: "Groupe H et V",
    description: "H (4 points) et V (3 points + trait)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K', 'G', 'W', 'H', 'V'],
    words: ['H', 'V', 'HAVE', 'HOVER', 'HEAVY', 'VOICE', 'HARVEST', 'HEAVEN'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 10,
    title: "Groupe F et L",
    description: "F (point-point-trait-point) et L (point-trait-point-point)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K', 'G', 'W', 'H', 'V', 'F', 'L'],
    words: ['F', 'L', 'LIFE', 'LEAF', 'FLOW', 'FLAME', 'FLIGHT', 'FLOWER'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 11,
    title: "Groupe P et J",
    description: "P (point-trait-trait-point) et J (point-trait-trait-trait)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K', 'G', 'W', 'H', 'V', 'F', 'L', 'P', 'J'],
    words: ['P', 'J', 'JUMP', 'HELP', 'JAPAN', 'PAPER', 'PROJECT', 'JUNGLE'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 12,
    title: "Groupe B et C",
    description: "B (trait-3 points) et C (trait-point-trait-point)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K', 'G', 'W', 'H', 'V', 'F', 'L', 'P', 'J', 'B', 'C'],
    words: ['B', 'C', 'BACK', 'CLUB', 'BEACH', 'CLOCK', 'BRANCH', 'CHOICE'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 13,
    title: "Groupe Y et Q",
    description: "Y (trait-point-trait-trait) et Q (trait-trait-point-trait)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K', 'G', 'W', 'H', 'V', 'F', 'L', 'P', 'J', 'B', 'C', 'Y', 'Q'],
    words: ['Y', 'Q', 'YEAR', 'QUERY', 'YOUNG', 'QUICK', 'YELLOW', 'QUALITY'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 14,
    title: "Groupe X et Z",
    description: "X (trait-point-point-trait) et Z (trait-trait-point-point)",
    letters: ['E', 'T', 'I', 'A', 'N', 'M', 'O', 'S', 'R', 'U', 'D', 'K', 'G', 'W', 'H', 'V', 'F', 'L', 'P', 'J', 'B', 'C', 'Y', 'Q', 'X', 'Z'],
    words: ['X', 'Z', 'ZERO', 'ZONE', 'EXTRA', 'PRIZE', 'EXAMPLE', 'AMAZING'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 15,
    title: "Révision alphabet complet",
    description: "Tous les lettres de A à Z mélangées",
    letters: Object.keys(MORSE_CODE).filter(k => k.match(/[A-Z]/)),
    words: ['HELLO', 'WORLD', 'MORSE', 'CODE', 'RADIO', 'SIGNAL', 'ALPHABET', 'COMPLETE'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 16,
    title: "Chiffres 0-4",
    description: "Premiers chiffres du code Morse",
    letters: ['0', '1', '2', '3', '4'],
    words: ['0', '1', '2', '3', '4', '10', '20', '30', '40', '123', '234'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 17,
    title: "Chiffres 5-9",
    description: "Complétez les chiffres",
    letters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    words: ['5', '6', '7', '8', '9', '50', '60', '70', '80', '90', '567', '789'],
    completed: false,
    unlocked: false,
    difficulty: 'intermediate'
  },
  {
    id: 18,
    title: "Nombres complets",
    description: "Nombres à plusieurs chiffres",
    letters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    words: ['100', '200', '500', '1000', '2023', '1234', '5678', '9999'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 19,
    title: "Ponctuation de base",
    description: "Point, virgule et point d'interrogation",
    letters: ['.', ',', '?'],
    words: ['HELLO.', 'YES, NO', 'HOW?', 'WHAT?', 'OK.', 'HELP, PLEASE'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 20,
    title: "Ponctuation avancée",
    description: "Exclamation, parenthèses et autres signes",
    letters: ['.', ',', '?', '!', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '$', '@'],
    words: ['HELP!', 'WAIT...', 'YES & NO', 'TIME: 10:30', 'COST: $50', 'EMAIL@SITE'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 21,
    title: "Mots courants",
    description: "Vocabulaire de base pour la communication",
    letters: Object.keys(MORSE_CODE).filter(k => k.match(/[A-Z]/)),
    words: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BY', 'WORD', 'WHAT', 'SAID'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 22,
    title: "Messages d'urgence",
    description: "Signaux internationaux de détresse",
    letters: Object.keys(MORSE_CODE),
    words: ['SOS', 'MAYDAY', 'HELP', 'EMERGENCY', 'DISTRESS', 'RESCUE', 'URGENT', 'DANGER'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 23,
    title: "Communication maritime",
    description: "Termes nautiques et de navigation",
    letters: Object.keys(MORSE_CODE),
    words: ['SHIP', 'BOAT', 'PORT', 'ANCHOR', 'CAPTAIN', 'CREW', 'CARGO', 'LIGHTHOUSE', 'HARBOR', 'NAVIGATION'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 24,
    title: "Communication aéronautique",
    description: "Termes d'aviation et de pilotage",
    letters: Object.keys(MORSE_CODE),
    words: ['PLANE', 'PILOT', 'FLIGHT', 'AIRPORT', 'RUNWAY', 'TOWER', 'ALTITUDE', 'WEATHER', 'LANDING', 'TAKEOFF'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 25,
    title: "Phrases courtes",
    description: "Communication basique en phrases",
    letters: Object.keys(MORSE_CODE),
    words: ['HELLO WORLD', 'HOW ARE YOU', 'THANK YOU', 'GOOD MORNING', 'SEE YOU LATER', 'HAVE A NICE DAY'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 26,
    title: "Phrases complexes",
    description: "Communication avancée",
    letters: Object.keys(MORSE_CODE),
    words: ['WHAT TIME IS IT', 'WHERE ARE YOU GOING', 'PLEASE SEND HELP IMMEDIATELY', 'THE WEATHER IS VERY BAD TODAY', 'I NEED ASSISTANCE WITH NAVIGATION'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 27,
    title: "Codes Q internationaux",
    description: "Codes Q utilisés en radio",
    letters: Object.keys(MORSE_CODE),
    words: ['QTH', 'QSL', 'QRT', 'QRZ', 'QSO', 'QRM', 'QRN', 'QSB'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  },
  {
    id: 28,
    title: "Maître du Morse",
    description: "Test final - tous les éléments mélangés",
    letters: Object.keys(MORSE_CODE),
    words: ['CONGRATULATIONS! YOU ARE NOW A MORSE CODE MASTER.', 'READY FOR REAL WORLD COMMUNICATION.', 'PRACTICE MAKES PERFECT.', 'KEEP LEARNING AND IMPROVING.'],
    completed: false,
    unlocked: false,
    difficulty: 'advanced'
  }
];

export default function LessonsMode() {
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS);
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const [currentExercise, setCurrentExercise] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [exerciseAnswered, setExerciseAnswered] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({
    correct: 0,
    total: 0,
    stars: 0
  });
  const [showMnemonics, setShowMnemonics] = useState(false);

  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];
  const currentWord = currentLesson.words[currentExercise] || '';
  const currentMorse = textToMorse(currentWord).output;

  const checkAnswer = useCallback(() => {
    const isCorrect = userAnswer.toUpperCase().replace(/\s+/g, ' ').trim() === currentWord;
    setShowAnswer(true);
    setExerciseAnswered(true);

    setLessonProgress(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    return isCorrect;
  }, [userAnswer, currentWord]);

  const nextExercise = useCallback(() => {
    if (currentExercise < currentLesson.words.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
      setExerciseAnswered(false);
    } else {
      // Fin de la leçon
      const accuracy = lessonProgress.total > 0 ? (lessonProgress.correct + (showAnswer && userAnswer.toUpperCase().replace(/\s+/g, ' ').trim() === currentWord ? 1 : 0)) / (lessonProgress.total + 1) : 0;
      const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;

      setLessons(prev => prev.map(lesson => {
        if (lesson.id === currentLessonId) {
          return { ...lesson, completed: true };
        }
        if (lesson.id === currentLessonId + 1) {
          return { ...lesson, unlocked: stars >= 1 };
        }
        return lesson;
      }));

      setLessonProgress(prev => ({ ...prev, stars }));
    }
  }, [currentExercise, currentLesson.words.length, lessonProgress, showAnswer, userAnswer, currentWord, currentLessonId]);

  const restartLesson = useCallback(() => {
    setCurrentExercise(0);
    setUserAnswer('');
    setShowAnswer(false);
    setExerciseAnswered(false);
    setLessonProgress({ correct: 0, total: 0, stars: 0 });
  }, []);

  const selectLesson = useCallback((lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson && lesson.unlocked) {
      setCurrentLessonId(lessonId);
      restartLesson();
    }
  }, [lessons, restartLesson]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!exerciseAnswered) {
        checkAnswer();
      } else {
        nextExercise();
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-amber-100 text-amber-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isLessonComplete = currentExercise >= currentLesson.words.length;

  return (
    <div className="space-y-6">
      {/* Sélection des leçons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          <span>Leçons d'apprentissage</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => selectLesson(lesson.id)}
              disabled={!lesson.unlocked}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                lesson.id === currentLessonId
                  ? 'border-emerald-500 bg-emerald-50'
                  : lesson.unlocked
                  ? 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Leçon {lesson.id}</span>
                <div className="flex items-center space-x-1">
                  {lesson.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {!lesson.unlocked && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              
              <h3 className="font-medium text-slate-800 mb-1">{lesson.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{lesson.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(lesson.difficulty)}`}>
                  {lesson.difficulty === 'beginner' ? 'Débutant' : 
                   lesson.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                </span>
                
                {lesson.completed && (
                  <div className="flex">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= lessonProgress.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Leçon actuelle */}
      {!isLessonComplete ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{currentLesson.title}</h3>
              <p className="text-gray-600">{currentLesson.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Exercice</div>
              <div className="text-lg font-bold text-slate-800">
                {currentExercise + 1} / {currentLesson.words.length}
              </div>
            </div>
          </div>

          {/* Alphabet de référence pour la leçon */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Alphabet pour cette leçon :</h4>
              <button
                onClick={() => setShowMnemonics(!showMnemonics)}
                className="flex items-center space-x-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md hover:bg-amber-200 transition-colors"
              >
                <Brain className="w-3 h-3" />
                <span>{showMnemonics ? 'Masquer' : 'Aide mémoire'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentLesson.letters.map(letter => (
                <div key={letter} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-lg text-slate-800">{letter}</div>
                    <div className="font-mono text-sm text-emerald-600 font-semibold">{MORSE_CODE[letter]}</div>
                  </div>
                  {showMnemonics && LETTER_MNEMONICS[letter] && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="font-medium text-amber-700">{LETTER_MNEMONICS[letter].word}</div>
                      <div className="italic">"{LETTER_MNEMONICS[letter].phrase}"</div>
                      <div className="text-gray-500">{LETTER_MNEMONICS[letter].description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exercice actuel */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-mono text-slate-800 mb-4 tracking-wider">
                {currentMorse}
              </div>
              <AudioPlayer morse={currentMorse} className="justify-center" />
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre réponse ici..."
                disabled={exerciseAnswered}
                className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition-colors ${
                  showAnswer
                    ? userAnswer.toUpperCase().replace(/\s+/g, ' ').trim() === currentWord
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-emerald-500'
                }`}
              />

              {showAnswer && (
                <div className={`p-3 rounded-lg ${
                  userAnswer.toUpperCase().replace(/\s+/g, ' ').trim() === currentWord
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {userAnswer.toUpperCase().replace(/\s+/g, ' ').trim() === currentWord ? (
                    <span>✅ Correct !</span>
                  ) : (
                    <span>❌ Incorrect. La réponse était : <strong>{currentWord}</strong></span>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                {!exerciseAnswered ? (
                  <button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Vérifier
                  </button>
                ) : (
                  <button
                    onClick={nextExercise}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>{currentExercise < currentLesson.words.length - 1 ? 'Suivant' : 'Terminer la leçon'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progression de la leçon */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progression: {lessonProgress.correct}/{lessonProgress.total} correct{lessonProgress.total > 1 ? 's' : ''}</span>
              <span>
                {lessonProgress.total > 0 
                  ? Math.round((lessonProgress.correct / lessonProgress.total) * 100) 
                  : 0}% de réussite
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentExercise + (exerciseAnswered ? 1 : 0)) / currentLesson.words.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Résultats de la leçon */
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Leçon terminée !</h3>
            <p className="text-gray-600">Bravo, vous avez terminé "{currentLesson.title}"</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">{lessonProgress.correct}</div>
              <div className="text-sm text-emerald-700">Correctes</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600">
                {lessonProgress.total > 0 
                  ? Math.round((lessonProgress.correct / lessonProgress.total) * 100) 
                  : 0}%
              </div>
              <div className="text-sm text-amber-700">Précision</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex justify-center mb-1">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= lessonProgress.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-purple-700">Étoiles</div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={restartLesson}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Refaire</span>
            </button>
            
            {currentLessonId < lessons.length && lessons[currentLessonId]?.unlocked && (
              <button
                onClick={() => selectLesson(currentLessonId + 1)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Leçon suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}