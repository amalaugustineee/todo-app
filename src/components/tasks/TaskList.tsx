import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { reorderTasks, setView } from '../../store/taskSlice';
import { Task, Priority, Category, ViewType } from '../../types/task';
import TaskCard from './TaskCard';
import ListView from './ListView';
import CalendarView from './CalendarView';
import EisenhowerMatrix from './EisenhowerMatrix';
import ProductivityDashboard from '../analytics/ProductivityDashboard';
import ViewToggle from '../layout/ViewToggle';
import { AnimatePresence, motion } from 'framer-motion';
import { useFirestoreTasks } from '../../hooks/useFirestoreTasks';
import { useAuth } from '../../contexts/AuthContext';
import { TaskSuggestion } from '../../services/geminiService';
import AiSuggestionButton from '../ai/AiSuggestionButton';

// Background shapes for empty state
const BackgroundShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200/50 dark:bg-primary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-200/50 dark:bg-accent-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-blue-200/50 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-green-200/50 dark:bg-green-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-6000"></div>
    </div>
  );
};

export default function TaskList() {
  const dispatch = useAppDispatch();
  const { filter, view } = useAppSelector((state) => state.tasks);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { tasks, loading, error, updateTask, deleteTask, addTask } = useFirestoreTasks();

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const filteredTasks = tasks.filter((task) => {
    if (filter.status !== 'all' && task.status !== filter.status) return false;
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
    if (filter.category !== 'all' && task.category !== filter.category) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description?.toLowerCase() || '').includes(searchLower)
      );
    }
    return true;
  });

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    dispatch(reorderTasks({ sourceIndex, destinationIndex }));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleEditTask = async (updatedTask: Task) => {
    await updateTask(updatedTask.id, updatedTask);
  };

  const handleUpdateUrgencyImportance = async (taskId: string, isUrgent: boolean, isImportant: boolean) => {
    await updateTask(taskId, { isUrgent, isImportant });
  };

  const handleAiSuggestion = (suggestion: TaskSuggestion) => {
    // Create a new task from the AI suggestion
    const now = new Date().toISOString();
    const dueDate = suggestion.dueDate || now;
    
    const newTask: Omit<Task, 'id'> = {
      title: suggestion.title,
      description: suggestion.description || '',
      priority: suggestion.priority as Priority,
      category: suggestion.category as Category,
      status: 'pending',
      dueDate: dueDate,
      createdAt: now,
      updatedAt: now,
      isRecurring: false,
      recurrencePattern: null,
      order: 0,
      isUrgent: suggestion.isUrgent || false,
      isImportant: suggestion.isImportant || false,
      sharedWith: null,
    };
    
    addTask(newTask);
  };
  
  const handleViewChange = (newView: ViewType) => {
    dispatch(setView(newView));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-serif font-bold text-red-600 mb-4">Error loading tasks</h2>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[60vh]">
      <BackgroundShapes />
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </div>
        
        <div className="flex items-center space-x-3">
          <AiSuggestionButton 
            label="AI Ideas" 
            onSelectSuggestion={handleAiSuggestion} 
            className="mr-2 hidden sm:inline-flex"
          />
          <ViewToggle />
        </div>
      </div>

      {filteredTasks.length === 0 && view !== 'analytics' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <h2 className="text-3xl font-serif font-bold text-primary-900 dark:text-primary-300 mb-4">
            No tasks found
          </h2>
          <p className="text-primary-700 dark:text-primary-400 max-w-md mx-auto font-mono">
            {filter.status !== 'all' || filter.priority !== 'all' || filter.category !== 'all' || filter.search
              ? "Try adjusting your filters to see more tasks."
              : "Click the + button to add your first task."}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Grid View */}
          {view === 'grid' && (
            <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`task-grid ${isDragging ? 'cursor-grabbing' : ''}`}
                  >
                    <AnimatePresence>
                      {filteredTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                zIndex: snapshot.isDragging ? 100 : 1,
                              }}
                            >
                              <TaskCard
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onToggleStatus={handleToggleStatus}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          
          {/* List View */}
          {view === 'list' && (
            <ListView 
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
            />
          )}
          
          {/* Calendar View */}
          {view === 'calendar' && (
            <CalendarView 
              tasks={filteredTasks}
              onEdit={handleEditTask}
            />
          )}
          
          {/* Eisenhower Matrix View */}
          {view === 'matrix' && (
            <EisenhowerMatrix
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
              onUpdateUrgencyImportance={handleUpdateUrgencyImportance}
            />
          )}
          
          {/* Analytics View */}
          {view === 'analytics' && (
            <ProductivityDashboard />
          )}
        </>
      )}
    </div>
  );
} 