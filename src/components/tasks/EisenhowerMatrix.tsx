import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useFirestoreTasks } from '../../hooks/useFirestoreTasks';
import { Task } from '../../types/task';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface MatrixTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
}

const MatrixTask: React.FC<MatrixTaskProps> = ({ task, onEdit, onDelete, onToggleStatus }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`p-3 rounded-lg shadow-sm mb-2 cursor-pointer ${
        task.status === 'completed' 
          ? 'bg-green-100 dark:bg-green-900/30 line-through' 
          : 'bg-white dark:bg-gray-800'
      }`}
      onClick={() => onEdit(task)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium line-clamp-2">{task.title}</h3>
        <div 
          className={`h-4 w-4 rounded-full flex-shrink-0 ${
            task.status === 'completed' 
              ? 'bg-green-500' 
              : getPriorityColor(task.priority)
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(task.id);
          }}
        />
      </div>
      {task.dueDate && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
};

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
}

export default function EisenhowerMatrix() {
  const { tasks, updateTask, deleteTask } = useFirestoreTasks();
  const dispatch = useAppDispatch();
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);

  // Bucket tasks into quadrants
  const urgentImportant = tasks.filter(t => t.isUrgent && t.isImportant && t.status !== 'completed');
  const urgentNotImportant = tasks.filter(t => t.isUrgent && !t.isImportant && t.status !== 'completed');
  const notUrgentImportant = tasks.filter(t => !t.isUrgent && t.isImportant && t.status !== 'completed');
  const notUrgentNotImportant = tasks.filter(t => !t.isUrgent && !t.isImportant && t.status !== 'completed');
  
  // Completed tasks (for optional display)
  const completedTasks = tasks.filter(t => t.status === 'completed').slice(0, 5);

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
    
    await updateTask(taskId, { 
      status: newStatus,
      completedAt
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleEditTask = async (taskToEdit: Task) => {
    // This will be handled by the parent component's edit modal
  };
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const taskId = result.draggableId;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Determine new urgency/importance based on destination
    let isUrgent = task.isUrgent;
    let isImportant = task.isImportant;
    
    switch (destination.droppableId) {
      case 'urgent-important':
        isUrgent = true;
        isImportant = true;
        break;
      case 'urgent-not-important':
        isUrgent = true;
        isImportant = false;
        break;
      case 'not-urgent-important':
        isUrgent = false;
        isImportant = true;
        break;
      case 'not-urgent-not-important':
        isUrgent = false;
        isImportant = false;
        break;
    }
    
    // Only update if values changed
    if (isUrgent !== task.isUrgent || isImportant !== task.isImportant) {
      updateTask(taskId, { isUrgent, isImportant });
    }
  };

  const QuadrantContainer = ({ 
    id, 
    title, 
    description, 
    tasks, 
    color 
  }: { 
    id: string, 
    title: string, 
    description: string, 
    tasks: Task[], 
    color: string 
  }) => (
    <div className="flex flex-col h-full">
      <div className={`p-3 rounded-t-lg ${color}`}>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-white/80">{description}</p>
      </div>
      
      <Droppable droppableId={id}>
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="bg-white/95 dark:bg-gray-900/95 rounded-b-lg p-2 flex-grow overflow-y-auto h-[300px]"
          >
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
                <p className="text-sm">No tasks</p>
                <p className="text-xs">Drag tasks here</p>
              </div>
            ) : (
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                        }}
                      >
                        <MatrixTask 
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
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Eisenhower Matrix</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your tasks based on urgency and importance. Drag tasks between quadrants to reprioritize.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuadrantContainer
          id="urgent-important"
          title="Do First"
          description="Urgent and important tasks"
          tasks={urgentImportant}
          color="bg-red-600 dark:bg-red-800"
        />
        
        <QuadrantContainer
          id="urgent-not-important"
          title="Delegate"
          description="Urgent but not important tasks"
          tasks={urgentNotImportant}
          color="bg-yellow-600 dark:bg-yellow-800"
        />
        
        <QuadrantContainer
          id="not-urgent-important"
          title="Schedule"
          description="Important but not urgent tasks"
          tasks={notUrgentImportant}
          color="bg-blue-600 dark:bg-blue-800"
        />
        
        <QuadrantContainer
          id="not-urgent-not-important"
          title="Eliminate"
          description="Neither urgent nor important tasks"
          tasks={notUrgentNotImportant}
          color="bg-gray-600 dark:bg-gray-700"
        />
      </div>
      
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Recently Completed</h3>
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-lg p-3">
            {completedTasks.map(task => (
              <div key={task.id} className="text-sm text-gray-500 dark:text-gray-400 line-through py-1 border-b last:border-0">
                {task.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </DragDropContext>
  );
} 