import React, { useState, useEffect } from 'react';
import { Zap, Users, Clock, Target, TrendingUp, Lightbulb, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Settings, BarChart3, Star, Flag, MessageSquare, Calendar, X } from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    value: string;
  }>;
  priority: number;
  isActive: boolean;
}

interface WorkflowAutomation {
  id: string;
  ticketId: string;
  suggestedAssignee: string;
  suggestedPriority: string;
  estimatedTime: number;
  escalationPath: string[];
  workloadBalance: {
    currentLoad: number;
    maxCapacity: number;
    efficiency: number;
  };
  automationRules: WorkflowRule[];
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface SmartWorkflowAutomationProps {
  ticket: any;
  availableUsers: any[];
  userRole: 'employee_l1' | 'employee_l2' | 'employee_l3';
  onApplyWorkflow: (workflow: WorkflowAutomation) => void;
  onAutoAssign: (assignee: string) => void;
  onClose: () => void;
}

// Mock workflow automation - replace with actual AI/ML logic
const generateWorkflowAutomation = async (ticket: any, users: any[], role: string): Promise<WorkflowAutomation> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Analyze ticket content
  const content = `${ticket.title} ${ticket.description}`.toLowerCase();
  
  // Determine suggested assignee based on skills and workload
  const availableAgents = users.filter(user => user.role === role);
  const suggestedAssignee = availableAgents[Math.floor(Math.random() * availableAgents.length)];
  
  // Calculate workload balance
  const currentLoad = Math.floor(Math.random() * 10) + 1;
  const maxCapacity = 15;
  const efficiency = Math.round(((maxCapacity - currentLoad) / maxCapacity) * 100);
  
  // Determine escalation path
  const escalationPath = [];
  if (role === 'employee_l1') {
    escalationPath.push('L2 Technical Support');
    escalationPath.push('L3 Expert Support');
  } else if (role === 'employee_l2') {
    escalationPath.push('L3 Expert Support');
  }
  
  // Generate automation rules
  const automationRules: WorkflowRule[] = [
    {
      id: 'rule-1',
      name: 'Critical Issue Escalation',
      description: 'Automatically escalate critical issues to higher level support',
      conditions: [
        { field: 'priority', operator: 'equals', value: 'critical' }
      ],
      actions: [
        { type: 'escalate', value: 'next_level' }
      ],
      priority: 1,
      isActive: true
    },
    {
      id: 'rule-2',
      name: 'Response Time Alert',
      description: 'Send alert if ticket response time exceeds SLA',
      conditions: [
        { field: 'response_time', operator: 'greater_than', value: '2_hours' }
      ],
      actions: [
        { type: 'notify', value: 'manager' }
      ],
      priority: 2,
      isActive: true
    },
    {
      id: 'rule-3',
      name: 'Workload Balancing',
      description: 'Distribute tickets evenly across available agents',
      conditions: [
        { field: 'workload', operator: 'greater_than', value: '80_percent' }
      ],
      actions: [
        { type: 'reassign', value: 'least_busy_agent' }
      ],
      priority: 3,
      isActive: true
    }
  ];
  
  // Generate recommendations
  const recommendations = [];
  
  if (content.includes('urgent') || content.includes('critical')) {
    recommendations.push({
      type: 'escalation',
      title: 'Immediate Escalation Recommended',
      description: 'This ticket contains urgent keywords and should be escalated immediately',
      impact: 'high' as const
    });
  }
  
  if (efficiency < 50) {
    recommendations.push({
      type: 'workload',
      title: 'High Workload Detected',
      description: 'Current workload is high. Consider reassigning to balance load',
      impact: 'medium' as const
    });
  }
  
  if (content.includes('technical') || content.includes('complex')) {
    recommendations.push({
      type: 'assignment',
      title: 'Technical Expertise Required',
      description: 'This ticket requires technical expertise. Consider L2/L3 assignment',
      impact: 'high' as const
    });
  }
  
  recommendations.push({
    type: 'monitoring',
    title: 'Monitor Response Time',
    description: 'Set up automated monitoring for this ticket to ensure SLA compliance',
    impact: 'low' as const
  });
  
  return {
    id: `workflow-${ticket.id}`,
    ticketId: ticket.id,
    suggestedAssignee: suggestedAssignee?.firstName + ' ' + suggestedAssignee?.lastName || 'Auto-assign',
    suggestedPriority: ticket.problemLevel,
    estimatedTime: Math.floor(Math.random() * 6) + 1,
    escalationPath,
    workloadBalance: {
      currentLoad,
      maxCapacity,
      efficiency
    },
    automationRules,
    recommendations
  };
};

export const SmartWorkflowAutomation: React.FC<SmartWorkflowAutomationProps> = ({
  ticket,
  availableUsers,
  userRole,
  onApplyWorkflow,
  onAutoAssign,
  onClose
}) => {
  const [workflow, setWorkflow] = useState<WorkflowAutomation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'recommendations' | 'workload'>('overview');

  useEffect(() => {
    if (ticket) {
      generateWorkflow();
    }
  }, [ticket]);

  const generateWorkflow = async () => {
    setIsProcessing(true);
    try {
      const result = await generateWorkflowAutomation(ticket, availableUsers, userRole);
      setWorkflow(result);
    } catch (error) {
      console.error('Workflow generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Workflow Automation</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent routing and automation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'rules', label: 'Automation Rules', icon: Settings },
                { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                { id: 'workload', label: 'Workload Balance', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Generating workflow automation...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Workflow Automation</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent routing and automation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'rules', label: 'Automation Rules', icon: Settings },
                { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                { id: 'workload', label: 'Workload Balance', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Workflow Generation Failed</h3>
              <p className="text-gray-600 dark:text-gray-400">Unable to generate workflow automation. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Workflow Automation</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent routing and automation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'rules', label: 'Automation Rules', icon: Settings },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'workload', label: 'Workload Balance', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {isProcessing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Generating workflow automation...</p>
              </div>
            </div>
          ) : workflow ? (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workflow Overview</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Suggested Assignment */}
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Suggested Assignment</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Assignee:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{workflow.suggestedAssignee}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workflow.suggestedPriority)}`}>
                              {workflow.suggestedPriority}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Est. Time:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{workflow.estimatedTime} hours</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onAutoAssign(workflow.suggestedAssignee)}
                          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Auto-Assign
                        </button>
                      </div>

                      {/* Escalation Path */}
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Escalation Path</h4>
                        <div className="space-y-2">
                          {workflow.escalationPath.map((level, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{index + 1}</span>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{level}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Workload Balance */}
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Workload Balance</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Current Load:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{workflow.workloadBalance.currentLoad}/{workflow.workloadBalance.maxCapacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getEfficiencyColor(workflow.workloadBalance.efficiency)}`}
                              style={{ width: `${(workflow.workloadBalance.currentLoad / workflow.workloadBalance.maxCapacity) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency:</span>
                            <span className={`text-sm font-medium ${getEfficiencyColor(workflow.workloadBalance.efficiency)}`}>
                              {workflow.workloadBalance.efficiency}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Automation Rules</h3>
                    
                    <div className="space-y-4">
                      {workflow.automationRules.map((rule) => (
                        <div key={rule.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rule.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                              }`}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Priority {rule.priority}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Conditions</h5>
                              <div className="space-y-1">
                                {rule.conditions.map((condition, index) => (
                                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                    {condition.field} {condition.operator} {condition.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Actions</h5>
                              <div className="space-y-1">
                                {rule.actions.map((action, index) => (
                                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                    {action.type}: {action.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h3>
                    
                    <div className="space-y-4">
                      {workflow.recommendations.map((recommendation, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getImpactColor(recommendation.impact)}`}>
                              <Lightbulb className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{recommendation.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{recommendation.description}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                                {recommendation.impact} impact
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'workload' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workload Management</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Current Workload */}
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Current Workload</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Active Tickets:</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{workflow.workloadBalance.currentLoad}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Capacity:</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{workflow.workloadBalance.maxCapacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${getEfficiencyColor(workflow.workloadBalance.efficiency)}`}
                              style={{ width: `${(workflow.workloadBalance.currentLoad / workflow.workloadBalance.maxCapacity) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-center">
                            <span className={`text-2xl font-bold ${getEfficiencyColor(workflow.workloadBalance.efficiency)}`}>
                              {workflow.workloadBalance.efficiency}%
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
                          </div>
                        </div>
                      </div>

                      {/* Workload Optimization */}
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Optimization Suggestions</h4>
                        <div className="space-y-3">
                          {workflow.workloadBalance.efficiency < 70 && (
                            <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Consider redistributing workload for better balance</span>
                            </div>
                          )}
                          {workflow.workloadBalance.efficiency > 90 && (
                            <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Workload is well-balanced and efficient</span>
                            </div>
                          )}
                          <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Monitor peak hours and adjust capacity accordingly</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Workflow Generation Failed</h3>
              <p className="text-gray-600 dark:text-gray-400">Unable to generate workflow automation. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 