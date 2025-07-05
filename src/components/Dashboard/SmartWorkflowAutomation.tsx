import React, { useState, useEffect } from 'react';
import { Zap, Users, Clock, Target, TrendingUp, Lightbulb, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Settings, BarChart3, Star, Flag, MessageSquare, Calendar } from 'lucide-react';

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
      impact: 'high'
    });
  }
  
  if (efficiency < 50) {
    recommendations.push({
      type: 'workload',
      title: 'High Workload Detected',
      description: 'Current workload is high. Consider reassigning to balance load',
      impact: 'medium'
    });
  }
  
  if (content.includes('technical') || content.includes('complex')) {
    recommendations.push({
      type: 'assignment',
      title: 'Technical Expertise Required',
      description: 'This ticket requires technical expertise. Consider L2/L3 assignment',
      impact: 'high'
    });
  }
  
  recommendations.push({
    type: 'monitoring',
    title: 'Monitor Response Time',
    description: 'Set up automated monitoring for this ticket to ensure SLA compliance',
    impact: 'low'
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

  if (isProcessing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Generating smart workflow...</span>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Workflow Unavailable</h3>
          <p className="text-gray-500 dark:text-gray-400">Unable to generate workflow at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Workflow</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent automation and routing</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Suggested</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {workflow.suggestedAssignee}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {workflow.suggestedPriority}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Est. Time</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {workflow.estimatedTime}h
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
          </div>
          <div className={`text-lg font-bold ${getEfficiencyColor(workflow.workloadBalance.efficiency)}`}>
            {workflow.workloadBalance.efficiency}%
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Automation Rules
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveTab('workload')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'workload'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Workload
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Escalation Path</h3>
            <div className="space-y-3">
              {workflow.escalationPath.map((level, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
                    <ArrowUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{level}</span>
                  {index < workflow.escalationPath.length - 1 && (
                    <ArrowDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => onAutoAssign(workflow.suggestedAssignee)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Users className="h-4 w-4" />
                Auto-Assign Ticket
              </button>
              <button
                onClick={() => onApplyWorkflow(workflow)}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Apply Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Automation Rules</h3>
          {workflow.automationRules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">Priority: {rule.priority}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rule.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Conditions</h5>
                  <div className="space-y-1">
                    {rule.conditions.map((condition, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {condition.field} {condition.operator} {condition.value}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h5>
                  <div className="space-y-1">
                    {rule.actions.map((action, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {action.type}: {action.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h3>
          {workflow.recommendations.map((recommendation, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getImpactColor(recommendation.impact)}`}>
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{recommendation.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(recommendation.impact)}`}>
                      {recommendation.impact} impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'workload' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workload Balance</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 dark:text-gray-300">Current Load</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {workflow.workloadBalance.currentLoad} / {workflow.workloadBalance.maxCapacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    workflow.workloadBalance.efficiency >= 80 ? 'bg-green-500' :
                    workflow.workloadBalance.efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(workflow.workloadBalance.currentLoad / workflow.workloadBalance.maxCapacity) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                <span className={`text-sm font-medium ${getEfficiencyColor(workflow.workloadBalance.efficiency)}`}>
                  {workflow.workloadBalance.efficiency}%
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Availability</h3>
            <div className="space-y-3">
              {availableUsers.filter(user => user.role === userRole).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {user.firstName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onAutoAssign(workflow.suggestedAssignee)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Auto-Assign
        </button>
        <button
          onClick={() => onApplyWorkflow(workflow)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Apply Workflow
        </button>
        <button
          onClick={generateWorkflow}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Regenerate
        </button>
        <button
          onClick={onClose}
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}; 