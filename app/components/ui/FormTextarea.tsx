'use client';

import React, { useState, useEffect } from 'react';

interface FormTextareaProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  validate?: (value: string) => { isValid: boolean; message: string } | boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  maxLength,
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  ...props
}) => {
  const [localError, setLocalError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Use provided error or local validation error
  const displayError = error || localError;

  // Update character count when value changes
  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  // Validate the textarea value
  const validateTextarea = (textareaValue: string) => {
    if (!validate) return;

    const result = validate(textareaValue);
    
    if (typeof result === 'boolean') {
      setLocalError(result ? '' : 'Invalid input');
    } else {
      setLocalError(result.isValid ? '' : result.message);
    }
  };

  // Handle textarea change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsDirty(true);
    onChange(e);
    
    if (validateOnChange && touched) {
      validateTextarea(e.target.value);
    }
  };

  // Handle textarea blur
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true);
    
    if (validateOnBlur) {
      validateTextarea(e.target.value);
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // Validate when value changes externally
  useEffect(() => {
    if (touched && isDirty && validateOnChange) {
      validateTextarea(value);
    }
  }, [value, touched, isDirty, validateOnChange]);

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {maxLength && (
          <span className={`text-xs ${charCount > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
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

export default FormTextarea;
