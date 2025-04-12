import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HiOutlineCalendar, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const CalendarSettings = () => {
  const { isGoogleCalendarConnected, connectGoogleCalendar, disconnectGoogleCalendar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await connectGoogleCalendar();
      
      if (result.success) {
        setSuccess('Connected to Google Calendar successfully');
      } else {
        setError(result.error || 'Failed to connect to Google Calendar');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect to Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await disconnectGoogleCalendar();
      
      if (result.success) {
        setSuccess('Disconnected from Google Calendar successfully');
      } else {
        setError(result.error || 'Failed to disconnect from Google Calendar');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to disconnect from Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Google Calendar Integration
      </h3>
      
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          <HiOutlineCalendar className="h-8 w-8 text-primary-500 dark:text-primary-400" />
        </div>
        <div className="ml-4 flex-1">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            {isGoogleCalendarConnected ? 'Connected to Google Calendar' : 'Connect to Google Calendar'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isGoogleCalendarConnected 
              ? 'Your tasks with due dates will be synced with Google Calendar' 
              : 'Connect your account to sync tasks with due dates to Google Calendar'}
          </p>
        </div>
        <div>
          {isGoogleCalendarConnected ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <HiOutlineCheck className="h-3 w-3 mr-1" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              <HiOutlineX className="h-3 w-3 mr-1" />
              Disconnected
            </span>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <div className="flex justify-end">
        {isGoogleCalendarConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
      
      {isGoogleCalendarConnected && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Calendar Sync Settings
          </h5>
          
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="auto-sync" className="text-gray-700 dark:text-gray-300">
              Automatically sync new tasks with due dates
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                id="auto-sync" 
                name="auto-sync" 
                defaultChecked
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label 
                htmlFor="auto-sync" 
                className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
              ></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-sm">
            <label htmlFor="remind-before" className="text-gray-700 dark:text-gray-300">
              Add reminders before task due date
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                id="remind-before" 
                name="remind-before" 
                defaultChecked
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label 
                htmlFor="remind-before" 
                className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
              ></label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSettings; 