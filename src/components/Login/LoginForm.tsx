import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { LoginCredentials } from '../../types/user';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginCredentials>>({});

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', credentials);
    
    if (validateForm()) {
      onSubmit(credentials);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const fillDemoCredentials = (email: string, password: string = 'password123') => {
    console.log('Filling demo credentials:', { email, password });
    setCredentials({ email, password });
    setFieldErrors({});
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
        <p className="text-xs text-blue-600 mt-2">Password for all accounts: <code className="bg-blue-100 px-1 rounded">password123</code></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                fieldErrors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                fieldErrors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
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