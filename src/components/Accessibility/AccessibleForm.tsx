import React, { forwardRef, useState, useEffect } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibleInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  describedBy?: string;
  autoComplete?: string;
  'aria-describedby'?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(({
  id,
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
  describedBy,
  autoComplete,
  'aria-describedby': ariaDescribedBy,
}, ref) => {
  const { announceToScreenReader } = useAccessibility();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error && !hasError) {
      setHasError(true);
      announceToScreenReader(`Error: ${error}`, 'assertive');
    } else if (!error && hasError) {
      setHasError(false);
    }
  }, [error, hasError, announceToScreenReader]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  
  const describedByIds = [
    error && errorId,
    describedBy,
    ariaDescribedBy
  ].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-describedby={describedByIds || undefined}
        aria-invalid={!!error}
        aria-required={required}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      
      {error && (
        <div 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

interface AccessibleTextareaProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(({
  id,
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
}, ref) => {
  const { announceToScreenReader } = useAccessibility();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error && !hasError) {
      setHasError(true);
      announceToScreenReader(`Error: ${error}`, 'assertive');
    } else if (!error && hasError) {
      setHasError(false);
    }
  }, [error, hasError, announceToScreenReader]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const errorId = `${id}-error`;
  const characterCountId = `${id}-char-count`;
  
  const describedByIds = [
    error && errorId,
    maxLength && characterCountId
  ].filter(Boolean).join(' ');

  const characterCount = value.length;
  const remainingChars = maxLength ? maxLength - characterCount : null;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-describedby={describedByIds || undefined}
        aria-invalid={!!error}
        aria-required={required}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-vertical
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      
      {error && (
        <div 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      
      {maxLength && (
        <div 
          id={characterCountId}
          className="text-xs text-gray-500 dark:text-gray-400"
          aria-live="polite"
        >
          {characterCount} of {maxLength} characters
          {remainingChars !== null && remainingChars <= 10 && (
            <span className="text-orange-600 dark:text-orange-400 ml-2">
              ({remainingChars} remaining)
            </span>
          )}
        </div>
      )}
    </div>
  );
});

AccessibleTextarea.displayName = 'AccessibleTextarea';

interface AccessibleSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  className = '',
  placeholder,
}, ref) => {
  const { announceToScreenReader } = useAccessibility();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error && !hasError) {
      setHasError(true);
      announceToScreenReader(`Error: ${error}`, 'assertive');
    } else if (!error && hasError) {
      setHasError(false);
    }
  }, [error, hasError, announceToScreenReader]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const errorId = `${id}-error`;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <select
        ref={ref}
        id={id}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        aria-required={required}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
});

AccessibleSelect.displayName = 'AccessibleSelect';

interface AccessibleButtonProps {
  id?: string;
  children: React.ReactNode;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-controls'?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  id,
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  'aria-controls': ariaControls,
}, ref) => {
  return (
    <button
      ref={ref}
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-controls={ariaControls}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton'; 