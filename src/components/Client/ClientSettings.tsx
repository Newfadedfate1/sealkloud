import React, { useState } from 'react';
import { Bell, Mail, Smartphone, RefreshCw, Moon, Sun, Globe, Shield } from 'lucide-react';

interface ClientSettingsProps {
  onClose: () => void;
}

export const ClientSettings: React.FC<ClientSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoRefresh: true,
    darkMode: false,
    language: 'en',
    timezone: 'EST'
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Email Notifications</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">SMS Notifications</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive urgent updates via SMS</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Display Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5 text-yellow-600" />
          Display & Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Auto-refresh</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically refresh ticket status</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          Regional Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="EST">Eastern Time (EST)</option>
              <option value="CST">Central Time (CST)</option>
              <option value="MST">Mountain Time (MST)</option>
              <option value="PST">Pacific Time (PST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Security
        </h3>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</span>
              <span className="text-sm text-red-600 dark:text-red-400">Not enabled</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Add an extra layer of security to your account
            </p>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
              Enable 2FA →
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}; 