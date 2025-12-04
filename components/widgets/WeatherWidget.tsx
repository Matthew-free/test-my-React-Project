
import React from 'react';
import WeatherIcon from '../icons/WeatherIcon';

const WeatherWidget: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <WeatherIcon className="w-20 h-20 text-yellow-300 mb-4" />
      <div className="text-4xl font-bold">23°C</div>
      <div className="text-lg text-gray-300">맑음</div>
      <div className="text-sm text-gray-400 mt-2">서울, 대한민국</div>
    </div>
  );
};

export default WeatherWidget;
