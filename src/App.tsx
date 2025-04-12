import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import AddTaskModal from './components/tasks/AddTaskModal';
import { Toaster } from 'react-hot-toast';
import UtilityDrawer from './components/utility/UtilityDrawer';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ForgotPassword from './components/auth/ForgotPassword';
import SettingsPage from './pages/SettingsPage';
import FocusTimer from './components/focus/FocusTimer';

// Root component
function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<ProtectedRoute><MainApp isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} /></ProtectedRoute>} />
          </Routes>
        </Router>
      </Provider>
    </AuthProvider>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-primary-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Main app content
interface MainAppProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

function MainApp({ isDarkMode, toggleDarkMode }: MainAppProps) {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      <AppContent
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isAddTaskModalOpen={isAddTaskModalOpen}
        setIsAddTaskModalOpen={setIsAddTaskModalOpen}
      />
    </div>
  );
}

// App content component
function AppContent({
  isDarkMode,
  toggleDarkMode,
  isAddTaskModalOpen,
  setIsAddTaskModalOpen,
}: {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (isOpen: boolean) => void;
}) {
  return (
    <>
      {/* Dynamic Background */}
      <div className="dynamic-bg">
        <div className="gradient-bg"></div>
        <div className="noise-overlay"></div>
      </div>

      <div className="app-container">
        <Header toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

        <main className="main-content">
          <TaskList />
        </main>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddTaskModalOpen(true)}
          className="floating-add-button"
        >
          <PlusIcon className="h-6 w-6" />
        </motion.button>

        <AnimatePresence>
          {isAddTaskModalOpen && (
            <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} />
          )}
        </AnimatePresence>

        {/* Focus Timer */}
        <FocusTimer />

        {/* Utility Components */}
        <UtilityDrawer />

        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              background: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
            },
          }}
        />
      </div>
    </>
  );
}

export default App;
