import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import TaskSuggestionModal from './TaskSuggestionModal';
import { TaskSuggestion } from '../../services/geminiService';

interface AiSuggestionButtonProps {
  variant?: 'icon' | 'button';
  label?: string;
  className?: string;
  onSelectSuggestion: (suggestion: TaskSuggestion) => void;
}

export default function AiSuggestionButton({
  variant = 'button',
  label = 'AI Suggestions',
  className = '',
  onSelectSuggestion
}: AiSuggestionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectSuggestion = (suggestion: TaskSuggestion) => {
    onSelectSuggestion(suggestion);
    setIsModalOpen(false);
  };

  if (variant === 'icon') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenModal}
          className={`p-2 text-primary-500 hover:text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors duration-200 ${className}`}
          aria-label="AI task suggestions"
        >
          <SparklesIcon className="h-5 w-5" />
        </motion.button>
        
        <TaskSuggestionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSelectSuggestion={handleSelectSuggestion}
        />
      </>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleOpenModal}
        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${className}`}
      >
        <SparklesIcon className="h-4 w-4 mr-1.5" />
        {label}
      </motion.button>
      
      <TaskSuggestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectSuggestion={handleSelectSuggestion}
      />
    </>
  );
} 