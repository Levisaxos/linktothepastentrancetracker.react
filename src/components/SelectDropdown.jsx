// src/components/SelectDropdown.jsx
import React from 'react';

const SelectDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option...",
  emptyMessage = "No options available",
  className = "",
  disabled = false
}) => {
  return (
    <div>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 ${className}`}
        disabled={disabled}
      >
        {options.length === 0 && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {options.length === 0 && (
        <p className="text-yellow-400 text-sm mt-2">
          {emptyMessage}
        </p>
      )}
    </div>
  );
};

export default SelectDropdown;