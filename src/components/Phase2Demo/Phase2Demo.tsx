import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Bug, 
  Shield, 
  Zap,
  ArrowLeft,
  Play,
  Stop,
  RefreshCw
} from 'lucide-react';
import { useToastHelpers } from '../Toast/ToastContainer';
import { EnhancedInput, useFormValidation, ValidationRules } from '../FormValidation/FormValidator';
import { api, ApiError } from '../../services/api';

interface Phase2DemoProps {
  onBack: () => void;
}

export const Phase2Demo: React.FC<Phase2DemoProps> = ({ onBack }) => {
  const toast = useToastHelpers();
  const [activeSection, setActiveSection] = useState<'overview' | 'error-boundary' | 'toasts' | 'validation' | 'api'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Form validation for demo
  const validationRules: ValidationRules = {
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    password: { required: true, minLength: 8 },
    confirmPassword: { required: true, match: 'password' },
  };

  const {
    formData,
    errors,
    touched,
    isValid,
    updateField,
    touchField,
    validateAll,
  } = useFormValidation({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }, validationRules);

  // Demo functions
  const triggerErrorBoundary = () => {
    throw new Error('This is a simulated error to test the Error Boundary!');
  };

  const showToastExamples = () => {
    toast.success('Success Toast', 'This is a success message with an action!', {
      action: {
        label: 'Undo',
        onClick: () => toast.info('Undone!', 'Action was undone.'),
      },
    });

    setTimeout(() => {
      toast.error('Error Toast', 'This is an error message with details.');
    }, 1000);

    setTimeout(() => {
      toast.warning('Warning Toast', 'This is a warning message.');
    }, 2000);

    setTimeout(() => {
      toast.info('Info Toast', 'This is an informational message.');
    }, 3000);

    setTimeout(() => {
      const loadingId = toast.loading('Loading...', 'Processing your request...');
      setTimeout(() => {
        toast.dismiss(loadingId);
        toast.success('Complete!', 'Your request has been processed.');
      }, 3000);
    }, 4000);
  };

  const testApiErrors = async () => {
    setIsLoading(true);
    
    try {
      // Test network error
      await api.get('/nonexistent-endpoint');
    } catch (error) {
      console.log('Expected API error:', error);
    }

    try {
      // Test 404 error
      await api.get('/api/not-found', false);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('API Error Test', `Status: ${error.status} - ${error.message}`);
      }
    }

    try {
      // Test 500 error
      await api.get('/api/server-error', false);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Server Error Test', `Status: ${error.status} - ${error.message}`);
      }
    }

    setIsLoading(false);
  };

  const testFormValidation = () => {
    if (!validateAll()) {
      toast.error('Validation Failed', 'Please fix the form errors before submitting.');
      return;
    }
    
    toast.success('Form Valid!', 'All validation rules passed.');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Phase 2: Error Handling & User Feedback
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive error handling, user feedback, and form validation improvements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-6 w-6 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Error Boundary</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Global error catching with user-friendly error pages and error reporting
          </p>
          <button
            onClick={() => setActiveSection('error-boundary')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Test Error Boundary →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-6 w-6 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Toast Notifications</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Rich toast notifications with actions, auto-dismiss, and multiple types
          </p>
          <button
            onClick={() => setActiveSection('toasts')}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Test Toasts →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-6 w-6 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Form Validation</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Real-time validation with visual feedback and comprehensive rules
          </p>
          <button
            onClick={() => setActiveSection('validation')}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Test Validation →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Bug className="h-6 w-6 text-red-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">API Error Handling</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Enhanced API error handling with retry logic and user-friendly messages
          </p>
          <button
            onClick={() => setActiveSection('api')}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Test API Errors →
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Key Improvements</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Global error boundary with error reporting</li>
          <li>• Toast notification system with actions</li>
          <li>• Real-time form validation with visual feedback</li>
          <li>• Enhanced API error handling with retry logic</li>
          <li>• User-friendly error messages and recovery options</li>
        </ul>
      </div>
    </div>
  );

  const renderErrorBoundary = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Error Boundary Testing
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test the global error boundary and error handling
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Simulate Errors</h3>
          <div className="space-y-3">
            <button
              onClick={triggerErrorBoundary}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Trigger Error Boundary
            </button>
            
            <button
              onClick={() => {
                const error = new Error('Custom error message');
                error.name = 'CustomError';
                throw error;
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Bug className="h-4 w-4 inline mr-2" />
              Throw Custom Error
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Error Boundary Features</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Catches React component errors</li>
            <li>• User-friendly error page</li>
            <li>• Error reporting with unique IDs</li>
            <li>• Retry functionality</li>
            <li>• Navigation options</li>
            <li>• Development error details</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderToasts = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Toast Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test different types of toast notifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Toast Types</h3>
          <div className="space-y-3">
            <button
              onClick={() => toast.success('Success!', 'Operation completed successfully.')}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Success Toast
            </button>
            
            <button
              onClick={() => toast.error('Error!', 'Something went wrong.')}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Error Toast
            </button>
            
            <button
              onClick={() => toast.warning('Warning!', 'Please check your input.')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Warning Toast
            </button>
            
            <button
              onClick={() => toast.info('Info!', 'Here is some information.')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Info className="h-4 w-4 inline mr-2" />
              Info Toast
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Advanced Features</h3>
          <div className="space-y-3">
            <button
              onClick={showToastExamples}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Play className="h-4 w-4 inline mr-2" />
              Show All Examples
            </button>
            
            <button
              onClick={() => {
                const id = toast.loading('Processing...', 'Please wait...');
                setTimeout(() => {
                  toast.dismiss(id);
                  toast.success('Complete!', 'Processing finished.');
                }, 3000);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Loading Toast
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValidation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Form Validation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test real-time form validation with visual feedback
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={(e) => { e.preventDefault(); testFormValidation(); }} className="space-y-4">
          <EnhancedInput
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            error={errors.name}
            touched={touched.name}
            onChange={updateField}
            onBlur={touchField}
            required
          />

          <EnhancedInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            error={errors.email}
            touched={touched.email}
            onChange={updateField}
            onBlur={touchField}
            required
          />

          <EnhancedInput
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            error={errors.password}
            touched={touched.password}
            onChange={updateField}
            onBlur={touchField}
            required
            showPasswordToggle
            validationRules={validationRules.password}
          />

          <EnhancedInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            onChange={updateField}
            onBlur={touchField}
            required
            showPasswordToggle
          />

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Submit Form
          </button>
        </form>
      </div>
    </div>
  );

  const renderApi = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          API Error Handling
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test enhanced API error handling and retry logic
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Error Tests</h3>
          <div className="space-y-3">
            <button
              onClick={testApiErrors}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Bug className="h-4 w-4 inline mr-2" />
                  Test API Errors
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">API Features</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Automatic retry with exponential backoff</li>
            <li>• User-friendly error messages</li>
            <li>• Error reporting with request IDs</li>
            <li>• Network error handling</li>
            <li>• HTTP status code handling</li>
            <li>• Request timeout management</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeSection === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('error-boundary')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeSection === 'error-boundary'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Error Boundary
            </button>
            <button
              onClick={() => setActiveSection('toasts')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeSection === 'toasts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Toasts
            </button>
            <button
              onClick={() => setActiveSection('validation')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeSection === 'validation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Validation
            </button>
            <button
              onClick={() => setActiveSection('api')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeSection === 'api'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              API
            </button>
          </div>
        </div>

        {/* Content */}
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'error-boundary' && renderErrorBoundary()}
        {activeSection === 'toasts' && renderToasts()}
        {activeSection === 'validation' && renderValidation()}
        {activeSection === 'api' && renderApi()}
      </div>
    </div>
  );
}; 