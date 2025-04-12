import React from 'react';
import { Task } from '../../types/task';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

interface ListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
}

export default function ListView({ tasks, onEdit, onDelete, onToggleStatus }: ListViewProps) {
  return (
    <div className="list-view-container">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={`flex items-center gap-3 p-3 rounded-xl bg-white/95 dark:bg-gray-900/95 
                      shadow-sm border ${
                        task.status === 'completed' 
                          ? 'border-green-200 dark:border-green-900/50' 
                          : 'border-gray-200 dark:border-gray-800'
                      } hover:shadow-md transition-shadow`}
        >
          <button 
            onClick={() => onToggleStatus(task.id)}
            className="flex-shrink-0"
            aria-label={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
          >
            {task.status === 'completed' ? (
              <CheckCircleSolid className="h-6 w-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-gray-400 hover:text-green-500" />
            )}
          </button>
          
          <div className="flex-grow min-w-0">
            <h3 className={`text-sm font-medium truncate ${
              task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : ''
            }`}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClass(task.priority)}`}>
                {task.priority}
              </span>
              
              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryClass(task.category)}`}>
                {task.category}
              </span>
              
              {task.dueDate && (
                <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-3 w-3" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              aria-label="Edit task"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              aria-label="Delete task"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getCategoryClass(category: string): string {
  switch (category) {
    case 'work':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'personal':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
    case 'health':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'shopping':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
} 