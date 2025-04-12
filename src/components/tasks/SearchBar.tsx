import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setFilter } from '../../store/taskSlice';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Priority, Category } from '../../types/task';

export default function SearchBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { filter } = useAppSelector((state) => state.tasks);
  const [searchTerm, setSearchTerm] = useState(filter.search || '');

  const priorities: (Priority | 'all')[] = ['all', 'high', 'medium', 'low'];
  const categories: (Category | 'all')[] = ['all', 'work', 'personal', 'shopping', 'health', 'other'];

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

  return (
    <div className="search-container">
      <div className="search-content">
        <MagnifyingGlassIcon className="h-5 w-5 text-primary-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
          placeholder="Search tasks..."
        />
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`search-filter-button ${isFilterOpen ? 'bg-primary-100 dark:bg-primary-800/30' : ''}`}
        >
          <FunnelIcon className="h-4 w-4 inline-block mr-1" />
          Filters
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isFilterOpen ? 'auto' : 0,
          opacity: isFilterOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="search-filter-panel">
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
    </div>
  );
} 