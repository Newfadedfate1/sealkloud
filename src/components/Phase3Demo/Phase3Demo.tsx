import React, { useState, useRef } from 'react';
import { AccessibilityProvider, useAccessibility } from '../Accessibility/AccessibilityProvider';
import { AccessibilitySettings } from '../Accessibility/AccessibilitySettings';
import { 
  AccessibleInput, 
  AccessibleTextarea, 
  AccessibleSelect, 
  AccessibleButton 
} from '../Accessibility/AccessibleForm';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Type, 
  Zap, 
  Volume2, 
  Keyboard,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const Phase3DemoContent: React.FC = () => {
  const {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    announceToScreenReader,
    addSkipLink,
    focusElement
  } = useAccessibility();

  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    priority: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Add skip links when component mounts
  React.useEffect(() => {
    addSkipLink('skip-main', 'Skip to main content', '#main-content');
    addSkipLink('skip-form', 'Skip to form', '#accessibility-form');
    addSkipLink('skip-settings', 'Skip to accessibility settings', '#accessibility-settings');
  }, [addSkipLink]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.priority) {
      newErrors.priority = 'Please select a priority';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader('Form has errors. Please check the highlighted fields.', 'assertive');
      return;
    }

    setIsSubmitting(true);
    announceToScreenReader('Submitting form...', 'polite');

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
    announceToScreenReader('Form submitted successfully!', 'polite');
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      priority: '',
      description: ''
    });
    setErrors({});
    setSubmitted(false);
    announceToScreenReader('Form reset', 'polite');
  };

  const priorityOptions = [
    { value: '', label: 'Select priority', disabled: true },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Phase 3: Accessibility Demo
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Accessibility Quick Actions */}
              <div className="flex items-center gap-2">
                <AccessibleButton
                  onClick={toggleHighContrast}
                  aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {highContrast ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </AccessibleButton>
                
                <AccessibleButton
                  onClick={toggleReducedMotion}
                  aria-label={`${reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Zap className="h-4 w-4" />
                </AccessibleButton>
                
                <AccessibleButton
                  onClick={() => setShowSettings(true)}
                  aria-label="Open accessibility settings"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4" />
                </AccessibleButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" ref={mainContentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Features Overview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Accessibility Features
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">High Contrast Mode</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enhanced contrast for better visibility. Currently: 
                      <span className={`ml-1 font-medium ${highContrast ? 'text-green-600' : 'text-gray-500'}`}>
                        {highContrast ? 'Enabled' : 'Disabled'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Type className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Font Size Control</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Adjustable text size for better readability. Current size: 
                      <span className="ml-1 font-medium text-blue-600 capitalize">{fontSize}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Reduced Motion</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Minimize animations for users with motion sensitivity. Currently: 
                      <span className={`ml-1 font-medium ${reducedMotion ? 'text-green-600' : 'text-gray-500'}`}>
                        {reducedMotion ? 'Enabled' : 'Disabled'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Keyboard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Keyboard Navigation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Full keyboard accessibility with focus management and skip links.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Volume2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Screen Reader Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ARIA labels, live regions, and announcements for screen readers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Keyboard Shortcuts
              </h2>
              
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

          {/* Right Column - Accessible Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 id="accessibility-form" className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Accessible Form Demo
            </h2>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Form Submitted Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This demonstrates proper form validation and accessibility feedback.
                </p>
                <AccessibleButton onClick={handleReset}>
                  Submit Another Form
                </AccessibleButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <AccessibleInput
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  error={errors.name}
                  required
                  autoComplete="name"
                />

                <AccessibleInput
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <AccessibleSelect
                  id="priority"
                  label="Priority Level"
                  value={formData.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                  options={priorityOptions}
                  error={errors.priority}
                  required
                />

                <AccessibleTextarea
                  id="description"
                  label="Description"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  error={errors.description}
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Describe your request or issue..."
                />

                <div className="flex gap-4">
                  <AccessibleButton
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Form'}
                  </AccessibleButton>
                  
                  <AccessibleButton
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Reset
                  </AccessibleButton>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Accessibility Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Accessibility Features in Action
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Try navigating with only the keyboard (Tab, Shift+Tab, Enter, Space)</li>
                <li>• Use a screen reader to experience ARIA announcements and labels</li>
                <li>• Toggle high contrast mode to see improved visibility</li>
                <li>• Adjust font size for better readability</li>
                <li>• Enable reduced motion to minimize animations</li>
                <li>• Use skip links to jump to different sections</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Accessibility Settings Modal */}
      <AccessibilitySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export const Phase3Demo: React.FC = () => {
  return (
    <AccessibilityProvider>
      <Phase3DemoContent />
    </AccessibilityProvider>
  );
}; 