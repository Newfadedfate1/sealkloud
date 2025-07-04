import React, { useState } from 'react';
import { Key, Webhook, Plus, Edit, Trash2, Copy, Eye, EyeOff, ExternalLink, Code, Settings } from 'lucide-react';

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

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk_live_1234567890abcdef',
    permissions: ['read:tickets', 'write:tickets', 'read:users'],
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
    isActive: true
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'sk_test_abcdef1234567890',
    permissions: ['read:tickets'],
    createdAt: '2024-01-10',
    lastUsed: '2024-01-18',
    isActive: true
  }
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: '1',
    name: 'Ticket Notifications',
    url: 'https://api.example.com/webhooks/tickets',
    events: ['ticket.created', 'ticket.updated', 'ticket.closed'],
    secret: 'whsec_1234567890abcdef',
    isActive: true,
    lastTriggered: '2024-01-20T10:30:00Z',
    successRate: 98.5
  },
  {
    id: '2',
    name: 'User Sync',
    url: 'https://api.example.com/webhooks/users',
    events: ['user.created', 'user.updated'],
    secret: 'whsec_abcdef1234567890',
    isActive: false,
    lastTriggered: '2024-01-15T14:20:00Z',
    successRate: 95.2
  }
];

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

export const ApiWebhookSupport: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'webhooks'>('api');

  const generateApiKey = () => {
    return 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateWebhookSecret = () => {
    return 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const createApiKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: generateApiKey(),
      permissions: ['read:tickets'],
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      isActive: true
    };
    setApiKeys([...apiKeys, newKey]);
    setShowNewApiKey(false);
  };

  const createWebhook = () => {
    const newWebhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name: 'New Webhook',
      url: '',
      events: ['ticket.created'],
      secret: generateWebhookSecret(),
      isActive: true,
      lastTriggered: 'Never',
      successRate: 0
    };
    setWebhooks([...webhooks, newWebhook]);
    setShowNewWebhook(false);
  };

  const deleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== keyId));
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
  };

  const toggleApiKey = (keyId: string) => {
    setApiKeys(apiKeys.map(k => 
      k.id === keyId ? { ...k, isActive: !k.isActive } : k
    ));
  };

  const toggleWebhook = (webhookId: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === webhookId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Code className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API & Webhook Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'api'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </div>
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'webhooks'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </div>
        </button>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Keys</h3>
            <button
              onClick={() => setShowNewApiKey(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              New API Key
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${apiKey.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      apiKey.isActive
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleApiKeyVisibility(apiKey.id)}
                      className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleApiKey(apiKey.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        apiKey.isActive
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      }`}
                    >
                      {apiKey.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showApiKey[apiKey.id] ? 'text' : 'password'}
                        value={apiKey.key}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permissions</label>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((permission) => (
                          <span key={permission} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Used</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{apiKey.lastUsed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Webhook Endpoints</h3>
            <button
              onClick={() => setShowNewWebhook(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              New Webhook
            </button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${webhook.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{webhook.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      webhook.isActive
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {webhook.successRate}% success
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(webhook.url)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleWebhook(webhook.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        webhook.isActive
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      }`}
                    >
                      {webhook.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={webhook.url}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <a
                        href={webhook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Events</label>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <span key={event} className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Triggered</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {webhook.lastTriggered === 'Never' ? 'Never' : new Date(webhook.lastTriggered).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New API Key Modal */}
      {showNewApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New API Key</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate a new API key for external integrations. Keep this key secure and never share it publicly.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewApiKey(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Webhook Modal */}
      {showNewWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Webhook</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Set up a new webhook endpoint to receive real-time notifications about events in your system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewWebhook(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWebhook}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 