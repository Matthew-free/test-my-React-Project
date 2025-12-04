
import React, { useState, useEffect } from 'react';

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-5xl md:text-6xl font-bold tracking-wider text-white">
        {time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>
      <div className="text-lg text-gray-300 mt-2">
        {time.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
      </div>
    </div>
  );
};

export default ClockWidget;
