import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppDispatch';
import {
  CheckCircleIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Challenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  progressMax: number;
  reward: string;
  expiry: string; // ISO string
}

const DailyChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const tasks = useAppSelector(state => state.tasks.tasks);
  
  // Generate daily challenges on component mount
  useEffect(() => {
    generateChallenges();
  }, []);
  
  const generateChallenges = () => {
    setRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const newChallenges: Challenge[] = [
        {
          id: '1',
          title: "Complete 3 tasks today",
          description: "Finish any 3 tasks on your list today",
          completed: false,
          progress: tasks.filter(t => 
            t.status === 'completed' && 
            new Date(t.updatedAt).toDateString() === today.toDateString()
          ).length,
          progressMax: 3,
          reward: "50 XP",
          expiry: tomorrow.toISOString()
        },
        {
          id: '2',
          title: "Focus for 25 minutes",
          description: "Complete a Pomodoro session",
          completed: false,
          progress: 0,
          progressMax: 1,
          reward: "30 XP",
          expiry: tomorrow.toISOString()
        },
        {
          id: '3',
          title: "Clear your backlog",
          description: "Complete 2 overdue tasks",
          completed: false,
          progress: tasks.filter(t => 
            t.status === 'completed' && 
            new Date(t.dueDate) < today && 
            new Date(t.updatedAt).toDateString() === today.toDateString()
          ).length,
          progressMax: 2,
          reward: "40 XP",
          expiry: tomorrow.toISOString()
        },
        {
          id: '4',
          title: "Plan ahead",
          description: "Create 2 new tasks for the future",
          completed: false,
          progress: tasks.filter(t => 
            new Date(t.createdAt).toDateString() === today.toDateString() &&
            new Date(t.dueDate) > tomorrow
          ).length,
          progressMax: 2,
          reward: "25 XP",
          expiry: tomorrow.toISOString()
        }
      ];
      
      // Mark some challenges as completed for demo purposes
      if (Math.random() > 0.5) {
        newChallenges[1].completed = true;
        newChallenges[1].progress = 1;
      }
      
      setChallenges(newChallenges);
      setRefreshing(false);
    }, 1000);
  };
  
  // Calculate time until challenges refresh
  const getTimeUntilRefresh = () => {
    if (challenges.length === 0) return "Loading...";
    
    const now = new Date();
    const expiry = new Date(challenges[0].expiry);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Refreshing soon";
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m remaining`;
  };
  
  return (
    <div className="daily-challenges-content">
      <div className="daily-challenges-header">
        <div className="daily-challenges-title">
          <CalendarIcon className="w-5 h-5 text-primary-600" />
          <h4>Today's Challenges</h4>
        </div>
        
        <div className="daily-challenges-timer">
          {getTimeUntilRefresh()}
        </div>
        
        <button
          className="daily-challenges-refresh"
          onClick={generateChallenges}
          disabled={refreshing}
        >
          <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="daily-challenges-list">
        {challenges.map(challenge => (
          <div 
            key={challenge.id} 
            className={`daily-challenge ${challenge.completed ? 'daily-challenge-completed' : ''}`}
          >
            <div className="daily-challenge-reward">
              <StarIcon className="w-4 h-4" />
              <span>{challenge.reward}</span>
            </div>
            
            <div className="daily-challenge-header">
              <h4 className="daily-challenge-title">
                {challenge.completed ? 
                  <CheckCircleIcon className="w-5 h-5 text-green-500" /> : 
                  <TrophyIcon className="w-5 h-5" />
                }
                <span>{challenge.title}</span>
              </h4>
            </div>
            
            <p className="daily-challenge-description">{challenge.description}</p>
            
            <div className="daily-challenge-progress">
              <div className="daily-challenge-progress-bar">
                <div 
                  className="daily-challenge-progress-fill"
                  style={{ width: `${(challenge.progress / challenge.progressMax) * 100}%` }}
                ></div>
              </div>
              <span>{challenge.progress} / {challenge.progressMax}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChallenges; 