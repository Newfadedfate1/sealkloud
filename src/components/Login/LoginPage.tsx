import React from 'react';
import { HelpCircle } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { companyConfig } from '../../config/company';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${companyConfig.theme.loginBackground} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {companyConfig.name}
          </h2>
          <p className="text-gray-600">
            Sign in to your helpdesk account
          </p>
        </div>

        {/* Login Form Card */}
        <div className={`bg-white rounded-xl ${companyConfig.theme.cardShadow} p-8`}>
          <LoginForm
            onSubmit={login}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Demo Credentials */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Credentials</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div>
              <strong>Client:</strong> client@example.com
            </div>
            <div>
              <strong>Employee:</strong> employee@example.com
            </div>
            <div>
              <strong>Admin:</strong> admin@example.com
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <strong>Password:</strong> password123
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Need help? Contact{' '}
            <a
              href={`mailto:${companyConfig.supportEmail}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {companyConfig.supportEmail}
            </a>
          </p>
          {companyConfig.supportPhone && (
            <p className="mt-1">
              Call us at{' '}
              <a
                href={`tel:${companyConfig.supportPhone}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
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