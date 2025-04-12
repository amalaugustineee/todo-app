import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import geminiService, { TaskSuggestion } from '../../services/geminiService';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { Task } from '../../types/task';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface TaskSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (suggestion: TaskSuggestion) => void;
}

export default function TaskSuggestionModal({ isOpen, onClose, onSelectSuggestion }: TaskSuggestionModalProps) {
  const { currentUser } = useAuth();
  const { tasks } = useAppSelector((state) => state.tasks);
  
  const [prompt, setPrompt] = useState<string>('');
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState<boolean>(true);

  const examplePrompts = [
    "Suggest tasks for planning a weekend trip",
    "What tasks should I create for my fitness goals?",
    "Help me organize my work priorities for the week",
    "What are some tasks for learning a new programming language?",
    "Suggest tasks to improve my home office setup"
  ];

  // Clear suggestions when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setExplanation('');
      setError(null);
    }
  }, [isOpen]);

  const handleGenerateSuggestions = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for AI suggestions');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setExplanation('');
    setShowExamples(false);
    
    try {
      const recentTasks = tasks.slice(0, 10);
      const response = await geminiService.generateTaskSuggestions(prompt, recentTasks);
      
      setSuggestions(response.suggestions || []);
      setExplanation(response.explanation || '');
    } catch (err) {
      console.error('Error generating task suggestions:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to generate suggestions. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateSuggestions();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <SparklesIcon className="h-5 w-5 text-primary-500 mr-2" />
                    AI Task Suggestions
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                
                <div className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      What kind of tasks do you need help with?
                    </label>
                    <div className="relative">
                      <textarea
                        id="ai-prompt"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="E.g., Suggest tasks for planning a weekend trip"
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                      <button
                        onClick={handleGenerateSuggestions}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-2 bottom-2 inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        <SparklesIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {showExamples && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Try these examples:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => handleExampleClick(example)}
                            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Generating suggestions...</span>
                    </div>
                  )}

                  {!isLoading && suggestions.length > 0 && (
                    <div className="mt-2">
                      {explanation && (
                        <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                          <p>{explanation}</p>
                        </div>
                      )}
                      
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Suggested tasks:
                      </h4>
                      
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => onSelectSuggestion(suggestion)}
                          >
                            <div className="flex items-start">
                              <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5 mr-2" />
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                  {suggestion.title}
                                </h5>
                                {suggestion.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    {suggestion.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    suggestion.priority === 'high' 
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                                      : suggestion.priority === 'medium'
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  }`}>
                                    {suggestion.priority} priority
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                                    {suggestion.category}
                                  </span>
                                  {suggestion.dueDate && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300">
                                      Due: {format(new Date(suggestion.dueDate), 'MMM d, yyyy')}
                                    </span>
                                  )}
                                  {suggestion.isUrgent && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                      Urgent
                                    </span>
                                  )}
                                  {suggestion.isImportant && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                      Important
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 