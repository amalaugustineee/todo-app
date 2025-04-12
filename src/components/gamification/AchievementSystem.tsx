import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  TrophyIcon, 
  FireIcon, 
  ChartBarIcon, 
  XMarkIcon,
  StarIcon,
  ClockIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ChevronRightIcon,
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
  progress: number;
  progressMax: number;
  category: 'tasks' | 'habits' | 'focus' | 'special';
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  pointValue: number;
  dateUnlocked?: Date;
}

// Achievement colors by rarity
const RARITY_COLORS = {
  common: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-500 dark:text-blue-300'
  },
  uncommon: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-500 dark:text-green-300'
  },
  rare: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-800 dark:text-purple-200',
    icon: 'text-purple-500 dark:text-purple-300'
  },
  legendary: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
    icon: 'text-amber-500 dark:text-amber-300'
  }
};

const AchievementSystem: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'tasks' | 'habits' | 'focus'>('all');
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);
  const tasks = useAppSelector(state => state.tasks.tasks);
  
  // Simulate loading achievements on mount
  useEffect(() => {
    const sampleAchievements: Achievement[] = [
      {
        id: '1',
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: <CheckCircleIcon className="w-6 h-6" />,
        unlocked: tasks.filter(t => t.status === 'completed').length > 0,
        progress: Math.min(tasks.filter(t => t.status === 'completed').length, 1),
        progressMax: 1,
        category: 'tasks',
        color: '#4ade80',
        rarity: 'common',
        pointValue: 10,
        dateUnlocked: tasks.filter(t => t.status === 'completed').length > 0 ? new Date() : undefined
      },
      {
        id: '2',
        name: 'Focused Mind',
        description: 'Complete 5 Pomodoro sessions',
        icon: <FireIcon className="w-6 h-6" />,
        unlocked: false,
        progress: 2,
        progressMax: 5,
        category: 'focus',
        color: '#f97316',
        rarity: 'uncommon',
        pointValue: 25
      },
      {
        id: '3',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: <StarIcon className="w-6 h-6" />,
        unlocked: tasks.filter(t => t.status === 'completed').length >= 10,
        progress: Math.min(tasks.filter(t => t.status === 'completed').length, 10),
        progressMax: 10,
        category: 'tasks',
        color: '#6366f1',
        rarity: 'uncommon',
        pointValue: 25,
        dateUnlocked: tasks.filter(t => t.status === 'completed').length >= 10 ? new Date() : undefined
      },
      {
        id: '4',
        name: 'Consistent Effort',
        description: 'Use the app for 5 consecutive days',
        icon: <FireIcon className="w-6 h-6" />,
        unlocked: streak >= 5,
        progress: Math.min(streak, 5),
        progressMax: 5,
        category: 'habits',
        color: '#f43f5e',
        rarity: 'uncommon',
        pointValue: 30,
        dateUnlocked: streak >= 5 ? new Date() : undefined
      },
      {
        id: '5',
        name: 'Priority Manager',
        description: 'Complete 5 high priority tasks',
        icon: <BoltIcon className="w-6 h-6" />,
        unlocked: tasks.filter(t => t.status === 'completed' && t.priority === 'high').length >= 5,
        progress: Math.min(tasks.filter(t => t.status === 'completed' && t.priority === 'high').length, 5),
        progressMax: 5,
        category: 'tasks',
        color: '#ec4899',
        rarity: 'rare',
        pointValue: 50,
        dateUnlocked: tasks.filter(t => t.status === 'completed' && t.priority === 'high').length >= 5 ? new Date() : undefined
      },
      {
        id: '6',
        name: 'Weekend Warrior',
        description: 'Complete tasks on both Saturday and Sunday',
        icon: <RocketLaunchIcon className="w-6 h-6" />,
        unlocked: false,
        progress: 1,
        progressMax: 2,
        category: 'habits',
        color: '#8b5cf6',
        rarity: 'rare',
        pointValue: 50
      },
      {
        id: '7',
        name: 'Productivity Legend',
        description: 'Complete all tasks for a week straight',
        icon: <TrophyIcon className="w-6 h-6" />,
        unlocked: false,
        progress: 3,
        progressMax: 7,
        category: 'habits',
        color: '#eab308',
        rarity: 'legendary',
        pointValue: 100
      }
    ];
    
    setAchievements(sampleAchievements);
    
    // Simulate streak calculation based on user's history
    setStreak(3);
    
    // Calculate total points
    const points = sampleAchievements
      .filter(a => a.unlocked)
      .reduce((sum, achievement) => sum + achievement.pointValue, 0);
      
    setTotalPoints(points);
    
    // Calculate level (1 level per 100 points)
    setLevel(Math.max(1, Math.floor(points / 100) + 1));
    
    // Check for recent unlock
    const recentlyUnlocked = sampleAchievements.find(a => 
      a.unlocked && a.dateUnlocked && 
      (new Date().getTime() - a.dateUnlocked.getTime()) < 24 * 60 * 60 * 1000
    );
    
    if (recentlyUnlocked) {
      setRecentUnlock(recentlyUnlocked);
      
      // Trigger confetti for recent unlock
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [tasks]);
  
  // Filter achievements based on filter state
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    if (['tasks', 'habits', 'focus'].includes(filter)) return achievement.category === filter;
    return true;
  });
  
  // Calculate progress stats
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const percentComplete = totalAchievements > 0 
    ? Math.round((unlockedAchievements / totalAchievements) * 100) 
    : 0;
    
  // Calculate XP needed for next level
  const xpForNextLevel = level * 100;
  const currentLevelXP = totalPoints % 100;
  const xpProgressPercent = (currentLevelXP / 100) * 100;
  
  // Animate new achievement unlock
  const dismissRecentUnlock = () => setRecentUnlock(null);
  
  return (
    <div className="achievement-system-content">
      {/* Level and Points Display */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 rounded-full bg-white/10"></div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-100">LEVEL</span>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-white">{level}</span>
              <span className="ml-1 text-xs text-blue-200">Productivity Master</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-blue-100">POINTS</span>
            <div className="flex items-center">
              <SparklesIcon className="w-4 h-4 text-yellow-300 mr-1" />
              <span className="text-xl font-bold text-white">{totalPoints}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-1 flex justify-between text-xs text-blue-100">
          <span>Level {level}</span>
          <span>Level {level + 1}</span>
        </div>
        <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 transition-all duration-1000"
            style={{ width: `${xpProgressPercent}%` }}
          ></div>
        </div>
        <div className="mt-1 text-center text-xs text-blue-100">
          <span>{currentLevelXP}/{xpForNextLevel} XP to next level</span>
        </div>
      </div>
      
      {/* Current Streak Display */}
      <div className="flex space-x-3">
        <div className="flex-1 bg-orange-100 dark:bg-orange-900/30 rounded-xl border border-orange-200 dark:border-orange-800 p-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-lg shadow-md">
              <FireIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-orange-800 dark:text-orange-200">{streak}</span>
                <span className="text-xs text-orange-600 dark:text-orange-300">days</span>
              </div>
              <span className="text-xs text-orange-600 dark:text-orange-400">Current streak</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 p-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-purple-400 to-indigo-500 p-2 rounded-lg shadow-md">
              <TrophyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">{unlockedAchievements}</span>
                <span className="text-xs text-purple-600 dark:text-purple-300">/{totalAchievements}</span>
              </div>
              <span className="text-xs text-purple-600 dark:text-purple-400">Achievements</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievement Filters */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <button 
          className={`text-xs font-medium py-2 px-3 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`text-xs font-medium py-2 px-3 rounded-lg transition-all ${
            filter === 'unlocked'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setFilter('unlocked')}
        >
          Unlocked
        </button>
        <button 
          className={`text-xs font-medium py-2 px-3 rounded-lg transition-all ${
            filter === 'locked'
              ? 'bg-gray-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setFilter('locked')}
        >
          Locked
        </button>
        <button 
          className={`text-xs font-medium py-2 px-3 rounded-lg transition-all ${
            filter === 'tasks'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setFilter('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`text-xs font-medium py-2 px-3 rounded-lg transition-all ${
            filter === 'habits'
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setFilter('habits')}
        >
          Habits
        </button>
        <button 
          className={`text-xs font-medium py-2 px-3 rounded-lg transition-all ${
            filter === 'focus'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setFilter('focus')}
        >
          Focus
        </button>
      </div>
      
      {/* Achievement List */}
      <div className="achievement-list mt-3">
        <AnimatePresence>
          {filteredAchievements.map(achievement => (
            <motion.div 
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden ${
                achievement.unlocked 
                  ? RARITY_COLORS[achievement.rarity].bg + ' ' + RARITY_COLORS[achievement.rarity].border
                  : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              } rounded-xl p-4 shadow-sm mb-3`}
            >
              {/* Rarity Badge */}
              {achievement.unlocked && (
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${RARITY_COLORS[achievement.rarity].text} bg-white/70 dark:bg-black/30`}>
                  {achievement.rarity}
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <div className={`min-w-[3.5rem] h-14 w-14 flex items-center justify-center rounded-xl shadow-sm ${
                  achievement.unlocked 
                    ? 'bg-white dark:bg-gray-900 ' + RARITY_COLORS[achievement.rarity].icon
                    : 'bg-white dark:bg-gray-700/80 text-gray-400 dark:text-gray-300'
                }`}>
                  {achievement.unlocked ? (
                    <div className="p-1.5">
                      {achievement.icon}
                    </div>
                  ) : (
                    <div className="relative p-1.5">
                      <div className="opacity-40">
                        {achievement.icon}
                      </div>
                      <LockClosedIcon className="w-4 h-4 absolute -bottom-1 -right-1 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold truncate ${
                    achievement.unlocked 
                      ? RARITY_COLORS[achievement.rarity].text
                      : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && (
                    <>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-400"
                          style={{ width: `${(achievement.progress / achievement.progressMax) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {achievement.progress} / {achievement.progressMax}
                        </div>
                        <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                          <SparklesIcon className="w-3 h-3 mr-0.5" />
                          {achievement.pointValue} pts
                        </div>
                      </div>
                    </>
                  )}
                  
                  {achievement.unlocked && (
                    <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                      <SparklesIcon className="w-3 h-3 mr-0.5" />
                      {achievement.pointValue} pts earned
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Recent Achievement Popup */}
      <AnimatePresence>
        {recentUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-x-0 bottom-24 mx-auto w-80 max-w-[90%] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-primary-200 dark:border-primary-900 overflow-hidden p-4 z-50"
          >
            <div className="absolute top-2 right-2">
              <button
                onClick={dismissRecentUnlock}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="mb-1 text-amber-500 dark:text-amber-400 font-semibold text-sm">NEW ACHIEVEMENT UNLOCKED!</div>
              
              <div className="flex justify-center mb-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${RARITY_COLORS[recentUnlock.rarity].bg}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-gray-900 ${RARITY_COLORS[recentUnlock.rarity].icon}`}>
                    {recentUnlock.icon}
                  </div>
                </div>
              </div>
              
              <h3 className={`text-lg font-bold mb-1 ${RARITY_COLORS[recentUnlock.rarity].text}`}>
                {recentUnlock.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {recentUnlock.description}
              </p>
              
              <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg">
                <SparklesIcon className="w-4 h-4 text-amber-500 mr-1" />
                <span className="text-amber-700 dark:text-amber-300 font-bold">+{recentUnlock.pointValue} points</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem; 