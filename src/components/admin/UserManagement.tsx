/**
 * CoreFlow360 - User Management Component
 * Comprehensive user administration interface
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole, Permission, ROLE_HIERARCHY } from '@/types/auth'
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Activity,
  MoreVertical,
  Download,
  Upload,
  Users,
  UserPlus,
  Key,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: Date
  createdAt: Date
  modules: string[]
  avatar?: string
}

interface UserManagementProps {
  searchQuery?: string
}

export function UserManagement({ searchQuery = '' }: UserManagementProps) {
  const { _user: currentUser, hasPermission } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>(
    'all'
  )
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')

  // Load mock users
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: UserRole.ORG_ADMIN,
        department: 'Administration',
        status: 'active',
        lastLogin: new Date('2024-01-10T10:30:00'),
        createdAt: new Date('2023-06-15'),
        modules: ['crm', 'accounting', 'projects', 'hr'],
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        role: UserRole.DEPARTMENT_MANAGER,
        department: 'Sales',
        status: 'active',
        lastLogin: new Date('2024-01-10T09:15:00'),
        createdAt: new Date('2023-08-20'),
        modules: ['crm', 'accounting'],
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        role: UserRole.TEAM_LEAD,
        department: 'Engineering',
        status: 'active',
        lastLogin: new Date('2024-01-09T16:45:00'),
        createdAt: new Date('2023-09-10'),
        modules: ['projects', 'crm'],
      },
      {
        id: '4',
        name: 'Emily Wilson',
        email: 'emily.w@company.com',
        role: UserRole.USER,
        department: 'Marketing',
        status: 'inactive',
        lastLogin: new Date('2024-01-05T14:20:00'),
        createdAt: new Date('2023-11-05'),
        modules: ['crm'],
      },
      {
        id: '5',
        name: 'Robert Smith',
        email: 'robert.s@company.com',
        role: UserRole.USER,
        department: 'Support',
        status: 'suspended',
        lastLogin: new Date('2023-12-20T11:00:00'),
        createdAt: new Date('2023-07-01'),
        modules: ['crm'],
      },
    ]
    setUsers(mockUsers)
  }, [])

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((user) => user.status === filterStatus)
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, filterStatus, filterRole])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleBulkAction = (_action: 'activate' | 'deactivate' | 'delete') => {
    // Implement bulk actions

    setSelectedUsers([])
  }

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            <XCircle className="mr-1 h-3 w-3" />
            Inactive
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <Ban className="mr-1 h-3 w-3" />
            Suspended
          </span>
        )
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      [UserRole.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.ORG_ADMIN]: 'bg-blue-100 text-blue-800',
      [UserRole.DEPARTMENT_MANAGER]: 'bg-indigo-100 text-indigo-800',
      [UserRole.TEAM_LEAD]: 'bg-cyan-100 text-cyan-800',
      [UserRole.USER]: 'bg-gray-100 text-gray-800',
      [UserRole.GUEST]: 'bg-yellow-100 text-yellow-800',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[role]}`}
      >
        <Shield className="mr-1 h-3 w-3" />
        {role.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
          <button className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as unknown)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as unknown)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUsers.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="rounded-lg bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Modules
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <span className="font-medium text-purple-600">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {user.department}
                </td>
                <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLogin.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.modules.slice(0, 3).map((module) => (
                      <span
                        key={module}
                        className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-600"
                      >
                        {module}
                      </span>
                    ))}
                    {user.modules.length > 3 && (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-600">
                        +{user.modules.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <Key className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddUser || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowAddUser(false)
            setEditingUser(null)
          }}
          onSave={(user) => {
            // Save user logic

            setShowAddUser(false)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

// User Modal Component
function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: User | null
  onClose: () => void
  onSave: (user: Partial<User>) => void
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || UserRole.USER,
    department: user?.department || '',
    modules: user?.modules || [],
  })

  const availableModules = [
    'crm',
    'accounting',
    'hr',
    'projects',
    'inventory',
    'marketing',
    'analytics',
    'ai_insights',
    'ecommerce',
    'manufacturing',
  ]

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="m-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800"
      >
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {user ? 'Edit User' : 'Add New User'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Modules
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableModules.map((module) => (
                <label key={module} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.modules.includes(module)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, modules: [...formData.modules, module] })
                      } else {
                        setFormData({
                          ...formData,
                          modules: formData.modules.filter((m) => m !== module),
                        })
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {module.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            {user ? 'Update User' : 'Add User'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
