import React, { useMemo } from 'react';
import { useFirestoreTasks } from '../../hooks/useFirestoreTasks';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, addDays, isWithinInterval } from 'date-fns';
import { 
  ChartBarIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ClockIcon, 
  FireIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Placeholder for chart - in a real implementation, we'd use a library like recharts
const SimpleBarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end h-40 gap-1">
      {data.map((item, index) => {
        const barHeight = item.value ? Math.max((item.value / maxValue) * 100, 5) : 3;
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-primary-500 dark:bg-primary-600 rounded-t"
              style={{ height: `${barHeight}%` }}
            />
            <div className="text-xs mt-1 text-center">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default function ProductivityDashboard() {
  const { tasks } = useFirestoreTasks();
  
  // Calculate the current week range
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const lastWeekStart = subDays(weekStart, 7);
  const lastWeekEnd = subDays(weekStart, 1);
  
  // Completed tasks
  const completedTasks = tasks.filter(task => task.status === 'completed' && task.completedAt);
  
  // Tasks completed this week
  const thisWeekCompleted = completedTasks.filter(task => {
    const completedDate = new Date(task.completedAt!);
    return isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
  });
  
  // Tasks completed last week
  const lastWeekCompleted = completedTasks.filter(task => {
    const completedDate = new Date(task.completedAt!);
    return isWithinInterval(completedDate, { start: lastWeekStart, end: lastWeekEnd });
  });
  
  // Tasks due but not completed
  const overdueCount = tasks.filter(task => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  }).length;
  
  // Calculate task completion rate change
  const completionRateChange = thisWeekCompleted.length - lastWeekCompleted.length;
  const completionRateChangePercent = lastWeekCompleted.length ? 
    Math.round((completionRateChange / lastWeekCompleted.length) * 100) : 
    thisWeekCompleted.length ? 100 : 0;

  // Generate data for weekly tasks chart
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const weeklyTasksData = useMemo(() => {
    return weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const completedCount = completedTasks.filter(task => {
        if (!task.completedAt) return false;
        return format(new Date(task.completedAt), 'yyyy-MM-dd') === dayStr;
      }).length;
      
      return {
        label: format(day, 'EEE'),
        value: completedCount
      };
    });
  }, [completedTasks, weekDays]);

  // Most productive day
  const mostProductiveDay = useMemo(() => {
    if (weeklyTasksData.length === 0) return null;
    
    const maxValue = Math.max(...weeklyTasksData.map(d => d.value));
    if (maxValue === 0) return null;
    
    const maxIndex = weeklyTasksData.findIndex(d => d.value === maxValue);
    return {
      day: weeklyTasksData[maxIndex].label,
      count: maxValue
    };
  }, [weeklyTasksData]);

  // Task categories
  const tasksByCategory = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    
    completedTasks.forEach(task => {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [completedTasks]);

  // Stat Card Component
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    change, 
    colorClass = 'bg-primary-50 dark:bg-primary-900/30' 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    change?: number; 
    colorClass?: string; 
  }) => (
    <div className={`rounded-xl p-4 ${colorClass}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50">
          {icon}
        </div>
      </div>
      
      <div className="text-2xl font-bold">{value}</div>
      
      {change !== undefined && (
        <div className="flex items-center mt-1 text-xs">
          {change > 0 ? (
            <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
          ) : change < 0 ? (
            <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
          ) : (
            <span className="w-3 mr-1" />
          )}
          <span className={change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'}>
            {Math.abs(change)}% {change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change'} from last week
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="px-1">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Productivity Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track your task completion and productivity trends
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Tasks Completed This Week" 
          value={thisWeekCompleted.length}
          icon={<ChartBarIcon className="h-5 w-5 text-primary-500" />}
          change={completionRateChangePercent}
        />
        
        <StatCard 
          title="Overdue Tasks" 
          value={overdueCount}
          icon={<ClockIcon className="h-5 w-5 text-yellow-500" />}
          colorClass="bg-yellow-50 dark:bg-yellow-900/30"
        />
        
        {mostProductiveDay ? (
          <StatCard 
            title="Most Productive Day" 
            value={`${mostProductiveDay.day} (${mostProductiveDay.count})`}
            icon={<FireIcon className="h-5 w-5 text-red-500" />}
            colorClass="bg-red-50 dark:bg-red-900/30"
          />
        ) : (
          <StatCard 
            title="Total Completed Tasks" 
            value={completedTasks.length}
            icon={<CalendarIcon className="h-5 w-5 text-blue-500" />}
            colorClass="bg-blue-50 dark:bg-blue-900/30"
          />
        )}
      </div>
      
      {/* Weekly Chart */}
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl p-5 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Weekly Task Completion</h3>
        <SimpleBarChart data={weeklyTasksData} />
      </div>
      
      {/* Category Breakdown */}
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Completion by Category</h3>
        
        {tasksByCategory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No completed tasks yet
          </div>
        ) : (
          <div className="space-y-3">
            {tasksByCategory.map(({ category, count }) => (
              <div key={category} className="flex items-center">
                <div className="w-24 text-sm font-medium capitalize">{category}</div>
                <div className="flex-grow h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${(count / completedTasks.length) * 100}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm ml-2">{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 