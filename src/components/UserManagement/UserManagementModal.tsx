import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Shield, Calendar, Search, Plus, Edit, Trash2, UserCheck, 
  Users, Filter, Download, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle,
  MoreVertical, Settings, Key, Building
} from 'lucide-react';
import { User as UserType, UserRole } from '../../types/user';
import { usersAPI } from '../../services/api';
import { useToastHelpers } from '../Toast/ToastContainer';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
}

interface NewUserForm {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
}

interface UserFilters {
  search: string;
  role: UserRole | 'all';
  status: 'all' | 'active' | 'inactive';
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  });
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'client',
    password: '',
    confirmPassword: ''
  });

  const toast = useToastHelpers();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({
        search: filters.search || undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
        limit: 100
      });
      
      if (response.success && response.data?.users) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newUserForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!newUserForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!newUserForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!newUserForm.password) {
      errors.password = 'Password is required';
    } else if (newUserForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (newUserForm.password !== newUserForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await usersAPI.create({
        email: newUserForm.email,
        password: newUserForm.password,
        firstName: newUserForm.firstName,
        lastName: newUserForm.lastName,
        role: newUserForm.role
      });

      if (response.success) {
        toast.success('Success', 'User created successfully');
        setNewUserForm({
          email: '',
          firstName: '',
          lastName: '',
          role: 'client',
          password: '',
          confirmPassword: ''
        });
        setShowAddUser(false);
        setFormErrors({});
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await usersAPI.updateRole(userId, newRole);
      if (response.success) {
        toast.success('Success', 'User role updated successfully');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await usersAPI.toggleStatus(userId, !currentStatus);
      if (response.success) {
        toast.success('Success', `User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to update user status');
    }
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'client': return 'Client';
      case 'employee_l1': return 'Level 1 Support';
      case 'employee_l2': return 'Level 2 Support';
      case 'employee_l3': return 'Level 3 Support';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'client': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'employee_l1': return 'bg-green-50 text-green-700 border-green-200';
      case 'employee_l2': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'employee_l3': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'client': return <User className="h-3 w-3" />;
      case 'employee_l1': return <Shield className="h-3 w-3" />;
      case 'employee_l2': return <Shield className="h-3 w-3" />;
      case 'employee_l3': return <Shield className="h-3 w-3" />;
      case 'admin': return <Settings className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && user.isActive) ||
                         (filters.status === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    byRole: {
      client: users.filter(u => u.role === 'client').length,
      employee_l1: users.filter(u => u.role === 'employee_l1').length,
      employee_l2: users.filter(u => u.role === 'employee_l2').length,
      employee_l3: users.filter(u => u.role === 'employee_l3').length,
      admin: users.filter(u => u.role === 'admin').length,
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-indigo-100 mt-1">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Refresh users"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Inactive</p>
                  <p className="text-2xl font-bold text-red-900">{stats.inactive}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Clients</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.byRole.client}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as UserRole | 'all' }))}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white transition-all"
                >
                  <option value="all">All Roles</option>
                  <option value="client">Client</option>
                  <option value="employee_l1">Level 1 Support</option>
                  <option value="employee_l2">Level 2 Support</option>
                  <option value="employee_l3">Level 3 Support</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'active' | 'inactive' }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowAddUser(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add New User
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Showing {filteredUsers.length} of {users.length} users
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                          <span className="text-gray-600">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-12 w-12 text-gray-300" />
                          <div>
                            <p className="text-gray-600 font-medium">No users found</p>
                            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-indigo-200">
                                <User className="h-6 w-6 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingUser?.id === user.id ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value as UserRole)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="client">Client</option>
                              <option value="employee_l1">Level 1 Support</option>
                              <option value="employee_l2">Level 2 Support</option>
                              <option value="employee_l3">Level 3 Support</option>
                              <option value="admin">Administrator</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {getRoleDisplay(user.role)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                            user.isActive 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {user.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.lastLogin ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {editingUser?.id === user.id ? (
                              <button
                                onClick={() => setEditingUser(null)}
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                                title="Save changes"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditingUser(user)}
                                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                                disabled={user.id === currentUser.id}
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive 
                                  ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              }`}
                              disabled={user.id === currentUser.id}
                              title={user.isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.isActive ? <Trash2 className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Add New User</h3>
                        <p className="text-indigo-100 mt-1">Create a new user account</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowAddUser(false);
                        setFormErrors({});
                        setNewUserForm({
                          email: '',
                          firstName: '',
                          lastName: '',
                          role: 'client',
                          password: '',
                          confirmPassword: ''
                        });
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={newUserForm.firstName}
                        onChange={(e) => {
                          setNewUserForm(prev => ({ ...prev, firstName: e.target.value }));
                          if (formErrors.firstName) {
                            setFormErrors(prev => ({ ...prev, firstName: '' }));
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                      {formErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={newUserForm.lastName}
                        onChange={(e) => {
                          setNewUserForm(prev => ({ ...prev, lastName: e.target.value }));
                          if (formErrors.lastName) {
                            setFormErrors(prev => ({ ...prev, lastName: '' }));
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                      {formErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={newUserForm.email}
                          onChange={(e) => {
                            setNewUserForm(prev => ({ ...prev, email: e.target.value }));
                            if (formErrors.email) {
                              setFormErrors(prev => ({ ...prev, email: '' }));
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                            formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Role *
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                          className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white transition-all"
                        >
                          <option value="client">Client</option>
                          <option value="employee_l1">Level 1 Support</option>
                          <option value="employee_l2">Level 2 Support</option>
                          <option value="employee_l3">Level 3 Support</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value="SealKloud"
                          disabled
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newUserForm.password}
                          onChange={(e) => {
                            setNewUserForm(prev => ({ ...prev, password: e.target.value }));
                            if (formErrors.password) {
                              setFormErrors(prev => ({ ...prev, password: '' }));
                            }
                          }}
                          className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                            formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newUserForm.confirmPassword}
                          onChange={(e) => {
                            setNewUserForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (formErrors.confirmPassword) {
                              setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                            formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Confirm password"
                        />
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleAddUser}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Creating User...
                        </div>
                      ) : (
                        'Create User'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddUser(false);
                        setFormErrors({});
                        setNewUserForm({
                          email: '',
                          firstName: '',
                          lastName: '',
                          role: 'client',
                          password: '',
                          confirmPassword: ''
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};