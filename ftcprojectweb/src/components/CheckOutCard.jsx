import React from 'react';
import { PiHandTapThin } from 'react-icons/pi';

const CheckOutCard = ({ onCheckOut, busy }) => {
  const [dateTime, setDateTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckOut = () => {
    if (onCheckOut) {
      const hours = String(dateTime.getHours()).padStart(2, "0");
      const minutes = String(dateTime.getMinutes()).padStart(2, "0");
      onCheckOut(`${hours}:${minutes}`);
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
    <div className="bg-[#fee8e3] rounded-2xl p-6 md:p-8 shadow-md flex items-start justify-between w-full max-w-md mx-auto my-5">
      <div className="flex flex-col">
        <p className="text-[#333333] text-sm md:text-base font-sans mb-3">{`${formattedDate} at ${formattedTime}`}</p>
        <h2 className="text-[#333333] text-2xl md:text-3xl font-semibold font-sans mb-1">Check Out</h2>
        <p className="text-[#666666] text-xs md:text-sm font-sans">Register your out time for today</p>
      </div>
      <div 
        className={`relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#fcece9] rounded-full cursor-pointer group shrink-0 ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={!busy ? handleCheckOut : undefined}
      >
        {/* Pulsating Ring Effect */}
        <div className="absolute w-full h-full rounded-full bg-[#f15a24] opacity-20 animate-pulse-ring "></div>
        
        {/* The inner circle for the icon */}
        <div className="relative z-10 flex items-center border-1  justify-center w-16 h-16 md:w-18 md:h-18 bg-[#fcece9] rounded-full ">
            <PiHandTapThin className="text-[#f15a24] text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200 " />
        </div>
      </div>
    </div>
  );
};

export default CheckOutCard;