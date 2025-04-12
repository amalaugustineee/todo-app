import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Task, Priority, Category, RecurrencePattern } from '../../types/task';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useFirestoreTasks } from '../../hooks/useFirestoreTasks';
import TaskTemplateModal from './TaskTemplate';
import AiSuggestionButton from '../ai/AiSuggestionButton';
import { TaskSuggestion } from '../../services/geminiService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: Task | null;
}

interface FormData {
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  dueDate: Date | null;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern;
  isUrgent: boolean;
  isImportant: boolean;
}

export default function AddTaskModal({ isOpen, onClose, editingTask }: AddTaskModalProps) {
  const dispatch = useAppDispatch();
  const { addTask, updateTask } = useFirestoreTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    priority: editingTask?.priority || 'medium',
    category: editingTask?.category || 'personal',
    dueDate: editingTask?.dueDate ? new Date(editingTask.dueDate) : null,
    isRecurring: editingTask?.isRecurring || false,
    recurrencePattern: editingTask?.recurrencePattern || null,
    isUrgent: editingTask?.isUrgent || false,
    isImportant: editingTask?.isImportant || false,
  });

  // Update form data when editing task changes
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        category: editingTask.category || 'personal',
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : null,
        isRecurring: editingTask.isRecurring || false,
        recurrencePattern: editingTask.recurrencePattern || null,
        isUrgent: editingTask.isUrgent || false,
        isImportant: editingTask.isImportant || false,
      });
    }
  }, [editingTask]);

  const priorities: Priority[] = ['low', 'medium', 'high'];
  const categories: Category[] = ['work', 'personal', 'shopping', 'health', 'other'];
  const recurrencePatterns: NonNullable<RecurrencePattern>[] = ['daily', 'weekly', 'monthly'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      
      if (editingTask) {
        const taskUpdates: Partial<Task> = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          dueDate: formData.dueDate ? formData.dueDate.toISOString() : '',
          updatedAt: now,
          isRecurring: formData.isRecurring,
          recurrencePattern: formData.recurrencePattern,
          isUrgent: formData.isUrgent,
          isImportant: formData.isImportant,
        };
        
        await updateTask(editingTask.id, taskUpdates);
      } else {
        const newTask: Omit<Task, 'id'> = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          status: 'pending',
          dueDate: formData.dueDate ? formData.dueDate.toISOString() : '',
          createdAt: now,
          updatedAt: now,
          isRecurring: formData.isRecurring,
          recurrencePattern: formData.recurrencePattern,
          order: 0,
          isUrgent: formData.isUrgent,
          isImportant: formData.isImportant,
          sharedWith: null,
        };
        
        await addTask(newTask);
      }

      onClose();
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        dueDate: null,
        isRecurring: false,
        recurrencePattern: null,
        isUrgent: false,
        isImportant: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setFormData({
      ...formData,
      title: template.name,
      description: template.steps?.length 
        ? `${template.description || ''}\n\nSteps:\n${template.steps.map((step: string, i: number) => `${i+1}. ${step}`).join('\n')}`
        : template.description || '',
      priority: template.priority,
      category: template.category,
      isUrgent: template.isUrgent || false,
      isImportant: template.isImportant || false,
    });
  };
  
  const handleAiSuggestionSelect = (suggestion: TaskSuggestion) => {
    // Transform the suggested due date if it exists
    const dueDate = suggestion.dueDate 
      ? new Date(suggestion.dueDate) 
      : formData.dueDate;
      
    setFormData({
      ...formData,
      title: suggestion.title,
      description: suggestion.description || '',
      priority: suggestion.priority as Priority,
      category: suggestion.category as Category,
      dueDate,
      isUrgent: suggestion.isUrgent || false,
      isImportant: suggestion.isImportant || false
    });
  };

  return (
    <>
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
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                    <div className="flex items-center gap-2">
                      {!editingTask && (
                        <>
                          <AiSuggestionButton 
                            variant="icon" 
                            onSelectSuggestion={handleAiSuggestionSelect} 
                          />
                          <button
                            onClick={() => setIsTemplateModalOpen(true)}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            title="Use template"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </Dialog.Title>

                  {error && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                          {priorities.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Due Date
                      </label>
                      <DatePicker
                        selected={formData.dueDate}
                        onChange={(date) => setFormData({ ...formData, dueDate: date })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Select a due date"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isRecurring}
                            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Recurring task</span>
                        </label>
                      </div>

                      {formData.isRecurring && (
                        <div className="flex-1">
                          <select
                            value={formData.recurrencePattern || ''}
                            onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value as RecurrencePattern })}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          >
                            <option value="">Select pattern</option>
                            {recurrencePatterns.map((pattern) => (
                              <option key={pattern} value={pattern}>
                                {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isUrgent}
                            onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Urgent</span>
                        </label>
                      </div>
                      
                      <div className="flex-1">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isImportant}
                            onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Important</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6 space-x-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Task Template Modal */}
      <TaskTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onTemplateSelect={handleTemplateSelect}
      />
    </>
  );
} 