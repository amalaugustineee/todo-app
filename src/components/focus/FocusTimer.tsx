import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { endFocusMode } from '../../store/taskSlice';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  ArrowPathIcon, 
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/solid';

export default function FocusTimer() {
  const dispatch = useAppDispatch();
  const { focusMode } = useAppSelector((state) => state.tasks);
  const { tasks } = useAppSelector((state) => state.tasks);
  
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [shouldShowCompletionDialog, setShouldShowCompletionDialog] = useState(false);
  
  // Get the current task
  const currentTask = focusMode.taskId 
    ? tasks.find(task => task.id === focusMode.taskId)
    : null;

  // Initialize timer when focusMode changes
  useEffect(() => {
    if (focusMode.active && focusMode.duration > 0) {
      setTimeLeft(focusMode.duration * 60); // Convert minutes to seconds
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsActive(false);
      setIsPaused(false);
    }
  }, [focusMode]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => {
          if (timeLeft <= 1) {
            clearInterval(interval!);
            setIsActive(false);
            setIsPaused(false);
            setShouldShowCompletionDialog(true);
            // Play notification sound
            const audio = new Audio('/sounds/bell.mp3');
            audio.play().catch(e => console.log('Error playing sound:', e));
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    dispatch(endFocusMode());
  };

  const handleReset = () => {
    setTimeLeft(focusMode.duration * 60);
    setIsPaused(false);
    setIsActive(true);
  };

  const handleCompletionClose = () => {
    setShouldShowCompletionDialog(false);
    dispatch(endFocusMode());
  };

  const getProgressPercentage = () => {
    if (!focusMode.active || focusMode.duration <= 0) return 0;
    const totalSeconds = focusMode.duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  if (!focusMode.active) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-72"
        >
          <div className="relative">
            <h3 className="text-center font-medium text-gray-700 dark:text-gray-300 mb-2">
              Focus Mode {isPaused && "(Paused)"}
            </h3>
            
            <button
              onClick={handleStop}
              className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {currentTask && (
            <div className="mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-sm">
              <p className="font-medium text-primary-600 dark:text-primary-400">
                Current Task:
              </p>
              <p className="text-gray-700 dark:text-gray-300 truncate">
                {currentTask.title}
              </p>
            </div>
          )}
          
          <div className="relative mb-4">
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div 
                className="h-full bg-primary-100 dark:bg-primary-900/30 transition-all duration-1000"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            
            <div className="text-center py-3 relative">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handlePauseResume}
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2"
            >
              {isPaused ? (
                <PlayIcon className="h-5 w-5" />
              ) : (
                <PauseIcon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={handleReset}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full p-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleStop}
              className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 rounded-full p-2"
            >
              <StopIcon className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Completion Dialog */}
      <AnimatePresence>
        {shouldShowCompletionDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md mx-4"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                  <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">
                Focus Session Complete!
              </h2>
              
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Great job! You've completed your {focusMode.duration}-minute focus session.
                {currentTask && ` Would you like to mark "${currentTask.title}" as completed?`}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
                {currentTask && currentTask.status !== 'completed' && (
                  <button
                    onClick={() => {
                      // Handle marking task as completed
                      // This would usually involve a call to your task update function
                      // For now, we'll just close the dialog
                      handleCompletionClose();
                    }}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                  >
                    Mark as Completed
                  </button>
                )}
                
                <button
                  onClick={handleCompletionClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 