import { useEffect, useCallback } from 'react';

export default function DynamicBackground() {
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', `${x}%`);
    document.documentElement.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  const updateTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';

    if (hour >= 5 && hour < 7) timeOfDay = 'dawn';
    else if (hour >= 7 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 20) timeOfDay = 'evening';
    else timeOfDay = 'night';

    document.documentElement.setAttribute('data-time', timeOfDay);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    updateTimeOfDay();

    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [handleMouseMove, updateTimeOfDay]);

  return <div className="dynamic-background" />;
} 