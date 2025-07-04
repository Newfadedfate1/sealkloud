import React, { useState } from 'react';
import { UserCog, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const allPermissions = [
  'view_tickets',
  'edit_tickets',
  'assign_tickets',
  'delete_tickets',
  'view_users',
  'edit_users',
  'manage_roles',
  'view_audit_logs',
  'manage_settings',
];

const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features',
    permissions: allPermissions,
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Can view and manage assigned tickets',
    permissions: ['view_tickets', 'edit_tickets', 'assign_tickets'],
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Can create and view their own tickets',
    permissions: ['view_tickets'],
  },
];

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Role>({ id: '', name: '', description: '', permissions: [] });
  const [showNewRole, setShowNewRole] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEdit = (role: Role) => {
    setEditingRole({ ...role });
    setError('');
    setSuccess('');
  };

  const handleDelete = (roleId: string) => {
    setRoles(roles.filter(r => r.id !== roleId));
    setSuccess('Role deleted');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSaveEdit = () => {
    if (!editingRole) return;
    if (!editingRole.name.trim()) {
      setError('Role name is required');
      return;
    }
    setRoles(roles.map(r => (r.id === editingRole.id ? editingRole : r)));
    setEditingRole(null);
    setSuccess('Role updated');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      setError('Role name is required');
      return;
    }
    setRoles([...roles, { ...newRole, id: Date.now().toString() }]);
    setNewRole({ id: '', name: '', description: '', permissions: [] });
    setShowNewRole(false);
    setSuccess('Role created');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handlePermissionToggle = (role: Role, perm: string) => {
    if (role.permissions.includes(perm)) {
      role.permissions = role.permissions.filter(p => p !== perm);
    } else {
      role.permissions = [...role.permissions, perm];
    }
    setEditingRole({ ...role });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCog className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Role Management</h2>
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
        <button
          onClick={() => setShowNewRole(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          <Plus className="h-4 w-4" />
          New Role
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Role</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Description</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Permissions</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">{role.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-600 dark:text-gray-400">{role.description}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {role.permissions.map((perm) => (
                    <span key={perm} className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs mr-1 mb-1">
                      {perm}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Role</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
              <input
                type="text"
                value={editingRole.name}
                onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                type="text"
                value={editingRole.description}
                onChange={e => setEditingRole({ ...editingRole, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {allPermissions.map(perm => (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => handlePermissionToggle(editingRole, perm)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${editingRole.permissions.includes(perm)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} transition-colors`}
                  >
                    {perm}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingRole(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New Role Modal */}
      {showNewRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Role</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
              <input
                type="text"
                value={newRole.name}
                onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                type="text"
                value={newRole.description}
                onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {allPermissions.map(perm => (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => setNewRole({
                      ...newRole,
                      permissions: newRole.permissions.includes(perm)
                        ? newRole.permissions.filter(p => p !== perm)
                        : [...newRole.permissions, perm],
                    })}
                    className={`px-3 py-1 rounded text-xs font-medium border ${newRole.permissions.includes(perm)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} transition-colors`}
                  >
                    {perm}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewRole(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
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