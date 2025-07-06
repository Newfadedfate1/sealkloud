import React, { useState, useEffect } from 'react';
import { Key, Webhook, Plus, Edit, Trash2, Copy, Eye, EyeOff, ExternalLink, Code, Settings, Globe, Check, AlertCircle, RefreshCw } from 'lucide-react';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered: string;
  successRate: number;
}

interface ApiWebhookSupportProps {
  onClose: () => void;
}

export const ApiWebhookSupport: React.FC<ApiWebhookSupportProps> = ({ onClose }) => {
  // State management
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateApiKey, setShowCreateApiKey] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[]
  });
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });

  const availablePermissions = [
    'read:tickets',
    'write:tickets',
    'delete:tickets',
    'read:users',
    'write:users',
    'delete:users',
    'read:reports',
    'write:reports',
    'admin:all'
  ];

  const availableEvents = [
    'ticket.created',
    'ticket.updated',
    'ticket.closed',
    'ticket.assigned',
    'user.created',
    'user.updated',
    'user.deleted',
    'comment.created',
    'attachment.uploaded'
  ];

  // Load API keys and webhooks from backend
  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls when backend endpoints are implemented
      // const apiKeysResponse = await apiKeysAPI.getAll();
      // const webhooksResponse = await webhooksAPI.getAll();
      
      // For now, use empty arrays to indicate no mock data
      setApiKeys([]);
      setWebhooks([]);
    } catch (error) {
      console.error('Error loading API data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiKeysAPI.create(newApiKey);
      
      // For now, just close the modal
      setShowCreateApiKey(false);
      setNewApiKey({ name: '', permissions: [] });
      await loadData();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await webhooksAPI.create(newWebhook);
      
      // For now, just close the modal
      setShowCreateWebhook(false);
      setNewWebhook({ name: '', url: '', events: [] });
      await loadData();
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        // TODO: Replace with actual API call
        // await apiKeysAPI.delete(keyId);
        await loadData();
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      try {
        // TODO: Replace with actual API call
        // await webhooksAPI.delete(webhookId);
        await loadData();
      } catch (error) {
        console.error('Error deleting webhook:', error);
      }
    }
  };

  const toggleApiKeyStatus = async (keyId: string) => {
    try {
      // TODO: Replace with actual API call
      // await apiKeysAPI.toggleStatus(keyId);
      await loadData();
    } catch (error) {
      console.error('Error toggling API key status:', error);
    }
  };

  const toggleWebhookStatus = async (webhookId: string) => {
    try {
      // TODO: Replace with actual API call
      // await webhooksAPI.toggleStatus(webhookId);
      await loadData();
    } catch (error) {
      console.error('Error toggling webhook status:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">API & Webhook Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage API keys and webhook endpoints</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Keys Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
                <button
                  onClick={() => setShowCreateApiKey(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New API Key
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading API keys...</p>
                </div>
              ) : apiKeys.length > 0 ? (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Created {apiKey.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleApiKeyVisibility(apiKey.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showApiKey.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => copyApiKey(apiKey.key)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {copiedKey === apiKey.key ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {showApiKey.has(apiKey.id) && (
                        <div className="mb-3">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-sm break-all">
                            {apiKey.key}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => toggleApiKeyStatus(apiKey.id)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            apiKey.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No API keys found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Create your first API key to get started</p>
                </div>
              )}
            </div>

            {/* Webhooks Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Endpoints</h3>
                <button
                  onClick={() => setShowCreateWebhook(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New Webhook
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading webhooks...</p>
                </div>
              ) : webhooks.length > 0 ? (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{webhook.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{webhook.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Success Rate: {webhook.successRate}%
                        </div>
                        <button
                          onClick={() => toggleWebhookStatus(webhook.id)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            webhook.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No webhook endpoints found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Create your first webhook to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create API Key Modal */}
        {showCreateApiKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create API Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter API key name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permissions</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newApiKey.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewApiKey(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission]
                              }));
                            } else {
                              setNewApiKey(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={handleCreateApiKey}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateApiKey(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Webhook Modal */}
        {showCreateWebhook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Webhook</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter webhook name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                  <input
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://your-endpoint.com/webhook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Events</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableEvents.map((event) => (
                      <label key={event} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newWebhook.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhook(prev => ({
                                ...prev,
                                events: [...prev.events, event]
                              }));
                            } else {
                              setNewWebhook(prev => ({
                                ...prev,
                                events: prev.events.filter(e => e !== event)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={handleCreateWebhook}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateWebhook(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 