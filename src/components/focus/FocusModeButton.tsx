import { useAppDispatch } from '../../hooks/useAppDispatch';
import { startFocusMode } from '../../store/taskSlice';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

interface FocusModeButtonProps {
  taskId: string;
}

export default function FocusModeButton({ taskId }: FocusModeButtonProps) {
  const dispatch = useAppDispatch();

  const handleStartFocus = (duration: number) => {
    dispatch(startFocusMode({ taskId, duration }));
  };

  return (
    <div className="focus-mode-button">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <button 
          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-800/30 focus:outline-none"
          title="Start focus timer"
        >
          <ClockIcon className="w-5 h-5" />
          <span className="sr-only">Focus Mode</span>
        </button>
        
        <div className="dropdown-content">
          <div className="absolute right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 w-40 z-50">
            <p className="px-4 py-1 text-xs font-medium text-primary-500 dark:text-primary-400">
              Pomodoro Timer
            </p>
            <button 
              onClick={() => handleStartFocus(25)}
              className="w-full text-left px-4 py-1.5 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/50"
            >
              25 minutes
            </button>
            <button 
              onClick={() => handleStartFocus(15)}
              className="w-full text-left px-4 py-1.5 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/50"
            >
              15 minutes
            </button>
            <button 
              onClick={() => handleStartFocus(5)}
              className="w-full text-left px-4 py-1.5 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/50"
            >
              5 minutes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 