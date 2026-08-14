import React, { useState } from 'react';

const MultiSelect = ({ label, options, selectedOptions, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (optionValue) => {
    if (selectedOptions.includes(optionValue)) {
      onChange(selectedOptions.filter(item => item !== optionValue));
    } else {
      onChange([...selectedOptions, optionValue]);
    }
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="bg-slate-700 rounded-xl px-4 py-2 border border-slate-600 text-white w-full outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex justify-between items-center"
        onClick={handleToggle}
      >
        <span>{selectedOptions.length > 0 ? `${selectedOptions.length} selected` : placeholder}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-slate-700 rounded-xl border border-slate-600 shadow-lg">
          <ul className="max-h-60 overflow-auto p-2">
            {options.map(option => (
              <li key={option.value} className="p-2 hover:bg-slate-600 rounded-lg">
                <label className="flex items-center space-x-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.value)}
                    onChange={() => handleCheckboxChange(option.value)}
                    className="form-checkbox h-4 w-4 text-blue-500 focus:ring-blue-500 bg-transparent border-slate-500 rounded"
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
