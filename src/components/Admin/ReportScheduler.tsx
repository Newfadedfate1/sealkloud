import React, { useState } from 'react';
import { Calendar, FileText, Download, Mail, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';

const reportTypes = [
  { id: 'tickets', label: 'Tickets' },
  { id: 'users', label: 'Users' },
  { id: 'activity', label: 'Activity Logs' },
];

const frequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export const ReportScheduler: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['tickets']);
  const [frequency, setFrequency] = useState('weekly');
  const [email, setEmail] = useState('');
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [isScheduled, setIsScheduled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSchedule = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setIsScheduled(true);
    setSuccess('Report scheduled successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSuccess('Report generated! Download will start shortly.');
      setTimeout(() => setSuccess(''), 2000);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Automated Reporting</h2>
      </div>
      {success && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4">
          <XCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Data</label>
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeToggle(type.id)}
              className={`px-3 py-1 rounded text-xs font-medium border ${selectedTypes.includes(type.id)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} transition-colors`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
        <div className="flex gap-2">
          {frequencies.map((freq) => (
            <button
              key={freq.id}
              type="button"
              onClick={() => setFrequency(freq.id)}
              className={`px-3 py-1 rounded text-xs font-medium border ${frequency === freq.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} transition-colors`}
            >
              {freq.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email To</label>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@sealkloud.com"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormat('pdf')}
            className={`px-3 py-1 rounded text-xs font-medium border ${format === 'pdf'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} transition-colors`}
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => setFormat('csv')}
            className={`px-3 py-1 rounded text-xs font-medium border ${format === 'csv'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} transition-colors`}
          >
            CSV
          </button>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSchedule}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          <Settings className="h-4 w-4 inline mr-1" /> Schedule
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {isGenerating ? (
            <Clock className="h-4 w-4 animate-spin inline mr-1" />
          ) : (
            <Download className="h-4 w-4 inline mr-1" />
          )}
          Generate Now
        </button>
      </div>
    </div>
  );
}; 