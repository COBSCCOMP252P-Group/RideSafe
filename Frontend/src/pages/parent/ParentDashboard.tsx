import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from '../../components/ui/Tabs';
import { BusTracker } from '../../components/parent/BusTracker';
import { NotificationsList } from '../../components/parent/NotificationsList';
import { AttendanceHistory } from '../../components/parent/AttendanceHistory';
import { AdvancedAbsenceCalendar } from '../../components/parent/AdvancedAbsenceCalendar';
import { MOCK_STUDENTS } from '../../utils/mockData';
import { MapPin, Calendar, Bell, CalendarX } from 'lucide-react';
export function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const child = MOCK_STUDENTS[0];
  const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <MapPin className="h-4 w-4" />
  },
  {
    id: 'track',
    label: 'Track Bus',
    icon: <MapPin className="h-4 w-4" />
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'absences',
    label: 'Plan Absences',
    icon: <CalendarX className="h-4 w-4" />
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
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
          className="mb-8">

          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-800 bg-clip-text text-transparent">
            Welcome back, Sarah!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage {child.name}'s school transport
          </p>
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Child Profile Card */}
              <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                delay: 0.1
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                    src={child.avatar}
                    alt={child.name}
                    className="h-20 w-20 rounded-2xl object-cover border-4 border-primary-100" />

                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {child.name}
                    </h3>
                    <p className="text-sm text-gray-500">{child.grade} Grade</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300">
                      Route A • {child.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                delay: 0.2
              }}
              className="lg:col-span-2">

                <BusTracker />
              </motion.div>

              <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                delay: 0.3
              }}
              className="lg:col-span-2">

                <AttendanceHistory />
              </motion.div>

              <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                delay: 0.4
              }}>

                <NotificationsList />
              </motion.div>
            </motion.div>
          }

          {activeTab === 'track' &&
          <motion.div
            key="track"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <BusTracker />
            </motion.div>
          }

          {activeTab === 'attendance' &&
          <motion.div
            key="attendance"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <AttendanceHistory />
            </motion.div>
          }

          {activeTab === 'absences' &&
          <motion.div
            key="absences"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <AdvancedAbsenceCalendar />
            </motion.div>
          }

          {activeTab === 'notifications' &&
          <motion.div
            key="notifications"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}>

              <NotificationsList />
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}