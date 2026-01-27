//@ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { GlassModal } from '../ui/GlassModal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { MOCK_USERS } from '../../utils/mockData';
import { User, UserRole } from '../../types';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Shield,
  Users,
  CheckCircle,
  Sparkles,
  UserCircle,
  BoxIcon } from
'lucide-react';
export function UserRegistration() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'parent' as UserRole,
    phone: '',
    address: ''
  });
  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: '',
        address: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'parent',
        phone: '',
        address: ''
      });
    }
    setIsModalOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((u) =>
        u.id === editingUser.id ?
        {
          ...u,
          name: formData.name,
          email: formData.email,
          role: formData.role
        } :
        u
        )
      );
    } else {
      // Add new user
      const newUser: User = {
        id: `u${users.length + 1}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: `https://i.pravatar.cc/150?u=${formData.email}`
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'parent':
        return <UserCircle className="h-4 w-4" />;
      case 'driver':
        return <div className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
    }
  };
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'parent':
        return 'primary';
      case 'driver':
        return 'success';
      case 'admin':
        return 'danger';
    }
  };
  const stats = [
  {
    label: 'Total Users',
    value: users.length,
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'Parents',
    value: users.filter((u) => u.role === 'parent').length,
    icon: UserCircle,
    gradient: 'from-primary-500 to-purple-500'
  },
  {
    label: 'Drivers',
    value: users.filter((u) => u.role === 'driver').length,
    icon: BoxIcon,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    label: 'Admins',
    value: users.filter((u) => u.role === 'admin').length,
    icon: Shield,
    gradient: 'from-red-500 to-rose-500'
  }];

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess &&
        <motion.div
          initial={{
            opacity: 0,
            y: -50,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: -50,
            scale: 0.9
          }}
          className="fixed top-20 right-4 z-50">

            <GlassCard className="px-6 py-4 flex items-center space-x-3 bg-green-500/20 border-green-500/30">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Success!</p>
                <p className="text-sm text-gray-600">
                  User {editingUser ? 'updated' : 'created'} successfully
                </p>
              </div>
            </GlassCard>
          </motion.div>
        }
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-purple-800 bg-clip-text text-transparent flex items-center">
            <Sparkles className="h-8 w-8 text-primary-600 mr-3" />
            User Management
          </h2>
          <p className="text-gray-600 mt-2">Create and manage system users</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg shadow-primary-500/30"
          leftIcon={<UserPlus className="h-4 w-4" />}>

          Add New User
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) =>
        <motion.div
          key={stat.label}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.1
          }}>

            <GlassCard gradient className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <motion.p
                  initial={{
                    scale: 0
                  }}
                  animate={{
                    scale: 1
                  }}
                  transition={{
                    delay: index * 0.1 + 0.2,
                    type: 'spring'
                  }}
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-800 bg-clip-text text-transparent mt-1">

                    {stat.value}
                  </motion.p>
                </div>
                <div
                className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>

                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Search and Filter */}
      <GlassCard gradient className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" />

            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'parent', 'driver', 'admin'].map((role) =>
            <button
              key={role}
              onClick={() => setSelectedRole(role as UserRole | 'all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${selectedRole === role ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white/50 backdrop-blur-sm text-gray-600 hover:bg-white/80 border border-white/20'}`}>

                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredUsers.map((user, index) =>
          <motion.div
            key={user.id}
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.9
            }}
            transition={{
              delay: index * 0.05
            }}
            layout>

              <GlassCard gradient className="p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-14 w-14 rounded-2xl object-cover border-2 border-white/50 shadow-lg" />

                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-0.5">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge
                  variant={getRoleColor(user.role)}
                  className="flex items-center space-x-1">

                    {getRoleIcon(user.role)}
                    <span className="capitalize">{user.role}</span>
                  </Badge>

                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                    whileHover={{
                      scale: 1.1
                    }}
                    whileTap={{
                      scale: 0.9
                    }}
                    onClick={() => handleOpenModal(user)}
                    className="p-2 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-primary-100 text-primary-600 transition-all duration-200 border border-white/20">

                      <Edit2 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                    whileHover={{
                      scale: 1.1
                    }}
                    whileTap={{
                      scale: 0.9
                    }}
                    onClick={() => handleDelete(user.id)}
                    className="p-2 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-red-100 text-red-600 transition-all duration-200 border border-white/20">

                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {filteredUsers.length === 0 &&
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="text-center py-12">

          <GlassCard gradient className="p-12 max-w-md mx-auto">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </GlassCard>
        </motion.div>
      }

      {/* Add/Edit User Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="lg">

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
              }
              required
              placeholder="John Doe"
              className="bg-white/50 backdrop-blur-sm border-white/20" />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value
              })
              }
              required
              placeholder="john@example.com"
              className="bg-white/50 backdrop-blur-sm border-white/20" />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value
              })
              }
              placeholder="+1 (555) 000-0000"
              className="bg-white/50 backdrop-blur-sm border-white/20" />

            <Select
              label="User Role"
              value={formData.role}
              onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as UserRole
              })
              }
              options={[
              {
                value: 'parent',
                label: 'Parent'
              },
              {
                value: 'driver',
                label: 'Driver'
              },
              {
                value: 'admin',
                label: 'Admin'
              }]
              }
              className="bg-white/50 backdrop-blur-sm border-white/20" />

          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) =>
            setFormData({
              ...formData,
              address: e.target.value
            })
            }
            placeholder="123 Main St, City, State"
            className="bg-white/50 backdrop-blur-sm border-white/20" />


          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="bg-white/50 backdrop-blur-sm border-white/20">

              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg shadow-primary-500/30">

              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </GlassModal>
    </div>);

}