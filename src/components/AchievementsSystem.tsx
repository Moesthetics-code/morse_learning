/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Award, Star, Target, Zap, Clock, Medal, Crown } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'learning' | 'speed' | 'accuracy' | 'milestone' | 'special';
  requirement: {
    type: 'total_correct' | 'streak' | 'accuracy' | 'wpm' | 'lessons_completed' | 'time_played' | 'perfect_lesson';
    value: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ACHIEVEMENTS: Achievement[] = [
  // Learning Achievements
  {
    id: 'first_steps',
    name: 'Premiers Pas',
    description: 'Complétez votre première leçon',
    icon: Star,
    category: 'learning',
    requirement: { type: 'lessons_completed', value: 1 },
    rarity: 'common',
    points: 10,
    unlocked: false
  },
  {
    id: 'dedicated_learner',
    name: 'Apprenant Dévoué',
    description: 'Complétez 10 leçons',
    icon: Award,
    category: 'learning',
    requirement: { type: 'lessons_completed', value: 10 },
    rarity: 'rare',
    points: 50,
    unlocked: false
  },
  {
    id: 'morse_master',
    name: 'Maître du Morse',
    description: 'Complétez toutes les leçons',
    icon: Crown,
    category: 'learning',
    requirement: { type: 'lessons_completed', value: 28 },
    rarity: 'legendary',
    points: 200,
    unlocked: false
  },
  
  // Accuracy Achievements
  {
    id: 'sharp_shooter',
    name: 'Tireur d\'Élite',
    description: 'Atteignez 90% de précision',
    icon: Target,
    category: 'accuracy',
    requirement: { type: 'accuracy', value: 90 },
    rarity: 'rare',
    points: 75,
    unlocked: false
  },
  {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Complétez une leçon avec 100% de réussite',
    icon: Medal,
    category: 'accuracy',
    requirement: { type: 'perfect_lesson', value: 1 },
    rarity: 'epic',
    points: 100,
    unlocked: false
  },
  
  // Speed Achievements
  {
    id: 'speed_demon',
    name: 'Démon de Vitesse',
    description: 'Atteignez 20 WPM',
    icon: Zap,
    category: 'speed',
    requirement: { type: 'wpm', value: 20 },
    rarity: 'rare',
    points: 80,
    unlocked: false
  },
  {
    id: 'lightning_fast',
    name: 'Rapide comme l\'Éclair',
    description: 'Atteignez 40 WPM',
    icon: Clock,
    category: 'speed',
    requirement: { type: 'wpm', value: 40 },
    rarity: 'legendary',
    points: 150,
    unlocked: false
  },
  
  // Milestone Achievements
  {
    id: 'century_club',
    name: 'Club des Cent',
    description: 'Répondez correctement à 100 questions',
    icon: Trophy,
    category: 'milestone',
    requirement: { type: 'total_correct', value: 100 },
    rarity: 'common',
    points: 25,
    unlocked: false
  },
  {
    id: 'thousand_club',
    name: 'Club des Mille',
    description: 'Répondez correctement à 1000 questions',
    icon: Trophy,
    category: 'milestone',
    requirement: { type: 'total_correct', value: 1000 },
    rarity: 'epic',
    points: 100,
    unlocked: false
  },
  {
    id: 'hot_streak',
    name: 'Série Chaude',
    description: 'Obtenez 10 bonnes réponses d\'affilée',
    icon: Star,
    category: 'milestone',
    requirement: { type: 'streak', value: 10 },
    rarity: 'rare',
    points: 60,
    unlocked: false
  }
];

interface AchievementsSystemProps {
  userStats: {
    totalCorrect: number;
    currentStreak: number;
    bestAccuracy: number;
    bestWPM: number;
    lessonsCompleted: number;
    timePlayedMinutes: number;
    perfectLessons: number;
  };
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAchievements(userStats: AchievementsSystemProps['userStats']) {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const checkAchievements = useCallback(() => {
    const newlyUnlocked: Achievement[] = [];
    
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let isUnlocked = false;
      let progress = 0;
      const maxProgress = achievement.requirement.value;
      
      switch (achievement.requirement.type) {
        case 'total_correct':
          progress = userStats.totalCorrect;
          isUnlocked = userStats.totalCorrect >= achievement.requirement.value;
          break;
        case 'streak':
          progress = userStats.currentStreak;
          isUnlocked = userStats.currentStreak >= achievement.requirement.value;
          break;
        case 'accuracy':
          progress = userStats.bestAccuracy;
          isUnlocked = userStats.bestAccuracy >= achievement.requirement.value;
          break;
        case 'wpm':
          progress = userStats.bestWPM;
          isUnlocked = userStats.bestWPM >= achievement.requirement.value;
          break;
        case 'lessons_completed':
          progress = userStats.lessonsCompleted;
          isUnlocked = userStats.lessonsCompleted >= achievement.requirement.value;
          break;
        case 'time_played':
          progress = userStats.timePlayedMinutes;
          isUnlocked = userStats.timePlayedMinutes >= achievement.requirement.value;
          break;
        case 'perfect_lesson':
          progress = userStats.perfectLessons;
          isUnlocked = userStats.perfectLessons >= achievement.requirement.value;
          break;
      }
      
      if (isUnlocked && !achievement.unlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date(),
          progress: maxProgress,
          maxProgress
        };
        newlyUnlocked.push(unlockedAchievement);
        return unlockedAchievement;
      }
      
      return {
        ...achievement,
        progress,
        maxProgress
      };
    }));
    
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
    }
  }, [userStats]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  const getTotalPoints = () => {
    return achievements.filter(a => a.unlocked).reduce((total, a) => total + a.points, 0);
  };

  const getProgressPercentage = () => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    return Math.round((unlockedCount / achievements.length) * 100);
  };

  const dismissNewAchievements = () => {
    setNewAchievements([]);
  };

  return {
    achievements,
    newAchievements,
    getTotalPoints,
    getProgressPercentage,
    dismissNewAchievements
  };
}

export default function AchievementsSystem({ userStats, onAchievementUnlocked }: AchievementsSystemProps) {
  const { achievements, newAchievements, getTotalPoints, getProgressPercentage, dismissNewAchievements } = useAchievements(userStats);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 text-gray-700';
      case 'rare': return 'border-blue-300 bg-blue-50 text-blue-700';
      case 'epic': return 'border-purple-300 bg-purple-50 text-purple-700';
      case 'legendary': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
    }
  };

  const getRarityIcon = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return '⚪';
      case 'rare': return '🔵';
      case 'epic': return '🟣';
      case 'legendary': return '🟡';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'learning': return Star;
      case 'speed': return Zap;
      case 'accuracy': return Target;
      case 'milestone': return Trophy;
      case 'special': return Medal;
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  // Notification for new achievements
  useEffect(() => {
    if (newAchievements.length > 0 && onAchievementUnlocked) {
      newAchievements.forEach(onAchievementUnlocked);
    }
  }, [newAchievements, onAchievementUnlocked]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <span>Succès et Badges</span>
        </h2>
        <p className="text-gray-600">Débloquez des récompenses en progressant dans votre apprentissage</p>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{getTotalPoints()}</div>
            <div className="text-sm text-gray-600">Points totaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
            <div className="text-sm text-gray-600">Succès débloqués</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getProgressPercentage()}%</div>
            <div className="text-sm text-gray-600">Progression</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* New Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Nouveau succès débloqué !</span>
            </h3>
            <button
              onClick={dismissNewAchievements}
              className="text-white hover:text-yellow-200 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            {newAchievements.map(achievement => {
              const IconComponent = achievement.icon;
              return (
                <div key={achievement.id} className="flex items-center space-x-3 bg-white/20 rounded-lg p-3">
                  <IconComponent className="w-8 h-8" />
                  <div>
                    <div className="font-bold">{achievement.name}</div>
                    <div className="text-sm opacity-90">{achievement.description}</div>
                    <div className="text-xs">+{achievement.points} points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'learning', 'speed', 'accuracy', 'milestone', 'special'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Tous' : 
               category === 'learning' ? 'Apprentissage' :
               category === 'speed' ? 'Vitesse' :
               category === 'accuracy' ? 'Précision' :
               category === 'milestone' ? 'Étapes' : 'Spéciaux'}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const IconComponent = achievement.icon;
          const CategoryIcon = getCategoryIcon(achievement.category);
          
          return (
            <div
              key={achievement.id}
              className={`rounded-lg p-4 border-2 transition-all duration-200 ${
                achievement.unlocked 
                  ? getRarityColor(achievement.rarity) + ' shadow-md'
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <IconComponent className={`w-6 h-6 ${achievement.unlocked ? '' : 'text-gray-400'}`} />
                  <CategoryIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">{getRarityIcon(achievement.rarity)}</span>
                  <span className="text-xs font-bold text-purple-600">
                    {achievement.points}pts
                  </span>
                </div>
              </div>
              
              <h3 className={`font-bold mb-1 ${achievement.unlocked ? '' : 'text-gray-500'}`}>
                {achievement.name}
              </h3>
              <p className={`text-sm mb-3 ${achievement.unlocked ? '' : 'text-gray-400'}`}>
                {achievement.description}
              </p>
              
              {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
              
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  Débloqué le {achievement.unlockedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}