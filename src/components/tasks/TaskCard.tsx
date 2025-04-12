import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Task } from '../../types/task';
import {
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import FocusModeButton from '../focus/FocusModeButton';
import ShareTaskModal from './ShareTaskModal';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const priorityColors = {
    high: 'from-accent-600 to-accent-700 text-white',
    medium: 'from-accent-500 to-accent-600 text-white',
    low: 'from-primary-400 to-primary-500 text-white',
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'pending';

  const formatRecurrencePattern = (pattern: string | null) => {
    if (!pattern) return '';
    return pattern.charAt(0).toUpperCase() + pattern.slice(1);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent propagation if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setShowDescription(!showDescription);
  };

  return (
    <>
      <div className="task-card-container">
        <div className="task-card-shadow-2"></div>
        <div className="task-card-shadow"></div>
        
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          whileHover={{ y: -5 }}
          className={`task-card fixed-height-card ${isOverdue ? 'task-card-overdue' : ''}`}
          onClick={handleCardClick}
        >
          {/* Priority color band at top */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${priorityColors[task.priority]} rounded-t-xl`}></div>
          
          {/* Card content */}
          <div className="task-card-content p-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(task.id);
                }}
                className={`rounded-full p-2 transition-colors duration-200 ${
                  task.status === 'completed'
                    ? 'text-primary-400 hover:text-primary-500 bg-primary-100 dark:bg-primary-900/30'
                    : 'text-primary-300 hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                }`}
              >
                <CheckCircleIcon className="h-6 w-6" />
              </motion.button>

              <div className="flex space-x-1">
                {task.status === 'pending' && (
                  <FocusModeButton taskId={task.id} />
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsShareModalOpen(true);
                  }}
                  className="p-2 text-primary-300 hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors duration-200"
                  aria-label="Share task"
                >
                  <ShareIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="p-2 text-primary-300 hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors duration-200"
                >
                  <PencilIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="p-2 text-primary-300 hover:text-accent-600 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 transition-colors duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Card title */}
            <div className="text-center mt-2 mb-3 px-2 flex-grow">
              <h3
                className={`text-xl font-serif ${
                  task.status === 'completed'
                    ? 'text-primary-400 dark:text-primary-500 line-through'
                    : 'text-primary-900 dark:text-primary-300'
                }`}
              >
                {task.title}
              </h3>
              
              {/* Shared indication badge */}
              {task.sharedWith && Object.keys(task.sharedWith).length > 0 && (
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 inline-flex items-center">
                  <ShareIcon className="h-3 w-3 mr-1" />
                  Shared with {Object.keys(task.sharedWith).length} {Object.keys(task.sharedWith).length === 1 ? 'person' : 'people'}
                </div>
              )}
              
              {/* Show more/less button only if there's a description */}
              {task.description && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDescription(!showDescription);
                  }}
                  className="mt-2 text-sm text-primary-500 dark:text-primary-400 flex items-center justify-center mx-auto"
                >
                  {showDescription ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Show details
                    </>
                  )}
                </motion.button>
              )}
              
              {/* Description - only shown when expanded */}
              <AnimatePresence>
                {showDescription && task.description && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-sm text-primary-700 dark:text-primary-400 font-mono bg-primary-50/50 dark:bg-primary-900/30 p-3 rounded-lg">
                      {task.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Card footer */}
            <div className="mt-auto">
              {task.isRecurring && task.recurrencePattern && (
                <div className="text-center text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
                  <ArrowPathIcon className="h-3.5 w-3.5 inline mr-1" />
                  {formatRecurrencePattern(task.recurrencePattern)}
                </div>
              )}

              <div className="flex items-center justify-center text-sm text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/30 py-2 rounded-b-lg font-mono">
                <CalendarIcon className="h-4 w-4 mr-1.5" />
                <time dateTime={task.dueDate} className="tabular-nums">
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </time>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Share Task Modal */}
      <ShareTaskModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        task={task}
      />
    </>
  );
} 