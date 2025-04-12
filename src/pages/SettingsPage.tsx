import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CalendarSettings from '../components/settings/CalendarSettings';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  KeyIcon,
  BellIcon,
  PaintBrushIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface SettingsPageProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export default function SettingsPage({ toggleDarkMode, isDarkMode }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'account', name: 'Account', icon: KeyIcon },
    { id: 'calendar', name: 'Calendar', icon: CloudIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Profile Information</h3>
            <div className="flex items-center space-x-6">
              <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4">
                <UserCircleIcon className="h-16 w-16 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <div className="mb-4">
                  <label htmlFor="displayName" className="block text-sm font-medium mb-1">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    defaultValue={currentUser?.displayName || ''}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <div className="space-y-4">
              <button 
                className="w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              >
                <span className="font-medium">Change Password</span>
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </button>
              <button 
                onClick={handleSignOut}
                className="w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              >
                <span className="font-medium">Sign Out</span>
                <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        );
      case 'calendar':
        return <CalendarSettings />;
      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="font-medium">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium">Task Reminders</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for upcoming tasks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your tasks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 dark:bg-gray-800/50 p-6 md:border-r border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6">Settings</h2>
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {getTabContent()}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 