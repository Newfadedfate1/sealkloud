import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { LoginCredentials } from '../../types/user';
import { useFormValidation, EnhancedInput, ValidationRules } from '../FormValidation/FormValidator';
import { useToastHelpers } from '../Toast/ToastContainer';

interface EnhancedLoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
  error: string | null;
}

// Validation rules for login form - simplified for demo
const loginValidationRules: ValidationRules = {
  email: {
    required: true,
  },
  password: {
    required: true,
  },
};

const initialFormData = {
  email: '',
  password: '',
};

export const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({ 
  onSubmit, 
  isLoading, 
  error 
}) => {
  const toast = useToastHelpers();
  const {
    formData,
    errors,
    touched,
    isValid,
    updateField,
    touchField,
    validateAll,
    resetForm,
  } = useFormValidation(initialFormData, loginValidationRules);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation - just check if fields are filled
    if (!formData.email || !formData.password) {
      toast.error('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      await onSubmit(formData as LoginCredentials);
      toast.success('Login Successful', 'Welcome back!');
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Login error:', error);
    }
  };

  const fillDemoCredentials = (email: string, password: string = 'password123') => {
    updateField('email', email);
    updateField('password', password);
    // Clear any existing errors when loading demo credentials
    setTimeout(() => {
      // Force validation to clear errors
      validateAll();
    }, 100);
    toast.info('Demo Credentials Loaded', 'You can now sign in with these credentials.');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Demo Credentials Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
        <p className="text-xs text-blue-700 mb-3">Use these credentials to test different user roles:</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@sealkloud.com')}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded border border-red-200 transition-colors"
              disabled={isLoading}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('employee@sealkloud.com')}
              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded border border-green-200 transition-colors"
              disabled={isLoading}
            >
              Employee L1
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('client@sealkloud.com')}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 transition-colors"
              disabled={isLoading}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('l2tech@sealkloud.com')}
              className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-200 transition-colors"
              disabled={isLoading}
            >
              L2 Tech
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('l3expert@sealkloud.com')}
              className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200 transition-colors"
              disabled={isLoading}
            >
              L3 Expert
            </button>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Password for all accounts: <code className="bg-blue-100 px-1 rounded">password123</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <EnhancedInput
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          error={errors.email && touched.email ? errors.email : undefined}
          touched={touched.email}
          onChange={updateField}
          onBlur={touchField}
          required
          disabled={isLoading}
          className="relative"
        />

        <EnhancedInput
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          error={errors.password && touched.password ? errors.password : undefined}
          touched={touched.password}
          onChange={updateField}
          onBlur={touchField}
          required
          disabled={isLoading}
          showPasswordToggle
        />

        <button
          type="submit"
          disabled={isLoading || !formData.email || !formData.password}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>


      </form>
    </div>
  );
}; 