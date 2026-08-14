import React, { useState } from 'react';
import { PiHandTapThin } from 'react-icons/pi';
import { FaRegClock } from 'react-icons/fa';

const CheckInCard = ({ onCheckIn, busy }) => {
  const [selectedLocation, setSelectedLocation] = useState('Work From Home');
  const [dateTime, setDateTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    if (onCheckIn) {
      const hours = String(dateTime.getHours()).padStart(2, "0");
      const minutes = String(dateTime.getMinutes()).padStart(2, "0");
      onCheckIn(`${hours}:${minutes}`);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateTime);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).format(dateTime);

  return (
    <div className="bg-[#1f2937] rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-xl mx-auto font-sans flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-12 text-white">
      {/* Left Section: Date, Title, Time, and Radio Buttons */}
      <div className="flex flex-col flex-1 w-full sm:w-auto">
        <p className="text-sm md:text-base font-semibold mb-3">{`${formattedDate} at ${formattedTime}`}</p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-1">Check In</h2>
        <p className="text-sm text-gray-400 mb-6">Register your in time for today</p>
        
        {/* Time Display */}
        <div className="bg-slate-700 rounded-full px-4 py-2 flex items-center justify-between mb-6 w-full max-w-[150px] ">
          <span className="text-xl font-bold">{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(dateTime)}</span>
          <FaRegClock className="text-white/60 text-lg" />
        </div>

        {/* Radio Buttons */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="location"
              value="Work From Home"
              checked={selectedLocation === 'Work From Home'}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-radio h-5 w-5 text-blue-500 bg-slate-700 border-slate-600 ring-offset-blue-500 focus:ring-blue-500"
            />
            <span className="text-white font-medium">Work From Home</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="location"
              value="At Office"
              checked={selectedLocation === 'At Office'}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-radio h-5 w-5 text-blue-500 bg-slate-700 border-slate-600 ring-offset-blue-500 focus:ring-blue-500"
            />
            <span className="text-white font-medium">At Office</span>
          </label>
        </div>
      </div>
      
      {/* Right Section: Interactive Icon */}
      <div 
        className={`relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-slate-700 rounded-full cursor-pointer group shrink-0 ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={!busy ? handleCheckIn : undefined}
      >
        {/* Pulsating Ring Effect */}
        <div className="absolute w-full h-full rounded-full bg-slate-600 opacity-50 animate-pulse-ring"></div>
        
        {/* Inner Circle with Icon */}
        <div className="relative z-10 flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 bg-slate-700 rounded-full">
            <PiHandTapThin className="text-white text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
};

export default CheckInCard;