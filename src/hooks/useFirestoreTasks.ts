import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { setTasks, addTask, updateTask, deleteTask } from '../store/taskSlice';
import { useAuth } from '../contexts/AuthContext';
import {
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
  getUserTasks,
  Task as FirestoreTask
} from '../firebase/firestore';
import { Task } from '../types/task';

export const useFirestoreTasks = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAuth();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Firestore task to app task
  const convertFirestoreTaskToAppTask = (firestoreTask: FirestoreTask): Task => ({
    id: firestoreTask.id,
    title: firestoreTask.title,
    description: firestoreTask.description || '',
    status: firestoreTask.status || 'pending',
    priority: firestoreTask.priority || 'medium',
    category: firestoreTask.category || 'other',
    dueDate: firestoreTask.dueDate ? new Date(firestoreTask.dueDate) : null,
    createdAt: firestoreTask.createdAt ? new Date(firestoreTask.createdAt) : new Date(),
    completedAt: firestoreTask.completedAt ? new Date(firestoreTask.completedAt) : null,
  });

  // Convert app task to Firestore task
  const convertAppTaskToFirestoreTask = (task: Task): FirestoreTask => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    userId: currentUser?.uid || '',
  });

  // Load tasks from Firestore
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const firestoreTasks = await getUserTasks(currentUser.uid);
        const appTasks = firestoreTasks.map(convertFirestoreTaskToAppTask);
        dispatch(setTasks(appTasks));
        setError(null);
      } catch (err) {
        console.error('Error loading tasks from Firestore:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [currentUser, dispatch]);

  // Add a task to both Redux and Firestore
  const addTaskWithFirestore = async (newTask: Omit<Task, 'id'>) => {
    if (!currentUser) {
      setError('You must be logged in to add tasks');
      return null;
    }

    try {
      const taskWithUserId = {
        ...newTask,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      const createdTask = await addTaskToFirestore(taskWithUserId);
      const appTask = convertFirestoreTaskToAppTask(createdTask);
      dispatch(addTask(appTask));
      return appTask;
    } catch (err) {
      console.error('Error adding task to Firestore:', err);
      setError('Failed to add task. Please try again.');
      return null;
    }
  };

  // Update a task in both Redux and Firestore
  const updateTaskWithFirestore = async (taskId: string, taskUpdates: Partial<Task>) => {
    if (!currentUser) {
      setError('You must be logged in to update tasks');
      return false;
    }

    try {
      const existingTask = tasks.find(task => task.id === taskId);
      
      if (!existingTask) {
        setError('Task not found');
        return false;
      }

      // If marking as completed, set completedAt date
      if (taskUpdates.status === 'completed' && existingTask.status !== 'completed') {
        taskUpdates.completedAt = new Date();
      }
      
      // If marking as pending, clear completedAt date
      if (taskUpdates.status === 'pending' && existingTask.status === 'completed') {
        taskUpdates.completedAt = null;
      }

      const updatedTask = {
        ...existingTask,
        ...taskUpdates,
      };

      const firestoreTask = convertAppTaskToFirestoreTask(updatedTask);
      await updateTaskInFirestore(taskId, firestoreTask);
      dispatch(updateTask({ id: taskId, updates: taskUpdates }));
      return true;
    } catch (err) {
      console.error('Error updating task in Firestore:', err);
      setError('Failed to update task. Please try again.');
      return false;
    }
  };

  // Delete a task from both Redux and Firestore
  const deleteTaskWithFirestore = async (taskId: string) => {
    if (!currentUser) {
      setError('You must be logged in to delete tasks');
      return false;
    }

    try {
      await deleteTaskFromFirestore(taskId);
      dispatch(deleteTask(taskId));
      return true;
    } catch (err) {
      console.error('Error deleting task from Firestore:', err);
      setError('Failed to delete task. Please try again.');
      return false;
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask: addTaskWithFirestore,
    updateTask: updateTaskWithFirestore,
    deleteTask: deleteTaskWithFirestore,
  };
}; 