import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskState, Priority, Category, TaskStatus, ViewType } from '../types/task';

const initialState: TaskState = {
  tasks: [],
  filter: {
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  },
  view: 'grid', // Default view is grid
  isLoading: false,
  error: null,
  focusMode: {
    active: false,
    duration: 25, // Default 25 minutes (Pomodoro)
    startTime: null,
    taskId: null,
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    toggleTaskStatus: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        task.updatedAt = new Date().toISOString();
      }
    },
    reorderTasks: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.tasks.splice(sourceIndex, 1);
      state.tasks.splice(destinationIndex, 0, removed);
      state.tasks.forEach((task, index) => {
        task.order = index;
      });
    },
    setFilter: (state, action: PayloadAction<{
      status?: TaskStatus | 'all';
      priority?: Priority | 'all';
      category?: Category | 'all';
      search?: string;
    }>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setView: (state, action: PayloadAction<ViewType>) => {
      state.view = action.payload;
    },
    startFocusMode: (state, action: PayloadAction<{ taskId: string; duration?: number }>) => {
      state.focusMode = {
        active: true,
        duration: action.payload.duration || 25,
        startTime: new Date().toISOString(),
        taskId: action.payload.taskId,
      };
    },
    endFocusMode: (state) => {
      state.focusMode.active = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  reorderTasks,
  setFilter,
  setView,
  startFocusMode,
  endFocusMode,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer; 