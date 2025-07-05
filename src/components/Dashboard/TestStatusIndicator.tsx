import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, BarChart3 } from 'lucide-react';

interface TestStatus {
  frontend: {
    passed: number;
    failed: number;
    coverage: number;
    lastRun: string;
  };
  backend: {
    passed: number;
    failed: number;
    coverage: number;
    lastRun: string;
  };
}

export const TestStatusIndicator: React.FC = () => {
  const [testStatus, setTestStatus] = useState<TestStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching test status
    const fetchTestStatus = async () => {
      setIsLoading(true);
      // In a real app, this would fetch from your CI/CD system or test results
      setTimeout(() => {
        setTestStatus({
          frontend: {
            passed: 3,
            failed: 0,
            coverage: 85,
            lastRun: new Date().toISOString(),
          },
          backend: {
            passed: 0,
            failed: 0,
            coverage: 0,
            lastRun: new Date().toISOString(),
          },
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchTestStatus();
  }, []);

  const getOverallStatus = () => {
    if (!testStatus) return 'unknown';
    const totalFailed = testStatus.frontend.failed + testStatus.backend.failed;
    return totalFailed === 0 ? 'passing' : 'failing';
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return 'text-green-600';
    if (coverage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failing':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!testStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Test Status Unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(getOverallStatus())}
          <span className="text-sm font-medium text-gray-900">Test Status</span>
        </div>
        <button
          onClick={() => window.open('/test-results', '_blank')}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View Details
        </button>
      </div>

      <div className="space-y-3">
        {/* Frontend Tests */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Frontend</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {testStatus.frontend.passed} passed, {testStatus.frontend.failed} failed
            </span>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-gray-400" />
              <span className={`text-xs font-medium ${getCoverageColor(testStatus.frontend.coverage)}`}>
                {testStatus.frontend.coverage}%
              </span>
            </div>
          </div>
        </div>

        {/* Backend Tests */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Backend</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {testStatus.backend.passed} passed, {testStatus.backend.failed} failed
            </span>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-gray-400" />
              <span className={`text-xs font-medium ${getCoverageColor(testStatus.backend.coverage)}`}>
                {testStatus.backend.coverage}%
              </span>
            </div>
          </div>
        </div>

        {/* Overall Coverage */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Overall Coverage</span>
            <span className="text-xs font-medium text-gray-900">
              {Math.round((testStatus.frontend.coverage + testStatus.backend.coverage) / 2)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((testStatus.frontend.coverage + testStatus.backend.coverage) / 2)}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last run: {new Date(testStatus.frontend.lastRun).toLocaleDateString()}</span>
          <button
            onClick={() => {
              // In a real app, this would trigger a test run
              console.log('Running tests...');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Run Tests
          </button>
        </div>
      </div>
    </div>
  );
}; 