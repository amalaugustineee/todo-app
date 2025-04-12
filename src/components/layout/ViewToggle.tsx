import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setView } from '../../store/taskSlice';
import { ViewType } from '../../types/task';
import { 
  ViewColumnsIcon, 
  ListBulletIcon, 
  CalendarIcon,
  Square2StackIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function ViewToggle() {
  const dispatch = useAppDispatch();
  const view = useAppSelector((state) => state.tasks.view);

  const handleViewChange = (newView: ViewType) => {
    dispatch(setView(newView));
  };

  return (
    <div className="view-toggle-container">
      <button
        className={`view-toggle-button ${view === 'grid' ? 'active' : ''}`}
        onClick={() => handleViewChange('grid')}
        aria-label="Grid view"
      >
        <ViewColumnsIcon className="h-4 w-4" />
        <span>Grid</span>
      </button>
      
      <button
        className={`view-toggle-button ${view === 'list' ? 'active' : ''}`}
        onClick={() => handleViewChange('list')}
        aria-label="List view"
      >
        <ListBulletIcon className="h-4 w-4" />
        <span>List</span>
      </button>
      
      <button
        className={`view-toggle-button ${view === 'calendar' ? 'active' : ''}`}
        onClick={() => handleViewChange('calendar')}
        aria-label="Calendar view"
      >
        <CalendarIcon className="h-4 w-4" />
        <span>Calendar</span>
      </button>
      
      <button
        className={`view-toggle-button ${view === 'matrix' ? 'active' : ''}`}
        onClick={() => handleViewChange('matrix')}
        aria-label="Eisenhower Matrix view"
      >
        <Square2StackIcon className="h-4 w-4" />
        <span>Matrix</span>
      </button>
      
      <button
        className={`view-toggle-button ${view === 'analytics' ? 'active' : ''}`}
        onClick={() => handleViewChange('analytics')}
        aria-label="Analytics view"
      >
        <ChartBarIcon className="h-4 w-4" />
        <span>Analytics</span>
      </button>
    </div>
  );
} 