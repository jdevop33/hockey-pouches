'use client';

import React, { useState, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  name: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  validate?: (value: string) => { isValid: boolean; message: string } | boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  id,
  name,
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  placeholder,
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  ...props
}) => {
  const [localError, setLocalError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Use provided error or local validation error
  const displayError = error || localError;

  // Validate the select value
  const validateSelect = (selectValue: string) => {
    if (!validate) return;

    const result = validate(selectValue);
    
    if (typeof result === 'boolean') {
      setLocalError(result ? '' : 'Please select a valid option');
    } else {
      setLocalError(result.isValid ? '' : result.message);
    }
  };

  // Handle select change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsDirty(true);
    onChange(e);
    
    if (validateOnChange && touched) {
      validateSelect(e.target.value);
    }
  };

  // Handle select blur
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setTouched(true);
    
    if (validateOnBlur) {
      validateSelect(e.target.value);
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // Validate when value changes externally
  useEffect(() => {
    if (touched && isDirty && validateOnChange) {
      validateSelect(value);
    }
  }, [value, touched, isDirty, validateOnChange]);

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        className={`w-full rounded-md shadow-sm ${
          displayError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {displayError && (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
};

export default FormSelect;
