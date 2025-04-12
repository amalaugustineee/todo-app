import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cog6ToothIcon, 
  XMarkIcon, 
  TrophyIcon, 
  ClockIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import PomodoroTimer from '../focus/PomodoroTimer';
import AchievementSystem from '../gamification/AchievementSystem';
import DailyChallenges from '../gamification/DailyChallenges';

type UtilityTab = 'focus' | 'achievements' | 'challenges' | 'closed';

export default function UtilityDrawer() {
  const [activeTab, setActiveTab] = useState<UtilityTab>('closed');
  const [minimized, setMinimized] = useState(false);
  const [panelHeight, setPanelHeight] = useState<string>('auto');
  const [showBlur, setShowBlur] = useState(false);

  // Effect to handle body scroll locking when utility panel is open
  useEffect(() => {
    if (activeTab !== 'closed') {
      // Disable scrolling on body
      document.body.style.overflow = 'hidden';
      setShowBlur(true);
    } else {
      // Re-enable scrolling
      document.body.style.overflow = '';
      // Delay blur removal to match the animation
      setTimeout(() => {
        setShowBlur(false);
      }, 300);
    }

    return () => {
      // Cleanup
      document.body.style.overflow = '';
    };
  }, [activeTab]);

  const openTab = (tab: UtilityTab) => {
    if (activeTab === tab) {
      setActiveTab('closed');
    } else {
      // Close current tab first for smooth transition
      if (activeTab !== 'closed') {
        setActiveTab('closed');
        setTimeout(() => {
          setActiveTab(tab);
          setMinimized(false);
        }, 300); // Match the exit animation duration
      } else {
        setActiveTab(tab);
        setMinimized(false);
      }
    }
  };

  // Close the utility drawer
  const closeUtility = () => {
    setActiveTab('closed');
  };

  // Determine panel title based on active tab
  const getPanelTitle = () => {
    switch (activeTab) {
      case 'focus':
        return (
          <>
            <ClockIcon className="h-5 w-5 mr-2" />
            Focus Timer
          </>
        );
      case 'achievements':
        return (
          <>
            <TrophyIcon className="h-5 w-5 mr-2" />
            Achievements
          </>
        );
      case 'challenges':
        return (
          <>
            <TrophyIcon className="h-5 w-5 mr-2" />
            Daily Challenges
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Background blur overlay */}
      <AnimatePresence>
        {showBlur && (
          <motion.div 
            className="utility-blur-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeUtility}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div 
        className="utility-fab"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          className="utility-fab-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMinimized(!minimized)}
        >
          {minimized ? (
            <RocketLaunchIcon className="h-6 w-6" />
          ) : (
            <Cog6ToothIcon className="h-6 w-6" />
          )}
        </motion.button>

        <AnimatePresence>
          {!minimized && (
            <motion.div 
              className="utility-fab-menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`utility-fab-item ${activeTab === 'focus' ? 'active' : ''}`}
                onClick={() => openTab('focus')}
              >
                <ClockIcon className="h-5 w-5" />
                <span className="utility-fab-label">Focus</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`utility-fab-item ${
                  activeTab === 'achievements' || activeTab === 'challenges' ? 'active' : ''
                }`}
                onClick={() => openTab(activeTab === 'achievements' ? 'challenges' : 'achievements')}
              >
                <TrophyIcon className="h-5 w-5" />
                <span className="utility-fab-label">Progress</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content Panel */}
      <AnimatePresence mode="wait">
        {activeTab !== 'closed' && (
          <motion.div
            key={`panel-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="utility-panel"
            transition={{ duration: 0.3 }}
            style={{ height: panelHeight }}
          >
            <div className="utility-panel-header">
              <h3 className="utility-panel-title">{getPanelTitle()}</h3>
              
              <button
                className="utility-panel-close"
                onClick={closeUtility}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="utility-panel-content">
              <AnimatePresence mode="wait">
                {activeTab === 'focus' && (
                  <motion.div 
                    className="utility-panel-focus-content"
                    key="focus-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onAnimationComplete={() => {
                      // Adjust panel height if needed
                      if (activeTab === 'focus') {
                        setPanelHeight('auto');
                      }
                    }}
                  >
                    <PomodoroTimer />
                  </motion.div>
                )}
                
                {activeTab === 'achievements' && (
                  <motion.div 
                    className="utility-panel-achievements-content"
                    key="achievements-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onAnimationComplete={() => {
                      // Adjust panel height if needed
                      if (activeTab === 'achievements') {
                        setPanelHeight('auto');
                      }
                    }}
                  >
                    <AchievementSystem />
                  </motion.div>
                )}
                
                {activeTab === 'challenges' && (
                  <motion.div 
                    className="utility-panel-challenges-content"
                    key="challenges-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onAnimationComplete={() => {
                      // Adjust panel height if needed
                      if (activeTab === 'challenges') {
                        setPanelHeight('auto');
                      }
                    }}
                  >
                    <DailyChallenges />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 