import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { TaskStatus, Priority, Category } from '../types/task';

// Task interface for Firestore
export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  category?: Category;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
  userId: string;
  listId?: string;
  tags?: string[];
  calendarEventId?: string; // Reference to Google Calendar event
}

// List interface
export interface TaskList {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isDefault?: boolean;
}

// Add a new task
export const addTaskToFirestore = async (task: Omit<Task, 'id'>) => {
  try {
    const taskWithTimestamps = {
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      category: task.category || 'other'
    };
    
    const docRef = await addDoc(collection(db, 'tasks'), taskWithTimestamps);
    return {
      ...taskWithTimestamps,
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Error adding task:', error);
    throw new Error(error.message);
  }
};

// Update a task
export const updateTaskInFirestore = async (taskId: string, updates: Task) => {
  try {
    const { id, ...updateData } = updates;
    await updateDoc(doc(db, 'tasks', taskId), updateData);
    return true;
  } catch (error: any) {
    console.error('Error updating task:', error);
    throw new Error(error.message);
  }
};

// Delete a task
export const deleteTaskFromFirestore = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return true;
  } catch (error: any) {
    console.error('Error deleting task:', error);
    throw new Error(error.message);
  }
};

// Get all tasks for a user
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        title: data.title,
        description: data.description || '',
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        category: data.category || 'other',
        dueDate: data.dueDate ? data.dueDate : null,
        createdAt: data.createdAt ? data.createdAt : new Date().toISOString(),
        completedAt: data.completedAt ? data.completedAt : null,
        userId: data.userId,
        listId: data.listId,
        tags: data.tags,
        calendarEventId: data.calendarEventId
      });
    });
    
    return tasks;
  } catch (error: any) {
    console.error('Error getting user tasks:', error);
    throw new Error(error.message);
  }
};

// Get tasks for a specific list
export const getListTasks = async (listId: string, userId: string) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('listId', '==', listId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        title: data.title,
        description: data.description || '',
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        category: data.category || 'other',
        dueDate: data.dueDate ? data.dueDate : null,
        createdAt: data.createdAt ? data.createdAt : new Date().toISOString(),
        completedAt: data.completedAt ? data.completedAt : null,
        userId: data.userId,
        listId: data.listId,
        tags: data.tags,
        calendarEventId: data.calendarEventId
      });
    });
    
    return tasks;
  } catch (error: any) {
    console.error('Error getting list tasks:', error);
    throw new Error(error.message);
  }
};

// Create a new task list
export const createTaskList = async (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const listWithTimestamps = {
      ...list,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'lists'), listWithTimestamps);
    return { 
      ...list,
      id: docRef.id 
    };
  } catch (error: any) {
    console.error('Error creating list:', error);
    throw new Error(error.message);
  }
};

// Update a task list
export const updateTaskList = async (listId: string, updates: Partial<Omit<TaskList, 'id' | 'createdAt'>>) => {
  try {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, 'lists', listId), updatesWithTimestamp);
    return true;
  } catch (error: any) {
    console.error('Error updating list:', error);
    throw new Error(error.message);
  }
};

// Delete a task list and all associated tasks
export const deleteTaskList = async (listId: string, userId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Delete the list
    batch.delete(doc(db, 'lists', listId));
    
    // Get all tasks in the list
    const q = query(
      collection(db, 'tasks'),
      where('listId', '==', listId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Add delete operations for each task to the batch
    querySnapshot.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
    });
    
    // Commit the batch operation
    await batch.commit();
    
    return true;
  } catch (error: any) {
    console.error('Error deleting list:', error);
    throw new Error(error.message);
  }
};

// Get all task lists for a user
export const getUserLists = async (userId: string): Promise<TaskList[]> => {
  try {
    const q = query(
      collection(db, 'lists'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const lists: TaskList[] = [];
    
    querySnapshot.forEach((doc) => {
      lists.push({ id: doc.id, ...doc.data() } as TaskList);
    });
    
    return lists;
  } catch (error: any) {
    console.error('Error getting user lists:', error);
    throw new Error(error.message);
  }
};

// Get a specific task
export const getTask = async (taskId: string): Promise<Task> => {
  try {
    const docRef = doc(db, 'tasks', taskId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description || '',
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        category: data.category || 'other',
        dueDate: data.dueDate ? data.dueDate : null,
        createdAt: data.createdAt ? data.createdAt : new Date().toISOString(),
        completedAt: data.completedAt ? data.completedAt : null,
        userId: data.userId,
        listId: data.listId,
        tags: data.tags,
        calendarEventId: data.calendarEventId
      };
    } else {
      throw new Error('Task not found');
    }
  } catch (error: any) {
    console.error('Error getting task:', error);
    throw new Error(error.message);
  }
};

// Get a specific list
export const getTaskList = async (listId: string): Promise<TaskList> => {
  try {
    const docRef = doc(db, 'lists', listId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TaskList;
    } else {
      throw new Error('List not found');
    }
  } catch (error: any) {
    console.error('Error getting list:', error);
    throw new Error(error.message);
  }
}; 