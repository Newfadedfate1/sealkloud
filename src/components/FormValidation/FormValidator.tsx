import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// Validation rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => string | null;
  match?: string; // field name to match
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export interface FormField {
  name: string;
  value: any;
  touched: boolean;
  error?: string;
}

export interface FormState {
  [fieldName: string]: FormField;
}

// Validation functions
const validators = {
  required: (value: any): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },

  minLength: (value: any, min: number): string | null => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: any, max: number): string | null => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  pattern: (value: any, pattern: RegExp): string | null => {
    if (value && !pattern.test(value)) {
      return 'Invalid format';
    }
    return null;
  },

  email: (value: any): string | null => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (value: any): string | null => {
    // Simple password validation - just check if it exists
    if (value && value.length < 1) {
      return 'Password is required';
    }
    return null;
  },

  phone: (value: any): string | null => {
    if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  url: (value: any): string | null => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return 'Please enter a valid URL';
    }
    return null;
  },
};

// Main validation function
export const validateField = (
  value: any,
  rules: ValidationRule,
  formData?: any
): string | null => {
  // Required validation
  if (rules.required) {
    const requiredError = validators.required(value);
    if (requiredError) return requiredError;
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Min length validation
  if (rules.minLength) {
    const minLengthError = validators.minLength(value, rules.minLength);
    if (minLengthError) return minLengthError;
  }

  // Max length validation
  if (rules.maxLength) {
    const maxLengthError = validators.maxLength(value, rules.maxLength);
    if (maxLengthError) return maxLengthError;
  }

  // Pattern validation
  if (rules.pattern) {
    const patternError = validators.pattern(value, rules.pattern);
    if (patternError) return patternError;
  }

  // Email validation
  if (rules.email) {
    const emailError = validators.email(value);
    if (emailError) return emailError;
  }

  // Match validation
  if (rules.match && formData) {
    if (value !== formData[rules.match]) {
      return 'Values do not match';
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }

  return null;
};

// Hook for form validation
const useFormValidation = (initialData: any, validationRules: ValidationRules) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateSingleField = useCallback((name: string, value: any) => {
    const rules = validationRules[name];
    if (!rules) return null;
    
    return validateField(value, rules, formData);
  }, [validationRules, formData]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateSingleField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, formData, validateSingleField]);

  // Update field value
  const updateField = useCallback((name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Only validate field if it's been touched AND the value is not empty
    // This prevents showing errors while user is still typing
    if (touched[name] && value && value.trim() !== '') {
      const error = validateSingleField(name, value);
      setErrors((prev: ValidationErrors) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    } else if (touched[name] && (!value || value.trim() === '')) {
      // Clear error if field is empty and touched
      setErrors((prev: ValidationErrors) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [touched, validateSingleField]);

  // Mark field as touched
  const touchField = useCallback((name: string) => {
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    
    // Only validate field when touched if it has a value
    // This prevents showing errors immediately when user clicks on empty field
    const value = formData[name];
    if (value && value.trim() !== '') {
      const error = validateSingleField(name, value);
      setErrors((prev: ValidationErrors) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  }, [formData, validateSingleField]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 && 
                  Object.keys(validationRules).every(field => 
                    formData[field] !== undefined && formData[field] !== ''
                  );

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    updateField,
    touchField,
    validateAll,
    resetForm,
    setIsSubmitting,
  };
};

export { useFormValidation };

// Enhanced Input Component
interface EnhancedInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (name: string, value: any) => void;
  onBlur: (name: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showPasswordToggle?: boolean;
  validationRules?: ValidationRule;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  touched,
  onChange,
  onBlur,
  required,
  disabled,
  className = '',
  showPasswordToggle = false,
  validationRules,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const getInputStyles = () => {
    let baseStyles = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
    
    if (error && touched && value && value.trim() !== '') {
      baseStyles += ' border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20';
    } else if (touched && !error && value && value.trim() !== '') {
      baseStyles += ' border-green-300 focus:border-green-500 focus:ring-green-200';
    } else {
      baseStyles += ' border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white';
    }

    if (disabled) {
      baseStyles += ' opacity-50 cursor-not-allowed';
    }

    return baseStyles;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={name}
          type={inputType}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputStyles()}
        />
        
        {/* Password toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        
        {/* Validation icons - only show when field has value and has been touched, but not for password fields with toggle */}
        {touched && value && value.trim() !== '' && !(showPasswordToggle && type === 'password') && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Error message - only show if there's an actual error and field has been touched */}
      {error && touched && error.trim() !== '' && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      
      {/* Help text for password - only show when field is empty and not touched */}
      {showPasswordToggle && type === 'password' && !value && !touched && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Enter your password to continue</p>
        </div>
      )}
    </div>
  );
};

// Form submission wrapper
export const withFormValidation = <P extends object>(
  Component: React.ComponentType<P & {
    formData: any;
    errors: ValidationErrors;
    updateField: (name: string, value: any) => void;
    touchField: (name: string) => void;
    isValid: boolean;
    isSubmitting: boolean;
    handleSubmit: (data: any) => Promise<void>;
  }>,
  validationRules: ValidationRules,
  initialData: any
) => {
  return (props: P) => {
    const {
      formData,
      errors,
      touched,
      isValid,
      isSubmitting,
      updateField,
      touchField,
      validateAll,
      resetForm,
      setIsSubmitting,
    } = useFormValidation(initialData, validationRules);

    const handleSubmit = async (data: any) => {
      if (!validateAll()) {
        return;
      }

      setIsSubmitting(true);
      try {
        // The component will handle the actual submission
        await (props as any).onSubmit?.(data);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Component
        {...props}
        formData={formData}
        errors={errors}
        touched={touched}
        updateField={updateField}
        touchField={touchField}
        isValid={isValid}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
      />
    );
  };
}; 