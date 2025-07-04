import React, { useState } from 'react';
import { X, AlertTriangle, FileText, Tag, Zap, Save, User, Mail } from 'lucide-react';
import { ProblemLevel } from '../../types/ticket';
import { User as UserType } from '../../types/user';

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
  { value: 'technical', label: 'Technical Issue', icon: '🔧' },
  { value: 'account', label: 'Account Access', icon: '👤' },
  { value: 'billing', label: 'Billing & Payment', icon: '💳' },
  { value: 'software', label: 'Software Problem', icon: '💻' },
  { value: 'hardware', label: 'Hardware Issue', icon: '🖥️' },
  { value: 'network', label: 'Network/Connectivity', icon: '🌐' },
  { value: 'security', label: 'Security Concern', icon: '🔒' },
  { value: 'feature', label: 'Feature Request', icon: '✨' },
  { value: 'other', label: 'Other', icon: '❓' }
];

const urgencyLevels = [
  {
    value: 'low' as ProblemLevel,
    label: 'Low',
    description: 'Minor issue, no immediate impact',
    color: 'text-green-700 bg-green-50 border-green-200',
    icon: '🟢'
  },
  {
    value: 'medium' as ProblemLevel,
    label: 'Medium',
    description: 'Moderate impact, affects some functionality',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    icon: '🟡'
  },
  {
    value: 'high' as ProblemLevel,
    label: 'High',
    description: 'Significant impact, affects business operations',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    icon: '🟠'
  },
  {
    value: 'critical' as ProblemLevel,
    label: 'Critical',
    description: 'System down, severe business impact',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: '🔴'
  }
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    problemLevel: 'medium' as ProblemLevel
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Please provide more details (at least 20 characters)';
    }

    if (!formData.category) {
      newErrors.category = 'Please select an issue category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        problemLevel: 'medium'
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Support Ticket</h2>
              <p className="text-blue-100 mt-1">Describe your issue and we'll help you resolve it</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Client Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <p className="font-medium text-gray-900">{currentUser.firstName} {currentUser.lastName}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{currentUser.email}</p>
              </div>
            </div>
          </div>

          {/* Issue Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Issue Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {issueCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                    formData.category === category.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Issue Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of your issue..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
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
              Detailed Description *
            </label>
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please provide detailed information about your issue:
• What were you trying to do?
• What happened instead?
• When did this start occurring?
• Any error messages you received?
• Steps to reproduce the issue..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              )}
            </div>
          </div>

          {/* Urgency Level */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Urgency Level *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgencyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('problemLevel', level.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                    formData.problemLevel === level.value
                      ? `border-current ${level.color}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{level.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{level.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
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