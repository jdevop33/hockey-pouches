'use client';

import React, { useState, useEffect } from 'react';

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validate?: (value: string) => { isValid: boolean; message: string } | boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  autoComplete,
  min,
  max,
  step,
  pattern,
  ...props
}) => {
  const [localError, setLocalError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Use provided error or local validation error
  const displayError = error || localError;

  // Validate the input value
  const validateInput = (inputValue: string) => {
    if (!validate) return;

    const result = validate(inputValue);
    
    if (typeof result === 'boolean') {
      setLocalError(result ? '' : 'Invalid input');
    } else {
      setLocalError(result.isValid ? '' : result.message);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    onChange(e);
    
    if (validateOnChange && touched) {
      validateInput(e.target.value);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    
    if (validateOnBlur) {
      validateInput(e.target.value);
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // Validate when value changes externally
  useEffect(() => {
    if (touched && isDirty && validateOnChange) {
      validateInput(value);
    }
  }, [value, touched, isDirty, validateOnChange]);

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        className={`w-full rounded-md shadow-sm ${
          displayError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...props}
      />
      {displayError && (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
};

export default FormInput;
