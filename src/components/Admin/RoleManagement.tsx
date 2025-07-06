import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserCog, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Download,
  Users,
  Shield,
  Settings,
  Eye,
  FileText,
  BarChart3,
  Zap,
  AlertTriangle,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { rolesAPI } from '../../services/api';

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system_role: boolean;
  permissions?: string[];
  user_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  name: string;
  description: string;
  category: string;
}

const permissionCategories = {
  'Tickets': { icon: FileText, color: 'blue' },
  'Users': { icon: Users, color: 'green' },
  'Administration': { icon: Settings, color: 'purple' },
  'Analytics': { icon: BarChart3, color: 'orange' },
  'Automation': { icon: Zap, color: 'red' },
  'Reports': { icon: BarChart3, color: 'indigo' },
  'Integrations': { icon: Settings, color: 'teal' },
};

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Form states
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSystem, setFilterSystem] = useState<'all' | 'system' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'users' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoles, setTotalRoles] = useState(0);

  // Load roles and permissions
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesAPI.getAll({ 
          page: currentPage, 
          limit: 10, 
          search: searchTerm || undefined,
          include_permissions: true,
          include_users: true
        }),
        rolesAPI.getPermissions()
      ]);

      if (rolesResponse.success && permissionsResponse.success) {
        setRoles(rolesResponse.data.roles);
        setTotalPages(rolesResponse.data.pagination.pages);
        setTotalRoles(rolesResponse.data.pagination.total);
        setPermissions(permissionsResponse.data);
      } else {
        setError('Failed to load roles');
      }
    } catch (err) {
      setError('Failed to load roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Handle role creation
  const handleCreateRole = async () => {
    try {
      if (!newRole.name.trim()) {
        setError('Role name is required');
        return;
      }

      const response = await rolesAPI.create(newRole);
      
      if (response.success) {
        setSuccess('Role created successfully');
        setShowCreateModal(false);
        setNewRole({ name: '', description: '', permissions: [] });
        loadRoles();
      } else {
        setError(response.error?.message || 'Failed to create role');
      }
    } catch (err) {
      setError('Failed to create role');
      console.error('Error creating role:', err);
    }
  };

  // Handle role update
  const handleUpdateRole = async () => {
    try {
      if (!editingRole || !editingRole.name.trim()) {
        setError('Role name is required');
        return;
      }

      const response = await rolesAPI.update(editingRole.id.toString(), {
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions || []
      });
      
      if (response.success) {
        setSuccess('Role updated successfully');
        setShowEditModal(false);
        setEditingRole(null);
        loadRoles();
      } else {
        setError(response.error?.message || 'Failed to update role');
      }
    } catch (err) {
      setError('Failed to update role');
      console.error('Error updating role:', err);
    }
  };

  // Handle role deletion
  const handleDeleteRole = async () => {
    try {
      if (!selectedRole) return;

      const response = await rolesAPI.delete(selectedRole.id.toString());
      
      if (response.success) {
        setSuccess('Role deleted successfully');
        setShowDeleteModal(false);
        setSelectedRole(null);
        loadRoles();
      } else {
        setError(response.error?.message || 'Failed to delete role');
      }
    } catch (err) {
      setError('Failed to delete role');
      console.error('Error deleting role:', err);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (role: Role, permission: string) => {
    if (!role.permissions) role.permissions = [];
    
    if (role.permissions.includes(permission)) {
      role.permissions = role.permissions.filter(p => p !== permission);
    } else {
      role.permissions = [...role.permissions, permission];
    }
    
    setEditingRole({ ...role });
  };

  // Filter and sort roles
  const filteredAndSortedRoles = roles
    .filter(role => {
      if (filterSystem === 'system') return role.is_system_role;
      if (filterSystem === 'custom') return !role.is_system_role;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'users':
          comparison = (a.user_count || 0) - (b.user_count || 0);
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <UserCog className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Role Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage user roles and permissions
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Role
        </button>
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
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterSystem}
            onChange={(e) => setFilterSystem(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="system">System Roles</option>
            <option value="custom">Custom Roles</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="users-desc">Most Users</option>
            <option value="users-asc">Least Users</option>
            <option value="created-desc">Newest</option>
            <option value="created-asc">Oldest</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Roles</p>
              <p className="text-2xl font-bold">{totalRoles}</p>
            </div>
            <Shield className="h-8 w-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">System Roles</p>
              <p className="text-2xl font-bold">{roles.filter(r => r.is_system_role).length}</p>
            </div>
            <Settings className="h-8 w-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Custom Roles</p>
              <p className="text-2xl font-bold">{roles.filter(r => !r.is_system_role).length}</p>
            </div>
            <UserCog className="h-8 w-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Permissions</p>
              <p className="text-2xl font-bold">{permissions.length}</p>
            </div>
            <Eye className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading roles...</p>
          </div>
        ) : filteredAndSortedRoles.length === 0 ? (
          <div className="p-8 text-center">
            <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No roles found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first role'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create Role
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {role.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {role.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                          >
                            {perm.replace('_', ' ')}
                          </span>
                        ))}
                        {role.permissions && role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {role.user_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.is_system_role
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      }`}>
                        {role.is_system_role ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                          title="Edit role"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {!role.is_system_role && (
                          <button
                            onClick={() => {
                              setSelectedRole(role);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                            title="Delete role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedRole(role);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded"
                          title="Assign to users"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Role</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Define a new role with specific permissions
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the role's purpose and responsibilities"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-3">
                  {Object.entries(permissionCategories).map(([category, { icon: Icon, color }]) => {
                    const categoryPermissions = permissions.filter(p => p.category === category);
                    if (categoryPermissions.length === 0) return null;
                    
                    return (
                      <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-4 w-4 text-${color}-600`} />
                          <h4 className="font-medium text-gray-900 dark:text-white">{category}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map((permission) => (
                            <label key={permission.name} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newRole.permissions.includes(permission.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRole({
                                      ...newRole,
                                      permissions: [...newRole.permissions, permission.name]
                                    });
                                  } else {
                                    setNewRole({
                                      ...newRole,
                                      permissions: newRole.permissions.filter(p => p !== permission.name)
                                    });
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {permission.description}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Role</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Modify role details and permissions
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={editingRole.is_system_role}
                />
                {editingRole.is_system_role && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    System role names cannot be changed
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-3">
                  {Object.entries(permissionCategories).map(([category, { icon: Icon, color }]) => {
                    const categoryPermissions = permissions.filter(p => p.category === category);
                    if (categoryPermissions.length === 0) return null;
                    
                    return (
                      <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-4 w-4 text-${color}-600`} />
                          <h4 className="font-medium text-gray-900 dark:text-white">{category}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map((permission) => (
                            <label key={permission.name} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingRole.permissions?.includes(permission.name) || false}
                                onChange={(e) => handlePermissionToggle(editingRole, permission.name)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {permission.description}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Role</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete the role <strong>"{selectedRole.name}"</strong>? 
              This will remove all permissions associated with this role.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Role</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage role assignments
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Role assignment functionality will be implemented in the next phase. 
              Currently showing: <strong>"{selectedRole.name}"</strong>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 