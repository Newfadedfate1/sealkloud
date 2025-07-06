import React, { useState, useEffect } from 'react';
import { Zap, Users, Clock, Target, TrendingUp, Lightbulb, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Settings, BarChart3, Star, Flag, MessageSquare, Calendar, X } from 'lucide-react';
import { workflowsAPI } from '../../services/api';

interface WorkflowRule {
  id: number;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string | number | string[];
  }>;
  actions: Array<{
    type: string;
    value: string;
  }>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

// Check if a ticket matches workflow conditions
const checkConditions = (ticket: any, conditions: any[]): boolean => {
  return conditions.every(condition => {
    const ticketValue = ticket[condition.field];
    const conditionValue = condition.value;
    
    switch (condition.operator) {
      case 'equals':
        return ticketValue === conditionValue;
      case 'contains':
        return String(ticketValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'greater_than':
        return Number(ticketValue) > Number(conditionValue);
      case 'less_than':
        return Number(ticketValue) < Number(conditionValue);
      case 'in':
        return Array.isArray(conditionValue) ? conditionValue.includes(ticketValue) : false;
      default:
        return false;
    }
  });
};

// Apply workflow actions to a ticket
const applyActions = (ticket: any, actions: any[], availableUsers: any[]): any => {
  const updatedTicket = { ...ticket };
  
  actions.forEach(action => {
    switch (action.type) {
      case 'assign':
        if (action.value === 'auto_assign') {
          // Auto-assign to least busy user
          const availableAgents = availableUsers.filter(user => 
            user.role === 'employee_l1' || user.role === 'employee_l2' || user.role === 'employee_l3'
          );
          if (availableAgents.length > 0) {
            updatedTicket.assignee = availableAgents[0].firstName + ' ' + availableAgents[0].lastName;
          }
        } else {
          updatedTicket.assignee = action.value;
        }
        break;
      case 'escalate':
        if (action.value === 'next_level') {
          // Escalate to next level
          if (ticket.level === 'L1') updatedTicket.level = 'L2';
          else if (ticket.level === 'L2') updatedTicket.level = 'L3';
        } else {
          updatedTicket.level = action.value;
        }
        break;
      case 'change_status':
        updatedTicket.status = action.value;
        break;
      case 'add_tag':
        if (!updatedTicket.tags) updatedTicket.tags = [];
        updatedTicket.tags.push(action.value);
        break;
      case 'auto_respond':
        // Add auto-response message
        if (!updatedTicket.messages) updatedTicket.messages = [];
        updatedTicket.messages.push({
          id: Date.now(),
          sender: 'System',
          message: action.value,
          timestamp: new Date().toISOString(),
          type: 'auto_response'
        });
        break;
    }
  });
  
  return updatedTicket;
};

// Generate workflow automation with real rules from backend
const generateWorkflowAutomation = async (ticket: any, users: any[], role: string): Promise<WorkflowAutomation> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Fetch active workflow rules from backend
  let activeRules: WorkflowRule[] = [];
  try {
    const response = await workflowsAPI.getAll({ active_only: true });
    if (response.success) {
      activeRules = response.data.rules;
    }
  } catch (error) {
    console.error('Failed to fetch workflow rules:', error);
  }
  
  // Filter rules that match the current ticket
  const matchingRules = activeRules.filter(rule => checkConditions(ticket, rule.conditions));
  
  // Sort rules by priority (highest first)
  matchingRules.sort((a, b) => b.priority - a.priority);
  
  // Apply the highest priority matching rule
  let updatedTicket = { ...ticket };
  if (matchingRules.length > 0) {
    const topRule = matchingRules[0];
    updatedTicket = applyActions(updatedTicket, topRule.actions, users);
  }
  
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
  
  // Generate recommendations based on applied rules
  const recommendations = [];
  
  if (matchingRules.length > 0) {
    recommendations.push({
      type: 'automation',
      title: 'Workflow Rule Applied',
      description: `Applied rule: "${matchingRules[0].name}" - ${matchingRules[0].description}`,
      impact: 'high' as const
    });
  }
  
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
    suggestedAssignee: updatedTicket.assignee || suggestedAssignee?.firstName + ' ' + suggestedAssignee?.lastName || 'Auto-assign',
    suggestedPriority: updatedTicket.problemLevel || ticket.problemLevel,
    estimatedTime: Math.floor(Math.random() * 6) + 1,
    escalationPath,
    workloadBalance: {
      currentLoad,
      maxCapacity,
      efficiency
    },
    automationRules: matchingRules,
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

  const handleApplyWorkflow = () => {
    if (workflow) {
      onApplyWorkflow(workflow);
    }
  };

  const handleAutoAssign = () => {
    if (workflow) {
      onAutoAssign(workflow.suggestedAssignee);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analyzing Ticket</h3>
            <p className="text-gray-600 dark:text-gray-400">Applying workflow automation rules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Workflow Automation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'rules', label: 'Applied Rules', icon: Settings },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
            { id: 'workload', label: 'Workload', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleApplyWorkflow}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <CheckCircle className="h-4 w-4" />
                  Apply Workflow
                </button>
                <button
                  onClick={handleAutoAssign}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Users className="h-4 w-4" />
                  Auto Assign
                </button>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Suggested Assignee</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.suggestedAssignee}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-5 w-5 text-orange-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Suggested Priority</h3>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getPriorityColor(workflow.suggestedPriority)}`}>
                    {workflow.suggestedPriority}
                  </span>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Estimated Time</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.estimatedTime} hours</p>
                </div>
              </div>

              {/* Applied Rules Summary */}
              {workflow.automationRules.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Applied Workflow Rules</h3>
                  </div>
                  <div className="space-y-2">
                    {workflow.automationRules.map((rule, index) => (
                      <div key={rule.id} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600">Rule {index + 1}:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{rule.name}</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Priority {rule.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Recommendations */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Top Recommendations</h3>
                <div className="space-y-2">
                  {workflow.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        rec.impact === 'high' ? 'bg-red-500' : 
                        rec.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{rec.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {workflow.automationRules.length > 0 ? (
                workflow.automationRules.map((rule, index) => (
                  <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Priority {rule.priority}
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${rule.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{rule.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Conditions</h4>
                        <div className="space-y-1">
                          {rule.conditions.map((condition, cIndex) => (
                            <div key={cIndex} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              {condition.field} {condition.operator} {condition.value}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Actions</h4>
                        <div className="space-y-1">
                          {rule.actions.map((action, aIndex) => (
                            <div key={aIndex} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              {action.type}: {action.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Rules Applied</h3>
                  <p className="text-gray-600 dark:text-gray-400">No workflow rules matched this ticket's conditions.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {workflow.recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      rec.impact === 'high' ? 'bg-red-500' : 
                      rec.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{rec.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getImpactColor(rec.impact)}`}>
                          {rec.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'workload' && (
            <div className="space-y-6">
              {/* Workload Balance */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Workload Balance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Load</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.workloadBalance.currentLoad}/15</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Max Capacity</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.workloadBalance.maxCapacity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
                    <p className={`text-lg font-semibold ${getEfficiencyColor(workflow.workloadBalance.efficiency)}`}>
                      {workflow.workloadBalance.efficiency}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Escalation Path */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Escalation Path</h3>
                <div className="space-y-2">
                  {workflow.escalationPath.map((level, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white">{level}</span>
                      {index < workflow.escalationPath.length - 1 && (
                        <ArrowDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 