import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { AccessibleButton } from './AccessibleForm';
import { Settings, Eye, EyeOff, Type, Zap, Volume2, VolumeX } from 'lucide-react';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose
}) => {
  const {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    announceToScreenReader
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'keyboard'>('visual');

  if (!isOpen) return null;

  const handleTabChange = (tab: 'visual' | 'audio' | 'keyboard') => {
    setActiveTab(tab);
    announceToScreenReader(`${tab} accessibility settings tab selected`);
  };

  const handleClose = () => {
    onClose();
    announceToScreenReader('Accessibility settings closed');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 
              id="accessibility-settings-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              Accessibility Settings
            </h2>
          </div>
          <AccessibleButton
            onClick={handleClose}
            aria-label="Close accessibility settings"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ×
          </AccessibleButton>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('visual')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'visual'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
            aria-selected={activeTab === 'visual'}
            role="tab"
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Visual
          </button>
          <button
            onClick={() => handleTabChange('audio')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'audio'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
            aria-selected={activeTab === 'audio'}
            role="tab"
          >
            <Volume2 className="h-4 w-4 inline mr-2" />
            Audio
          </button>
          <button
            onClick={() => handleTabChange('keyboard')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'keyboard'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
            aria-selected={activeTab === 'keyboard'}
            role="tab"
          >
            <Zap className="h-4 w-4 inline mr-2" />
            Keyboard
          </button>
        </div>

        {/* Content */}
        <div className="p-6" role="tabpanel">
          {activeTab === 'visual' && (
            <div className="space-y-6">
              {/* High Contrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EyeOff className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        High Contrast
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Increase contrast for better visibility
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleHighContrast}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    role="switch"
                    aria-checked={highContrast}
                    aria-label="Toggle high contrast mode"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Font Size
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Adjust text size for better readability
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        fontSize === size
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                      aria-pressed={fontSize === size}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Reduced Motion
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reduce animations and transitions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleReducedMotion}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      reducedMotion ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    role="switch"
                    aria-checked={reducedMotion}
                    aria-label="Toggle reduced motion"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Audio Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Audio accessibility features will be available soon.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'keyboard' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Open accessibility settings
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500">
                      Ctrl + A
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Skip to main content
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500">
                      Tab
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Navigate between sections
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500">
                      Tab / Shift + Tab
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <AccessibleButton
            onClick={handleClose}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </AccessibleButton>
        </div>
      </div>
    </div>
  );
}; 