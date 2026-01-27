import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RoutePlanner } from '../../components/admin/RoutePlanner';
import { LateStudentWarnings } from '../../components/admin/LateStudentWarnings';
import { UserRegistration } from '../../components/admin/UserRegistration';
import { MOCK_ROUTES, MOCK_INCIDENTS } from '../../utils/mockData';
import {
  LayoutDashboard,
  Users,
  Route as RouteIcon,
  AlertTriangle,
  TrendingUp,
  Download,
  Plus,
  Bus,
  UserPlus } from
'lucide-react';
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <UserPlus className="h-4 w-4" />
  },
  {
    id: 'students',
    label: 'Students',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'routes',
    label: 'Route Planner',
    icon: <RouteIcon className="h-4 w-4" />
  },
  {
    id: 'warnings',
    label: 'Late Warnings',
    icon: <AlertTriangle className="h-4 w-4" />,
    badge: 3
  }];

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: -20
    }
  };
  const statsData = [
  {
    label: 'Total Students',
    value: '1,248',
    change: '+2.5%',
    icon: Users,
    color: 'primary',
    gradient: 'from-primary-500 to-primary-600'
  },
  {
    label: 'Active Buses',
    value: '18/20',
    subtext: '2 in maintenance',
    icon: Bus,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    label: 'Active Incidents',
    value: '3',
    subtext: 'Requires attention',
    icon: AlertTriangle,
    color: 'red',
    gradient: 'from-red-500 to-red-600'
  },
  {
    label: 'On-Time Rate',
    value: '94%',
    subtext: 'Avg delay: 2 mins',
    icon: TrendingUp,
    color: 'green',
    gradient: 'from-green-500 to-green-600'
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-800 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-gray-600 mt-2">
              Manage school transport operations
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}>

              Export Report
            </Button>
            <Button
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              leftIcon={<Plus className="h-4 w-4" />}>

              Add Student
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-8" />


        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' &&
          <motion.div
            key="overview"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}
            className="space-y-8">

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) =>
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

                    <Card
                  noPadding
                  className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">

                      <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}>
                  </div>
                      <div className="p-6 relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              {stat.label}
                            </p>
                            <motion.h3
                          initial={{
                            scale: 0.5
                          }}
                          animate={{
                            scale: 1
                          }}
                          transition={{
                            delay: index * 0.1 + 0.2,
                            type: 'spring'
                          }}
                          className="text-3xl font-bold text-gray-900 mt-1">

                              {stat.value}
                            </motion.h3>
                          </div>
                          <div
                        className={`p-3 bg-${stat.color}-50 rounded-xl group-hover:scale-110 transition-transform duration-300`}>

                            <stat.icon
                          className={`h-6 w-6 text-${stat.color}-600`} />

                          </div>
                        </div>
                        {stat.change &&
                    <div className="flex items-center text-sm">
                            <span className="text-green-600 font-medium flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />{' '}
                              {stat.change}
                            </span>
                            <span className="text-gray-400 ml-2">
                              from last month
                            </span>
                          </div>
                    }
                        {stat.subtext &&
                    <p
                      className={`text-sm text-${stat.color}-600 font-medium mt-2`}>

                            {stat.subtext}
                          </p>
                    }
                      </div>
                    </Card>
                  </motion.div>
              )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Routes */}
                <motion.div
                initial={{
                  opacity: 0,
                  x: -20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: 0.4
                }}>

                  <Card title="Active Routes Status" className="h-full">
                    <div className="space-y-3">
                      {MOCK_ROUTES.map((route, index) =>
                    <motion.div
                      key={route.id}
                      initial={{
                        opacity: 0,
                        x: -20
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        delay: 0.5 + index * 0.1
                      }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200">

                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                              <Bus className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {route.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {route.busNumber} • Nadeesha Sanjaya
                              </p>
                            </div>
                          </div>
                          <Badge
                        variant={
                        route.status === 'on_time' ? 'success' : 'warning'
                        }>

                            {route.status.replace('_', ' ')}
                          </Badge>
                        </motion.div>
                    )}
                    </div>
                  </Card>
                </motion.div>

                {/* Recent Incidents */}
                <motion.div
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: 0.6
                }}>

                  <Card title="Recent Incidents" className="h-full">
                    <div className="space-y-4">
                      {MOCK_INCIDENTS.map((incident, index) =>
                    <motion.div
                      key={incident.id}
                      initial={{
                        opacity: 0,
                        y: 20
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      transition={{
                        delay: 0.7 + index * 0.1
                      }}
                      className="flex items-start p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow duration-200">

                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 capitalize">
                              {incident.type} Issue
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {incident.description}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="danger" className="text-xs">
                                High Severity
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(
                              incident.timestamp
                            ).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                    )}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          }

          {activeTab === 'users' &&
          <motion.div
            key="users"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <UserRegistration />
            </motion.div>
          }

          {activeTab === 'routes' &&
          <motion.div
            key="routes"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <RoutePlanner />
            </motion.div>
          }

          {activeTab === 'warnings' &&
          <motion.div
            key="warnings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <LateStudentWarnings />
            </motion.div>
          }

          {activeTab === 'students' &&
          <motion.div
            key="students"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <Card title="Student Management">
                <p className="text-gray-600">
                  Student CRUD interface coming soon...
                </p>
              </Card>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}