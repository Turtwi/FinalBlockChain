import React, { useState, useEffect } from 'react';

interface TimeRemainingProps {
  endTime: number;
}

const TimeRemaining: React.FC<TimeRemainingProps> = ({ endTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remainingSeconds = endTime - now;
      
      if (remainingSeconds <= 0) {
        setTimeRemaining('Ended');
        setIsEnding(false);
        return;
      }
      
      // Set isEnding flag if less than 1 hour remaining
      setIsEnding(remainingSeconds < 3600);
      
      const days = Math.floor(remainingSeconds / 86400);
      const hours = Math.floor((remainingSeconds % 86400) / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span className={`text-sm font-medium ${isEnding ? 'text-red-600 dark:text-red-400 animate-pulse' : ''}`}>
      {timeRemaining}
    </span>
  );
};

export default TimeRemaining;