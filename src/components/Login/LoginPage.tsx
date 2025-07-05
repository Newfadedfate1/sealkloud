import React from 'react';
import { HelpCircle, Zap } from 'lucide-react';
import { EnhancedLoginForm } from './EnhancedLoginForm';
import { companyConfig } from '../../config/company';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
              <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {companyConfig.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to your helpdesk account
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <EnhancedLoginForm
            onSubmit={login}
            isLoading={isLoading}
            error={error}
          />
          
          {/* Quick Wins Demo Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                // Set demo user and login
                const demoUser = {
                  id: 'demo',
                  email: 'demo@sealkloud.com',
                  firstName: 'Demo',
                  lastName: 'User',
                  role: 'demo' as const,
                  companyId: 'sealkloud',
                  isActive: true
                };
                localStorage.setItem('user', JSON.stringify(demoUser));
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Zap className="h-5 w-5" />
              View Quick Wins Demo
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              See all the new UI/UX improvements in action
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Demo Credentials
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Client Account</div>
              <div className="text-blue-700 dark:text-blue-300">client@sealkloud.com</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">View and create tickets</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="font-medium text-green-900 dark:text-green-100 mb-1">Level 1 Support</div>
              <div className="text-green-700 dark:text-green-300">employee@sealkloud.com</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">Handle basic tickets</div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Level 2 Support</div>
              <div className="text-yellow-700 dark:text-yellow-300">l2tech@sealkloud.com</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Advanced technical support</div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <div className="font-medium text-orange-900 dark:text-orange-100 mb-1">Level 3 Expert</div>
              <div className="text-orange-700 dark:text-orange-300">l3expert@sealkloud.com</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Complex issue resolution</div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="font-medium text-red-900 dark:text-red-100 mb-1">Administrator</div>
              <div className="text-red-700 dark:text-red-300">admin@sealkloud.com</div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">Full system access</div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-center">
              <div className="font-medium text-gray-700 dark:text-gray-300">Password for all accounts:</div>
              <div className="text-lg font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 rounded mt-1 inline-block">
                password123
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Need help? Contact{' '}
            <a
              href={`mailto:${companyConfig.supportEmail}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              {companyConfig.supportEmail}
            </a>
          </p>
          {companyConfig.supportPhone && (
            <p className="mt-1">
              Call us at{' '}
              <a
                href={`tel:${companyConfig.supportPhone}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {companyConfig.supportPhone}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};