import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, X, Search, Filter, RefreshCw } from 'lucide-react';
import { workflowsAPI } from '../../services/api';

export interface WorkflowRule {
  id: number;
  name: string;
  description: string;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
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

export const WorkflowAutomation: React.FC = () => {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<WorkflowRule>>({
    name: '',
    description: '',
    conditions: [],
    actions: [],
    is_active: true,
    priority: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Load workflow rules
  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterActive === 'active') params.active_only = true;
      
      const response = await workflowsAPI.getAll(params);
      
      if (response.success) {
        setRules(response.data.rules);
      } else {
        setError('Failed to load workflow rules');
      }
    } catch (err) {
      setError('Failed to load workflow rules');
      console.error('Error loading workflow rules:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterActive]);

  // Load rules on mount and when dependencies change
  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const saveRule = async () => {
    try {
      if (editingRule) {
        // Update existing rule
        const response = await workflowsAPI.update(editingRule.id.toString(), {
          name: editingRule.name,
          description: editingRule.description,
          is_active: editingRule.is_active,
          priority: editingRule.priority,
          conditions: editingRule.conditions,
          actions: editingRule.actions
        });
        
        if (response.success) {
          setSuccess('Workflow rule updated successfully');
          setEditingRule(null);
          loadRules();
        } else {
          setError(response.error?.message || 'Failed to update workflow rule');
        }
      } else if (newRule.name && newRule.description) {
        // Create new rule
        const response = await workflowsAPI.create({
          name: newRule.name,
          description: newRule.description,
          is_active: newRule.is_active || true,
          priority: newRule.priority || 1,
          conditions: newRule.conditions || [],
          actions: newRule.actions || []
        });
        
        if (response.success) {
          setSuccess('Workflow rule created successfully');
          setNewRule({ name: '', description: '', conditions: [], actions: [], is_active: true, priority: 1 });
          setShowNewRule(false);
          loadRules();
        } else {
          setError(response.error?.message || 'Failed to create workflow rule');
        }
      }
    } catch (err) {
      setError('Failed to save workflow rule');
      console.error('Error saving workflow rule:', err);
    }
  };

  const deleteRule = async (ruleId: number) => {
    try {
      const response = await workflowsAPI.delete(ruleId.toString());
      
      if (response.success) {
        setSuccess('Workflow rule deleted successfully');
        loadRules();
      } else {
        setError(response.error?.message || 'Failed to delete workflow rule');
      }
    } catch (err) {
      setError('Failed to delete workflow rule');
      console.error('Error deleting workflow rule:', err);
    }
  };

  const toggleRule = async (ruleId: number) => {
    try {
      const response = await workflowsAPI.toggle(ruleId.toString());
      
      if (response.success) {
        setSuccess('Workflow rule status updated');
        loadRules();
      } else {
        setError(response.error?.message || 'Failed to toggle workflow rule');
      }
    } catch (err) {
      setError('Failed to toggle workflow rule');
      console.error('Error toggling workflow rule:', err);
    }
  };

  // Filter rules based on search and active status
  const filteredRules = rules.filter(rule => {
    if (filterActive === 'active' && !rule.is_active) return false;
    if (filterActive === 'inactive' && rule.is_active) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workflow Automation</h2>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflow rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Rules</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          
          <button
            onClick={loadRules}
            disabled={loading}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading workflow rules...</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workflow rules found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first workflow rule'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowNewRule(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Rule
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${rule.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Priority {rule.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      rule.is_active
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {rule.is_active ? 'Active' : 'Inactive'}
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
              <p className="text-gray-600 dark:text-gray-400 mb-3">{rule.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Conditions</h4>
                  <div className="space-y-2">
                    {rule.conditions.map((condition, index) => (
                      <div key={index} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {condition.field} {condition.operator} {condition.value}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
                  <div className="space-y-2">
                    {rule.actions.map((action, index) => (
                      <div key={index} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
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

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Workflow Rule</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={editingRule.description}
                  onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editingRule.priority}
                  onChange={e => setEditingRule({ ...editingRule, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conditions</label>
                {editingRule.conditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={condition.field}
                      onChange={e => {
                        const updatedConditions = [...editingRule.conditions];
                        updatedConditions[index].field = e.target.value;
                        setEditingRule({ ...editingRule, conditions: updatedConditions });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                      <option value="category">Category</option>
                      <option value="assignee">Assignee</option>
                      <option value="client">Client</option>
                      <option value="created_date">Created Date</option>
                      <option value="last_updated">Last Updated</option>
                      <option value="tags">Tags</option>
                    </select>
                    <select
                      value={condition.operator}
                      onChange={e => {
                        const updatedConditions = [...editingRule.conditions];
                        updatedConditions[index].operator = e.target.value as any;
                        setEditingRule({ ...editingRule, conditions: updatedConditions });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="in">In</option>
                    </select>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={e => {
                        const updatedConditions = [...editingRule.conditions];
                        updatedConditions[index].value = e.target.value;
                        setEditingRule({ ...editingRule, conditions: updatedConditions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeCondition(editingRule, index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addCondition(editingRule)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add Condition
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions</label>
                {editingRule.actions.map((action, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={action.type}
                      onChange={e => {
                        const updatedActions = [...editingRule.actions];
                        updatedActions[index].type = e.target.value as any;
                        setEditingRule({ ...editingRule, actions: updatedActions });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="assign">Assign</option>
                      <option value="escalate">Escalate</option>
                      <option value="auto_respond">Auto Respond</option>
                      <option value="auto_close">Auto Close</option>
                      <option value="change_status">Change Status</option>
                      <option value="add_tag">Add Tag</option>
                    </select>
                    <input
                      type="text"
                      value={action.value}
                      onChange={e => {
                        const updatedActions = [...editingRule.actions];
                        updatedActions[index].value = e.target.value;
                        setEditingRule({ ...editingRule, actions: updatedActions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeAction(editingRule, index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addAction(editingRule)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add Action
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setEditingRule(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRule}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Rule Modal */}
      {showNewRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Workflow Rule</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newRule.priority}
                  onChange={e => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conditions</label>
                {(newRule.conditions || []).map((condition, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={condition.field}
                      onChange={e => {
                        const updatedConditions = [...(newRule.conditions || [])];
                        updatedConditions[index].field = e.target.value;
                        setNewRule({ ...newRule, conditions: updatedConditions });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                      <option value="category">Category</option>
                      <option value="assignee">Assignee</option>
                      <option value="client">Client</option>
                      <option value="created_date">Created Date</option>
                      <option value="last_updated">Last Updated</option>
                      <option value="tags">Tags</option>
                    </select>
                    <select
                      value={condition.operator}
                      onChange={e => {
                        const updatedConditions = [...(newRule.conditions || [])];
                        updatedConditions[index].operator = e.target.value as any;
                        setNewRule({ ...newRule, conditions: updatedConditions });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="in">In</option>
                    </select>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={e => {
                        const updatedConditions = [...(newRule.conditions || [])];
                        updatedConditions[index].value = e.target.value;
                        setNewRule({ ...newRule, conditions: updatedConditions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => {
                        const updatedConditions = [...(newRule.conditions || [])];
                        updatedConditions.splice(index, 1);
                        setNewRule({ ...newRule, conditions: updatedConditions });
                      }}
                      className="px-2 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newCondition: WorkflowCondition = {
                      field: 'priority',
                      operator: 'equals',
                      value: ''
                    };
                    setNewRule({
                      ...newRule,
                      conditions: [...(newRule.conditions || []), newCondition]
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add Condition
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions</label>
                {(newRule.actions || []).map((action, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={action.type}
                      onChange={e => {
                        const updatedActions = [...(newRule.actions || [])];
                        updatedActions[index].type = e.target.value as any;
                        setNewRule({ ...newRule, actions: updatedActions });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="assign">Assign</option>
                      <option value="escalate">Escalate</option>
                      <option value="auto_respond">Auto Respond</option>
                      <option value="auto_close">Auto Close</option>
                      <option value="change_status">Change Status</option>
                      <option value="add_tag">Add Tag</option>
                    </select>
                    <input
                      type="text"
                      value={action.value}
                      onChange={e => {
                        const updatedActions = [...(newRule.actions || [])];
                        updatedActions[index].value = e.target.value;
                        setNewRule({ ...newRule, actions: updatedActions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => {
                        const updatedActions = [...(newRule.actions || [])];
                        updatedActions.splice(index, 1);
                        setNewRule({ ...newRule, actions: updatedActions });
                      }}
                      className="px-2 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newAction: WorkflowAction = {
                      type: 'assign',
                      value: ''
                    };
                    setNewRule({
                      ...newRule,
                      actions: [...(newRule.actions || []), newAction]
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add Action
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowNewRule(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRule}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 