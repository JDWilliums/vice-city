'use client';

import React from 'react';

type InputFieldProps = {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
  error,
  placeholder = '',
  autoComplete,
  autoFocus = false
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-200 mb-1">
        {label} {required && <span className="text-gta-pink">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`w-full px-4 py-3 rounded-md bg-gray-900 border ${
          error ? 'border-red-500' : 'border-gray-700'
        } focus:outline-none focus:ring-2 focus:ring-gta-pink focus:border-transparent transition-colors`}
      />
      {error && (
        <p className="mt-1 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default InputField; 