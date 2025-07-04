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
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Demo Credentials
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-900 mb-1">Client Account</div>
              <div className="text-blue-700">client@sealkloud.com</div>
              <div className="text-xs text-blue-600 mt-1">View and create tickets</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-900 mb-1">Level 1 Support</div>
              <div className="text-green-700">employee@sealkloud.com</div>
              <div className="text-xs text-green-600 mt-1">Handle basic tickets</div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="font-medium text-yellow-900 mb-1">Level 2 Support</div>
              <div className="text-yellow-700">l2tech@sealkloud.com</div>
              <div className="text-xs text-yellow-600 mt-1">Advanced technical support</div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="font-medium text-orange-900 mb-1">Level 3 Expert</div>
              <div className="text-orange-700">l3expert@sealkloud.com</div>
              <div className="text-xs text-orange-600 mt-1">Complex issue resolution</div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-medium text-red-900 mb-1">Administrator</div>
              <div className="text-red-700">admin@sealkloud.com</div>
              <div className="text-xs text-red-600 mt-1">Full system access</div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
              <div className="font-medium text-gray-700">Password for all accounts:</div>
              <div className="text-lg font-mono bg-gray-100 px-3 py-1 rounded mt-1 inline-block">
                password123
              </div>
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