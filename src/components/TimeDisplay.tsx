'use client';

import { useEffect, useState } from 'react';

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };

    // Initial update
    updateTime();
    
    // Update every second
    const timer = setInterval(updateTime, 1000);
    
    // Cleanup
    return () => clearInterval(timer);
  }, []);

  return <span>{currentTime}</span>;
}
