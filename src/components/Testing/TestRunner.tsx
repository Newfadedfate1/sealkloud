import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, BarChart3, RefreshCw } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
  coverage?: number;
}

export const TestRunner: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Frontend Tests',
      status: 'pending',
      tests: [
        { id: '1', name: 'Simple test component renders', status: 'pending' },
        { id: '2', name: 'Basic math operations', status: 'pending' },
        { id: '3', name: 'String operations', status: 'pending' },
      ]
    },
    {
      name: 'Backend Tests',
      status: 'pending',
      tests: [
        { id: '4', name: 'Server health check', status: 'pending' },
        { id: '5', name: 'Database connection', status: 'pending' },
      ]
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'running' | 'completed'>('pending');

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');

    // Simulate running tests
    for (const suite of testSuites) {
      setTestSuites(prev => prev.map(s => 
        s.name === suite.name ? { ...s, status: 'running' } : s
      ));

      for (const test of suite.tests) {
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        const passed = Math.random() > 0.1; // 90% pass rate
        
        setTestSuites(prev => prev.map(s => 
          s.name === suite.name 
            ? {
                ...s,
                tests: s.tests.map(t => 
                  t.id === test.id 
                    ? {
                        ...t,
                        status: passed ? 'passed' : 'failed',
                        duration: Math.floor(Math.random() * 200) + 50,
                        error: passed ? undefined : 'Test assertion failed'
                      }
                    : t
                )
              }
            : s
        ));
      }

      // Calculate coverage
      const passedTests = suite.tests.filter(t => t.status === 'passed').length;
      const coverage = Math.floor((passedTests / suite.tests.length) * 100);

      setTestSuites(prev => prev.map(s => 
        s.name === suite.name 
          ? { ...s, status: 'completed', coverage }
          : s
      ));
    }

    setIsRunning(false);
    setOverallStatus('completed');
  };

  const resetTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'pending',
      coverage: undefined,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'pending' as const,
        duration: undefined,
        error: undefined
      }))
    })));
    setOverallStatus('pending');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOverallIcon = () => {
    switch (overallStatus) {
      case 'completed':
        const allPassed = testSuites.every(suite => 
          suite.tests.every(test => test.status === 'passed')
        );
        return allPassed 
          ? <CheckCircle className="h-6 w-6 text-green-500" />
          : <XCircle className="h-6 w-6 text-red-500" />;
      case 'running':
        return <Clock className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
  const passedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'passed').length, 0
  );
  const failedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'failed').length, 0
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getOverallIcon()}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Runner</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalTests} tests • {passedTests} passed • {failedTests} failed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetTests}
            disabled={isRunning}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {testSuites.map(suite => (
          <div key={suite.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">{suite.name}</h3>
              <div className="flex items-center gap-2">
                {suite.coverage !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <BarChart3 className="h-4 w-4" />
                    <span>{suite.coverage}% coverage</span>
                  </div>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  suite.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : suite.status === 'running'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {suite.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {suite.tests.map(test => (
                <div key={test.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className="text-sm text-gray-900 dark:text-white">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {test.duration && <span>{test.duration}ms</span>}
                    {test.error && (
                      <span className="text-red-500" title={test.error}>
                        Error
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {overallStatus === 'completed' && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Tests:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{totalTests}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Passed:</span>
              <span className="ml-2 font-medium text-green-600 dark:text-green-400">{passedTests}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Failed:</span>
              <span className="ml-2 font-medium text-red-600 dark:text-red-400">{failedTests}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 