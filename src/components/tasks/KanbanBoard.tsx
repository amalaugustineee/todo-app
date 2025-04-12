import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { reorderKanbanTasks, deleteTask, toggleTaskStatus, updateTask } from '../../store/taskSlice';
import TaskCard from './TaskCard';
import { motion } from 'framer-motion';

export default function KanbanBoard() {
  const dispatch = useAppDispatch();
  const { tasks, kanbanColumns, filter } = useAppSelector((state) => state.tasks);
  const [isDragging, setIsDragging] = useState(false);

  // Filter tasks according to current filters
  const filteredTaskIds = tasks
    .filter((task) => {
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
    })
    .map(task => task.id);

  // Filter kanban columns by filtered task IDs
  const filteredColumns = {
    pending: kanbanColumns.pending.filter(id => filteredTaskIds.includes(id)),
    completed: kanbanColumns.completed.filter(id => filteredTaskIds.includes(id))
  };

  // Handle drag end
  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    const sourceColumn = result.source.droppableId as 'pending' | 'completed';
    const destinationColumn = result.destination.droppableId as 'pending' | 'completed';
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceColumn === destinationColumn && sourceIndex === destinationIndex) {
      return;
    }
    
    dispatch(reorderKanbanTasks({
      sourceColumn,
      destinationColumn,
      sourceIndex,
      destinationIndex
    }));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Find a task by ID from the tasks array
  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  // Column render
  const renderColumn = (columnId: 'pending' | 'completed', title: string) => {
    const columnTaskIds = filteredColumns[columnId];
    
    return (
      <div className="kanban-column">
        <div className="kanban-column-header">
          <h3 className="text-lg font-serif">
            {title} <span className="text-sm text-primary-500 dark:text-primary-400">({columnTaskIds.length})</span>
          </h3>
        </div>
        
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="kanban-column-content"
            >
              {columnTaskIds.length === 0 ? (
                <div className="kanban-empty-column">
                  <p className="text-primary-400 dark:text-primary-600 text-sm">No tasks</p>
                </div>
              ) : (
                <motion.div layout className="space-y-4">
                  {columnTaskIds.map((taskId, index) => {
                    const task = getTaskById(taskId);
                    if (!task) return null;
                    
                    return (
                      <Draggable key={taskId} draggableId={taskId} index={index}>
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
                              onEdit={(task) => dispatch(updateTask(task))}
                              onDelete={(id) => dispatch(deleteTask(id))}
                              onToggleStatus={(id) => dispatch(toggleTaskStatus(id))}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                </motion.div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  return (
    <div className={`kanban-board ${isDragging ? 'cursor-grabbing' : ''}`}>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="kanban-columns">
          {renderColumn('pending', 'To Do')}
          {renderColumn('completed', 'Completed')}
        </div>
      </DragDropContext>
    </div>
  );
} 