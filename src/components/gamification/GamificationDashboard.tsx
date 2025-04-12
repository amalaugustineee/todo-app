import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  TrophyIcon, 
  XMarkIcon,
  SparklesIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  FireIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import DailyChallenges from './DailyChallenges';
import AchievementSystem from './AchievementSystem';

export default function GamificationDashboard() {
  const { tasks } = useAppSelector((state) => state.tasks);
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    streak: 0,
    efficiency: 0,
  });

  // Calculate stats based on tasks
  useEffect(() => {
    if (!tasks.length) return;

    // Calculate tasks completed
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    // Calculate estimated efficiency (completed tasks / total tasks ratio)
    const efficiency = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100) 
      : 0;
    
    // Generate a random streak for demonstration (in a real app, this would be calculated based on daily activity)
    const streak = Math.floor(Math.random() * 5) + 1;
    
    setStats({
      tasksCompleted: completedTasks.length,
      streak,
      efficiency,
    });
    
    // Update XP based on completed tasks (just for demonstration)
    // In a real app, XP would accumulate from various activities and be stored
    const baseXpPerTask = 10;
    const simulatedXp = completedTasks.length * baseXpPerTask;
    setXp(simulatedXp);
    
    // Calculate level based on XP
    const newLevel = Math.max(1, Math.floor(simulatedXp / 100) + 1);
    setLevel(newLevel);
    
    // Calculate XP needed for next level
    setXpToNextLevel(newLevel * 100);
  }, [tasks]);

  return (
    <>
      {/* Dashboard Toggle Button */}
      <div className="gamification-stats-button">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="stats-button"
        >
          <ChartBarIcon className="w-5 h-5 mr-2" />
          <span>Progress</span>
        </motion.button>
      </div>
      
      {/* Dashboard Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="gamification-dashboard-overlay"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="gamification-dashboard-panel"
          >
            <div className="dashboard-header">
              <h2 className="text-xl font-serif font-bold">Progress Dashboard</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800/30"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* User Level */}
            <div className="level-progress">
              <div className="level-header">
                <div className="level-number">
                  <span>Level {level}</span>
                </div>
                <div className="level-badges">
                  {level >= 5 && (
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                      <TrophyIcon className="w-4 h-4" />
                    </div>
                  )}
                  {level >= 10 && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                      <SparklesIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="xp-display">
                <span>XP: {xp}</span>
                <span>{xp}/{xpToNextLevel} to Level {level + 1}</span>
              </div>
              
              <div className="xp-progress-bar">
                <div 
                  className="xp-progress-fill"
                  style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
                ></div>
              </div>
              
              <div className="next-reward">
                <div className="reward-icon">
                  <ArrowUpIcon className="w-4 h-4" />
                </div>
                <span>Next level: Unlock premium theme</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="stats-display">
              <div className="stat-card">
                <CheckCircleIcon className="w-6 h-6 stat-icon" />
                <div className="stat-value">{stats.tasksCompleted}</div>
                <div className="stat-label">Tasks Completed</div>
              </div>
              
              <div className="stat-card">
                <FireIcon className="w-6 h-6 stat-icon" />
                <div className="stat-value">{stats.streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              
              <div className="stat-card">
                <ClockIcon className="w-6 h-6 stat-icon" />
                <div className="stat-value">{stats.efficiency}%</div>
                <div className="stat-label">Efficiency</div>
              </div>
            </div>
            
            {/* Challenges */}
            <DailyChallenges />
            
            {/* Recent Activity */}
            <div className="recent-activity">
              <h3 className="text-lg font-serif mb-2">Recent Activity</h3>
              <div className="activity-timeline">
                {tasks.slice(0, 3).map((task, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {task.status === 'completed' ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
                      )}
                    </div>
                    <div className="activity-content">
                      <span className="activity-action">
                        {task.status === 'completed' ? 'Completed' : 'Created'}
                      </span>
                      <span className="activity-task">
                        {task.title}
                      </span>
                    </div>
                    <div className="activity-time">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Achievement System */}
      <AchievementSystem />
    </>
  );
} 