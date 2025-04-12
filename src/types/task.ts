export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'personal' | 'health' | 'shopping' | 'other';
export type TaskStatus = 'pending' | 'completed';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
export type ViewType = 'grid' | 'list' | 'calendar' | 'matrix' | 'analytics';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern;
  order: number;
  // Eisenhower Matrix properties
  isUrgent: boolean;
  isImportant: boolean;
  // Collaboration properties
  sharedWith?: {
    [uid: string]: 'view' | 'edit' | 'admin'
  } | null;
}

export interface TaskState {
  tasks: Task[];
  filter: {
    status: TaskStatus | 'all';
    priority: Priority | 'all';
    category: Category | 'all';
    search: string;
  };
  view: ViewType;
  isLoading: boolean;
  error: string | null;
  focusMode: {
    active: boolean;
    duration: number; // minutes
    startTime: string | null;
    taskId: string | null;
  };
} 