import React from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';

const SuccessMessage = ({ message, color }) => {
  const bgColor = color ? color : 'bg-[#55f0b5]';

  return (
    <div className={`${bgColor} rounded-3xl p-4 md:p-6 shadow-md flex items-center justify-center w-fit mx-auto my-5`}>
      <div className="flex items-center space-x-3 md:space-x-4">
        <FaRegCheckCircle className="text-white text-xl md:text-2xl" />
        <p className="text-white text-sm md:text-base font-sans m-0">{message}</p>
      </div>
    </div>
  );
};

export default SuccessMessage;