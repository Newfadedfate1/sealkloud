import React, { useState } from 'react';
import { Zap, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, X } from 'lucide-react';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  priority: number;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: string | number | string[];
}

export interface WorkflowAction {
  type: 'assign' | 'escalate' | 'auto_respond' | 'auto_close' | 'change_status' | 'add_tag';
  value: string;
}

const mockWorkflowRules: WorkflowRule[] = [
  {
    id: '1',
    name: 'High Priority Auto-Assignment',
    description: 'Automatically assign high priority tickets to senior staff',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'high' },
      { field: 'status', operator: 'equals', value: 'open' }
    ],
    actions: [
      { type: 'assign', value: 'senior-support' },
      { type: 'change_status', value: 'in_progress' }
    ],
    isActive: true,
    priority: 1
  },
  {
    id: '2',
    name: 'Stale Ticket Auto-Close',
    description: 'Auto-close tickets that have been inactive for 30 days',
    conditions: [
      { field: 'last_updated', operator: 'less_than', value: '30_days' },
      { field: 'status', operator: 'in', value: ['open', 'in_progress'] }
    ],
    actions: [
      { type: 'auto_respond', value: 'ticket_auto_closed' },
      { type: 'change_status', value: 'closed' }
    ],
    isActive: true,
    priority: 2
  }
];

const availableFields = [
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'category', label: 'Category' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'client', label: 'Client' },
  { value: 'created_date', label: 'Created Date' },
  { value: 'last_updated', label: 'Last Updated' },
  { value: 'tags', label: 'Tags' }
];

const availableOperators = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In' }
];

const availableActions = [
  { value: 'assign', label: 'Assign to User' },
  { value: 'escalate', label: 'Escalate' },
  { value: 'auto_respond', label: 'Auto Respond' },
  { value: 'auto_close', label: 'Auto Close' },
  { value: 'change_status', label: 'Change Status' },
  { value: 'add_tag', label: 'Add Tag' }
];

export const WorkflowAutomation: React.FC = () => {
  const [rules, setRules] = useState<WorkflowRule[]>(mockWorkflowRules);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<WorkflowRule>>({
    name: '',
    description: '',
    conditions: [],
    actions: [],
    isActive: true,
    priority: 1
  });

  const addCondition = (rule: WorkflowRule) => {
    const newCondition: WorkflowCondition = {
      field: 'priority',
      operator: 'equals',
      value: ''
    };
    rule.conditions.push(newCondition);
    setEditingRule({ ...rule });
  };

  const removeCondition = (rule: WorkflowRule, index: number) => {
    rule.conditions.splice(index, 1);
    setEditingRule({ ...rule });
  };

  const addAction = (rule: WorkflowRule) => {
    const newAction: WorkflowAction = {
      type: 'assign',
      value: ''
    };
    rule.actions.push(newAction);
    setEditingRule({ ...rule });
  };

  const removeAction = (rule: WorkflowRule, index: number) => {
    rule.actions.splice(index, 1);
    setEditingRule({ ...rule });
  };

  const saveRule = () => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? editingRule : r));
      setEditingRule(null);
    } else if (newRule.name && newRule.description) {
      const rule: WorkflowRule = {
        id: Date.now().toString(),
        name: newRule.name,
        description: newRule.description,
        conditions: newRule.conditions || [],
        actions: newRule.actions || [],
        isActive: newRule.isActive || true,
        priority: newRule.priority || 1
      };
      setRules([...rules, rule]);
      setNewRule({ name: '', description: '', conditions: [], actions: [], isActive: true, priority: 1 });
      setShowNewRule(false);
    }
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId));
  };

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workflow Automation</h2>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowNewRule(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          New Workflow Rule
        </button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  Priority {rule.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    rule.isActive
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {rule.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{rule.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Conditions</h4>
                <div className="space-y-2">
                  {rule.conditions.map((condition, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      {condition.field} {condition.operator} {condition.value}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
                <div className="space-y-2">
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

      {/* Edit/New Rule Modal */}
      {(editingRule || showNewRule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingRule ? 'Edit Workflow Rule' : 'New Workflow Rule'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule?.name || newRule.name}
                  onChange={(e) => {
                    if (editingRule) {
                      setEditingRule({ ...editingRule, name: e.target.value });
                    } else {
                      setNewRule({ ...newRule, name: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingRule?.description || newRule.description}
                  onChange={(e) => {
                    if (editingRule) {
                      setEditingRule({ ...editingRule, description: e.target.value });
                    } else {
                      setNewRule({ ...newRule, description: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conditions</label>
                {(editingRule?.conditions || newRule.conditions || []).map((condition, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <select
                      value={condition.field}
                      onChange={(e) => {
                        const updatedConditions = [...(editingRule?.conditions || newRule.conditions || [])];
                        updatedConditions[index].field = e.target.value;
                        if (editingRule) {
                          setEditingRule({ ...editingRule, conditions: updatedConditions });
                        } else {
                          setNewRule({ ...newRule, conditions: updatedConditions });
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {availableFields.map(field => (
                        <option key={field.value} value={field.value}>{field.label}</option>
                      ))}
                    </select>
                    <select
                      value={condition.operator}
                      onChange={(e) => {
                        const updatedConditions = [...(editingRule?.conditions || newRule.conditions || [])];
                        updatedConditions[index].operator = e.target.value as any;
                        if (editingRule) {
                          setEditingRule({ ...editingRule, conditions: updatedConditions });
                        } else {
                          setNewRule({ ...newRule, conditions: updatedConditions });
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {availableOperators.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => {
                        const updatedConditions = [...(editingRule?.conditions || newRule.conditions || [])];
                        updatedConditions[index].value = e.target.value;
                        if (editingRule) {
                          setEditingRule({ ...editingRule, conditions: updatedConditions });
                        } else {
                          setNewRule({ ...newRule, conditions: updatedConditions });
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeCondition(editingRule || newRule as WorkflowRule, index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addCondition(editingRule || newRule as WorkflowRule)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add Condition
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions</label>
                {(editingRule?.actions || newRule.actions || []).map((action, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <select
                      value={action.type}
                      onChange={(e) => {
                        const updatedActions = [...(editingRule?.actions || newRule.actions || [])];
                        updatedActions[index].type = e.target.value as any;
                        if (editingRule) {
                          setEditingRule({ ...editingRule, actions: updatedActions });
                        } else {
                          setNewRule({ ...newRule, actions: updatedActions });
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {availableActions.map(act => (
                        <option key={act.value} value={act.value}>{act.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={action.value}
                      onChange={(e) => {
                        const updatedActions = [...(editingRule?.actions || newRule.actions || [])];
                        updatedActions[index].value = e.target.value;
                        if (editingRule) {
                          setEditingRule({ ...editingRule, actions: updatedActions });
                        } else {
                          setNewRule({ ...newRule, actions: updatedActions });
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeAction(editingRule || newRule as WorkflowRule, index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addAction(editingRule || newRule as WorkflowRule)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add Action
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingRule(null);
                  setShowNewRule(false);
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRule}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 