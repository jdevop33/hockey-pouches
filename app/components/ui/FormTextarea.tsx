'use client';

import React, { useState, useEffect, useCallback } from 'react';

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
  const [charCount, setCharCount] = useState(value.length);

  // Use provided error or local validation error
  const displayError = error || localError;

  // Validate the textarea value
  const validateTextarea = useCallback(
    (textValue: string) => {
      if (!validate) return;

      const result = validate(textValue);

      if (typeof result === 'boolean') {
        setLocalError(result ? '' : 'Invalid input');
      } else {
        setLocalError(result.isValid ? '' : result.message);
      }
    },
    [validate, setLocalError]
  );

  // Handle textarea change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsDirty(true);
    setCharCount(e.target.value.length);
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
    setCharCount(value.length);
  }, [value, touched, isDirty, validateOnChange, validateTextarea]);

  return (
    <div className={`mb-4 ${className}`}>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gold-500">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {maxLength && (
          <span className={`text-xs ${charCount > maxLength ? 'text-red-400' : 'text-gray-400'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        name={name}
        className={`${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-gold-500 focus:ring-gold-500'
        } block w-full rounded-md bg-slate-900 text-white shadow-sm focus:ring-2 focus:ring-opacity-20 sm:text-sm`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        {...props}
      />
      {displayError && <p className="mt-1 text-sm text-red-400">{displayError}</p>}
    </div>
  );
};

export default FormTextarea;
