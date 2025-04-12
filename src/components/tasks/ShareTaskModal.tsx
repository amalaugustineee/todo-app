import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Task } from '../../types/task';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreTasks } from '../../hooks/useFirestoreTasks';

interface ShareTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

type PermissionLevel = 'view' | 'edit' | 'admin';

interface SharedUser {
  email: string;
  permission: PermissionLevel;
}

export default function ShareTaskModal({ isOpen, onClose, task }: ShareTaskModalProps) {
  const { currentUser } = useAuth();
  const { updateTask } = useFirestoreTasks();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>('view');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  
  // Populate shared users when task changes
  useEffect(() => {
    if (task && task.sharedWith) {
      const users: SharedUser[] = [];
      
      Object.entries(task.sharedWith).forEach(([uid, permission]) => {
        // In a real app, you would fetch user details from a user service/database
        // For now, we'll just use the UID as a placeholder for the email
        users.push({
          email: `User: ${uid.substring(0, 8)}...`,
          permission: permission as PermissionLevel
        });
      });
      
      setSharedUsers(users);
    } else {
      setSharedUsers([]);
    }
  }, [task]);
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    if (!task) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // In a real app, you would:
      // 1. Validate the email against your user database
      // 2. Get the UID for that email address
      // 3. Add that UID to the task's sharedWith field
      
      // For demo purposes, we'll generate a fake UID
      const mockUid = `user_${Date.now().toString()}`;
      
      const updatedSharedWith = {
        ...(task.sharedWith || {}),
        [mockUid]: permission
      };
      
      await updateTask(task.id, { sharedWith: updatedSharedWith });
      
      // Update local state
      setSharedUsers([
        ...sharedUsers,
        { email, permission }
      ]);
      
      setEmail('');
      setSuccessMessage(`${email} has been granted ${permission} access`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sharing the task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveUser = async (userEmail: string) => {
    if (!task || !task.sharedWith) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, you would:
      // 1. Find the UID for the email
      // 2. Remove that UID from the task's sharedWith field
      
      // For demo purposes, we'll find the matching email in our array
      const updatedUsers = sharedUsers.filter(user => user.email !== userEmail);
      
      // Create a new sharedWith object with only the remaining users
      const updatedSharedWith: Record<string, PermissionLevel> = {};
      
      // In a real implementation, you would map UIDs to permissions
      // For now, we'll construct a mock sharedWith object
      updatedUsers.forEach((user, index) => {
        const mockUid = `user_${index}`;
        updatedSharedWith[mockUid] = user.permission;
      });
      
      await updateTask(task.id, { sharedWith: Object.keys(updatedSharedWith).length ? updatedSharedWith : null });
      
      // Update local state
      setSharedUsers(updatedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while removing access');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!task) return null;
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  Share Task
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                
                <div className="mt-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Share this task with your team members
                  </p>
                </div>

                {error && (
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-300 text-sm">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleAddUser} className="mt-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <select
                        value={permission}
                        onChange={(e) => setPermission(e.target.value as PermissionLevel)}
                        className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      <UserPlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
                
                {sharedUsers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      People with access
                    </h4>
                    <div className="space-y-2">
                      {sharedUsers.map((user, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div>
                            <div className="font-medium text-sm">{user.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.permission} access</div>
                          </div>
                          <button
                            onClick={() => handleRemoveUser(user.email)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Done
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 