import React, { useState } from 'react';
import { X, AlertTriangle, FileText, Tag, Zap, Save, User, HelpCircle } from 'lucide-react';
import { ProblemLevel } from '../../types/ticket';
import { User as UserType } from '../../types/user';
import { useFormValidation, EnhancedInput, ValidationRules } from '../FormValidation/FormValidator';
import { useToastHelpers } from '../Toast/ToastContainer';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: {
    title: string;
    description: string;
    problemLevel: ProblemLevel;
    category: string;
  }) => void;
  currentUser: UserType;
}

const issueCategories = [
  { value: 'technical', label: 'Technical Issue', description: 'Software bugs, system errors' },
  { value: 'account', label: 'Account Access', description: 'Login problems, password reset' },
  { value: 'billing', label: 'Billing', description: 'Payment issues, invoices' },
  { value: 'hardware', label: 'Hardware', description: 'Equipment problems' },
  { value: 'network', label: 'Network', description: 'Connectivity issues' },
  { value: 'other', label: 'Other', description: 'General questions' }
];

const urgencyLevels = [
  {
    value: 'low' as ProblemLevel,
    label: 'Low',
    description: 'Minor issue, no rush',
    example: 'Feature request, general question'
  },
  {
    value: 'medium' as ProblemLevel,
    label: 'Medium',
    description: 'Normal business impact',
    example: 'Software bug affecting some users'
  },
  {
    value: 'high' as ProblemLevel,
    label: 'High',
    description: 'Significant business impact',
    example: 'System slow, many users affected'
  },
  {
    value: 'critical' as ProblemLevel,
    label: 'Critical',
    description: 'System down, urgent',
    example: 'Complete system outage'
  }
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const toast = useToastHelpers();
  
  // Form validation rules
  const validationRules: ValidationRules = {
    title: { required: true, minLength: 5, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 1000 },
    category: { required: true },
  };

  const {
    formData,
    errors,
    touched,
    isValid,
    updateField,
    touchField,
    validateAll,
    setIsSubmitting,
    isSubmitting,
  } = useFormValidation({
    title: '',
    description: '',
    category: '',
    problemLevel: 'medium' as ProblemLevel
  }, validationRules);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast.error('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
      
      // Reset form
      updateField('title', '');
      updateField('description', '');
      updateField('category', '');
      updateField('problemLevel', 'medium');
      
      toast.success('Ticket Created', 'Your support ticket has been created successfully.');
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Creation Failed', 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Simplified Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Create Support Ticket</h2>
              <p className="text-blue-100 text-sm mt-1">Tell us about your issue and we'll help</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Your Information</span>
            </div>
            <p className="text-gray-900">{currentUser.firstName} {currentUser.lastName}</p>
            <p className="text-gray-600 text-sm">{currentUser.email}</p>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What type of issue are you experiencing? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => updateField('category', category.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    formData.category === category.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{category.label}</div>
                  <div className="text-sm text-gray-600">{category.description}</div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Brief summary of your issue *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              onBlur={() => touchField('title')}
              placeholder="e.g., Cannot log into my account"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title && touched.title ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Please describe your issue in detail *
            </label>
            <textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              onBlur={() => touchField('description')}
              placeholder="Please include:
• What you were trying to do
• What happened instead
• When this started
• Any error messages"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description && touched.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Urgency */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How urgent is this issue? *
            </label>
            <div className="space-y-2">
              {urgencyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateField('problemLevel', level.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    formData.problemLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Example: {level.example}</div>
                    </div>
                    {formData.problemLevel === level.value && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};