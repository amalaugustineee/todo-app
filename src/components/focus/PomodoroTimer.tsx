import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon, 
  XMarkIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  ClockIcon,
  BellIcon,
  BoltIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Define Pomodoro modes and their default durations in minutes
const TIMER_MODES = {
  POMODORO: { name: 'Focus', duration: 25, color: '#ef4444' },
  SHORT_BREAK: { name: 'Short Break', duration: 5, color: '#10b981' },
  LONG_BREAK: { name: 'Long Break', duration: 15, color: '#3b82f6' }
};

// Define Flow Mode options
const FLOW_MODES = [
  { name: 'Deep Work', duration: 90, description: 'Extended focus session for complex tasks' },
  { name: 'Quick Sprint', duration: 45, description: 'Medium session for focused productivity' },
  { name: '10-Minute Burst', duration: 10, description: 'Short burst for quick tasks' }
];

export default function PomodoroTimer() {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.tasks);
  
  // Timer state
  const [mode, setMode] = useState<keyof typeof TIMER_MODES>('POMODORO');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.POMODORO.duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [customDurations, setCustomDurations] = useState({
    POMODORO: TIMER_MODES.POMODORO.duration,
    SHORT_BREAK: TIMER_MODES.SHORT_BREAK.duration,
    LONG_BREAK: TIMER_MODES.LONG_BREAK.duration
  });
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3');
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // Reset timer when mode changes
  useEffect(() => {
    const duration = customDurations[mode];
    setTimeLeft(duration * 60);
    
    if (isActive) {
      startTimer();
    }
  }, [mode]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage for circular timer
  const calculateProgress = (): number => {
    const totalSeconds = customDurations[mode] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };
  
  // Start the timer
  const startTimer = () => {
    setIsActive(true);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Pause the timer
  const pauseTimer = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Reset the timer
  const resetTimer = () => {
    pauseTimer();
    const duration = customDurations[mode];
    setTimeLeft(duration * 60);
  };
  
  // Handle timer completion
  const handleTimerComplete = () => {
    pauseTimer();
    
    // Play sound notification
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Could not play notification sound", e));
    }
    
    // Show browser notification if possible
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Timer Complete", {
        body: `Your ${mode.toLowerCase().replace('_', ' ')} timer is complete!`,
        icon: "/favicon.ico"
      });
    }
    
    // Increment pomodoro count when a focus session completes
    if (mode === 'POMODORO') {
      setPomodoroCount(prev => prev + 1);
    }
    
    // Auto switch to next mode
    if (mode === 'POMODORO') {
      const nextMode = pomodoroCount % 4 === 3 ? 'LONG_BREAK' : 'SHORT_BREAK';
      setMode(nextMode as keyof typeof TIMER_MODES);
    } else {
      setMode('POMODORO');
    }
  };
  
  // Update custom durations
  const updateDuration = (type: keyof typeof customDurations, change: number) => {
    setCustomDurations(prev => {
      const updated = { ...prev };
      updated[type] = Math.max(1, Math.min(120, prev[type] + change));
      return updated;
    });
    
    if (mode === type && !isActive) {
      setTimeLeft((customDurations[type] + change) * 60);
    }
  };
  
  // Get active tasks for current task selection
  const getActiveTasks = () => {
    return tasks.filter(task => task.status !== 'completed').slice(0, 5);
  };
  
  // Get timer color based on current mode
  const getTimerColor = () => {
    return TIMER_MODES[mode].color;
  };
  
  // Timer circle circumference for progress
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (calculateProgress() / 100) * circumference;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mode Selection Tabs */}
      <div className="flex justify-between mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {Object.entries(TIMER_MODES).map(([key, { name }]) => (
          <button
            key={key}
            className={`flex-1 py-2 px-1 text-sm font-medium rounded-md transition-colors ${
              mode === key 
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
            }`}
            onClick={() => setMode(key as keyof typeof TIMER_MODES)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative flex-1 flex flex-col items-center justify-center mb-6">
        <div className="relative inline-flex items-center justify-center">
          {/* Background Circle */}
          <svg className="w-52 h-52" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={getTimerColor()}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              transform="rotate(-90 100 100)"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Timer Text */}
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-mono font-bold text-gray-800 dark:text-white">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {TIMER_MODES[mode].name}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={isActive ? pauseTimer : startTimer}
          className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800/30"
        >
          {isActive ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowPathIcon className="h-8 w-8" />
        </button>
      </div>
      
      {/* Settings Section */}
      <div className="mt-auto">
        <div 
          className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 cursor-pointer"
          onClick={() => setShowSettings(!showSettings)}
        >
          <div className="flex items-center">
            <Cog6ToothIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
          </div>
          <ChevronUpIcon className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </div>
        
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 space-y-3">
                {/* Duration Settings */}
                {Object.entries(TIMER_MODES).map(([key, { name }]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{name}</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => updateDuration(key as keyof typeof customDurations, -1)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                      <span className="inline-block w-8 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        {customDurations[key as keyof typeof customDurations]}
                      </span>
                      <button
                        onClick={() => updateDuration(key as keyof typeof customDurations, 1)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Pomodoro Count */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Focus sessions completed</span>
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full">
                    {pomodoroCount}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 