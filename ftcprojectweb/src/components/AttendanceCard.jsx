import React, { useState, useEffect } from 'react';
import { FaHome, FaStar } from 'react-icons/fa';

const AttendanceCard = ({ reportedTime, checkInTime, rating }) => {
  const [workedTime, setWorkedTime] = useState("0h 0m");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!checkInTime) return;

    const calculateWorkedTime = () => {
      const [hour, minute] = checkInTime.split(":");
      const checkInDate = new Date();
      checkInDate.setHours(hour, minute, 0, 0);

      const now = new Date();
      const diff = now.getTime() - checkInDate.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setWorkedTime(`${hours}h ${minutes}m`);

      const workedMinutes = hours * 60 + minutes;
      const totalMinutes = 9 * 60;
      const progressPercentage = (workedMinutes / totalMinutes) * 100;
      setProgress(Math.min(100, progressPercentage));
    };

    calculateWorkedTime();
    const interval = setInterval(calculateWorkedTime, 1000);

    return () => clearInterval(interval);
  }, [checkInTime]);

  const totalStars = 5;
  const stars = Array.from({ length: totalStars }, (_, index) => (
    <FaStar
      key={index}
      className={index < rating ? "text-yellow-400" : "text-gray-600"}
    />
  ));

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="bg-[#2f2f32] rounded-2xl p-6 shadow-2xl w-full max-w-sm mx-auto font-sans flex items-center justify-between">
      {/* Left Section: Reported At & Rating */}
      <div className="flex flex-col">
        <p className="text-white text-sm font-semibold mb-1">Reported at</p>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-white text-3xl font-light">{formatTime(reportedTime)}</h2>
          <FaHome className="text-white text-sm" />
        </div>
        <div className="flex gap-1">{stars}</div>
      </div>

      {/* Right Section: Worked Time & Progress Bar */}
      <div className="flex flex-col items-end">
        <p className="text-white text-sm font-semibold mb-1">Worked time till now</p>
        <h2 className="text-white text-2xl font-light mb-2">{workedTime}</h2>
        <div className="bg-white/10 w-32 h-2 rounded-full">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;