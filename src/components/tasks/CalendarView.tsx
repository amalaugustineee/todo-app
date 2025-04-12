import React, { useState } from 'react';
import { Task } from '../../types/task';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export default function CalendarView({ tasks, onEdit }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Navigation handlers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Generate calendar data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate the start day of the week (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
      tasksByDate[dateKey] = tasksByDate[dateKey] || [];
      tasksByDate[dateKey].push(task);
    }
  });

  // Helpers
  const getTasksForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };
  
  const isCurrentMonth = (date: Date) => {
    return format(date, 'M') === format(currentMonth, 'M');
  };

  return (
    <div className="calendar-view-container">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5" />
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth} 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <button 
            onClick={nextMonth} 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-sm py-2 text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
        
        {/* Empty cells before the first day of the month */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 rounded-lg"></div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map(day => {
          const dayTasks = getTasksForDay(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div 
              key={format(day, 'yyyy-MM-dd')} 
              className={`h-24 p-1 border rounded-lg overflow-y-auto ${
                isToday 
                  ? 'border-primary-400 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-right mb-1">
                <span className={`text-xs font-medium inline-block rounded-full w-5 h-5 text-center leading-5 ${
                  isToday 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id}
                    onClick={() => onEdit(task)}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      task.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/30 line-through' 
                        : getPriorityClass(task.priority)
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    case 'low':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  }
} 