import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setFilter } from '../../store/taskSlice';
import { TaskStatus, Priority, Category } from '../../types/task';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { ListBulletIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export default function Header({ toggleDarkMode, isDarkMode }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { filter } = useAppSelector((state) => state.tasks);
  const [searchTerm, setSearchTerm] = useState(filter.search || '');
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();

  const priorities: (Priority | 'all')[] = ['all', 'high', 'medium', 'low'];
  const categories: (Category | 'all')[] = ['all', 'work', 'personal', 'shopping', 'health', 'other'];

  const handleStatusFilter = (status: TaskStatus | 'all') => {
    dispatch(setFilter({ status }));
    setIsMobileMenuOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    dispatch(setFilter({ search: value }));
  };

  const handlePriorityChange = (priority: Priority | 'all') => {
    dispatch(setFilter({ priority }));
  };

  const handleCategoryChange = (category: Category | 'all') => {
    dispatch(setFilter({ category }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    dispatch(
      setFilter({
        search: '',
        priority: 'all',
        category: 'all',
      })
    );
    setIsFilterOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const navigateToSettings = () => {
    navigate('/settings');
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="header">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="header-content"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-2xl text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:hidden transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" />
            ) : (
              <Bars3Icon className="block h-6 w-6" />
            )}
          </motion.button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="mr-3 bg-gradient-to-br from-primary-400 to-accent-500 p-2 rounded-xl"
            >
              <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold font-serif bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
              TaskDeck
            </h1>
          </motion.div>
        </div>

        {/* Integrated Search bar */}
        <div className="hidden md:flex flex-1 px-4 mx-4">
          <div className="relative w-full max-w-xl mx-auto flex items-center">
            <div className="absolute left-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-primary-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-900 dark:text-primary-300 placeholder-primary-400 dark:placeholder-primary-600"
              placeholder="Search tasks..."
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="ml-2 px-3 py-2 rounded-full text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors duration-200 flex items-center"
            >
              <FunnelIcon className="h-4 w-4 inline-block mr-1" />
              Filters
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <nav className="flex space-x-2">
            {['all', 'pending', 'completed'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusFilter(status as TaskStatus | 'all')}
                className={`px-6 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  filter.status === status
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </nav>

          <div className="flex items-center space-x-2 border-l pl-6 border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-2xl text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>
            
            {/* User Profile Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2 rounded-2xl flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200"
              >
                <UserCircleIcon className="h-5 w-5" />
                {currentUser && (
                  <span className="text-sm font-medium hidden md:inline-block">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                )}
              </motion.button>
              
              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {currentUser?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    <button
                      onClick={navigateToSettings}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Search Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden px-4 mt-4"
      >
        <div className="relative w-full flex items-center">
          <div className="absolute left-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm shadow-md text-primary-900 dark:text-primary-300 placeholder-primary-400 dark:placeholder-primary-600"
            placeholder="Search tasks..."
          />
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="absolute right-2 px-2 py-1 rounded-full text-sm font-medium text-primary-600"
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-b-2xl shadow-lg mt-2 mx-2 border border-gray-200/50 dark:border-gray-800/50"
          >
            <div className="px-4 py-3 space-y-3">
              <nav className="flex flex-col space-y-2">
                {['all', 'pending', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status as TaskStatus | 'all')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      filter.status === status
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </nav>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {currentUser && (
                      <div className="flex items-center text-sm">
                        <UserCircleIcon className="h-6 w-6 mr-2 text-primary-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={navigateToSettings}
                      className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pt-2 overflow-hidden"
          >
            <div className="mx-auto max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl px-5 py-4 shadow-md border border-gray-200/50 dark:border-gray-800/50">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-serif text-primary-900 dark:text-primary-300 mb-2">
                      Priority
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {priorities.map((priority) => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(priority)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            filter.priority === priority
                              ? 'bg-gradient-primary text-white shadow-glow'
                              : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/30'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-serif text-primary-900 dark:text-primary-300 mb-2">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            filter.category === category
                              ? 'bg-gradient-primary text-white shadow-glow'
                              : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/30'
                          }`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-primary-200 dark:border-primary-800">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 