'use client';

import React, { useState, useEffect, useCallback } from 'react';

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
  const validateInput = useCallback(
    (inputValue: string) => {
      if (!validate) return;

      const result = validate(inputValue);

      if (typeof result === 'boolean') {
        setLocalError(result ? '' : 'Invalid input');
      } else {
        setLocalError(result.isValid ? '' : result.message);
      }
    },
    [validate, setLocalError]
  );

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
  }, [value, touched, isDirty, validateOnChange, validateInput]);

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gold-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={`${
          displayError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25'
            : 'border-gold-subtle focus:border-gold focus:ring-gold-500/20'
        } ${
          disabled ? 'cursor-not-allowed' : ''
        } w-full rounded-md bg-slate-900 text-white shadow-sm focus:ring-2 focus:ring-opacity-20 sm:text-sm`}
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
        {...props}
      />
      {displayError && <p className="mt-1 text-sm text-red-400">{displayError}</p>}
    </div>
  );
};

export default FormInput;
