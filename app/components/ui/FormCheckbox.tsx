'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface FormCheckboxProps {
  id: string;
  name: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validate?: (checked: boolean) => { isValid: boolean; message: string } | boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  name,
  label,
  checked,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  validate,
  validateOnBlur = true,
  validateOnChange = true,
  ...props
}) => {
  const [localError, setLocalError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Use provided error or local validation error
  const displayError = error || localError;

  // Validate the checkbox state
  const validateCheckbox = useCallback(
    (isChecked: boolean) => {
      if (!validate) return;

      const result = validate(isChecked);

      if (typeof result === 'boolean') {
        setLocalError(result ? '' : required ? 'This field is required' : 'Invalid selection');
      } else {
        setLocalError(result.isValid ? '' : result.message);
      }
    },
    [validate, required, setLocalError]
  );

  // Handle checkbox change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    onChange(e);

    if (validateOnChange && touched) {
      validateCheckbox(e.target.checked);
    }
  };

  // Handle checkbox blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);

    if (validateOnBlur) {
      validateCheckbox(e.target.checked);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  // Validate when checked state changes externally
  useEffect(() => {
    if (touched && isDirty && validateOnChange) {
      validateCheckbox(checked);
    }
  }, [checked, touched, isDirty, validateOnChange, validateCheckbox]);

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            className={`h-4 w-4 rounded ${
              displayError
                ? 'border-red-500 text-red-600 focus:ring-red-500'
                : 'border-gold-subtle text-gold-500 focus:ring-gold-500/20'
            } ${disabled ? 'cursor-not-allowed bg-secondary-800' : 'bg-secondary-900'}`}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={id}
            className={`font-medium ${displayError ? 'text-red-400' : 'text-gold-500'}`}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        </div>
      </div>
      {displayError && <p className="mt-1 text-sm text-red-400">{displayError}</p>}
    </div>
  );
};

export default FormCheckbox;
