import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from '../../components/ui/Tabs';
import { StudentList } from '../../components/driver/StudentList';
import { IncidentReport } from '../../components/driver/IncidentReport';
import { Card } from '../../components/ui/Card';
import {
  MapPin,
  Clock,
  Users,
  Route as RouteIcon,
  AlertTriangle } from
'lucide-react';
export function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
  {
    id: 'overview',
    label: "Today's Route",
    icon: <RouteIcon className="h-4 w-4" />
  },
  {
    id: 'students',
    label: 'Students',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'incidents',
    label: 'Report Issue',
    icon: <AlertTriangle className="h-4 w-4" />
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
          className="mb-8 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-800 bg-clip-text text-transparent">
              Route A - Morning Run
            </h1>
            <p className="text-gray-600 mt-2">Bus 001 • Started at 07:00 AM</p>
          </div>
          <div className="flex space-x-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center hover:shadow-md transition-shadow duration-200">
              <Clock className="h-5 w-5 text-primary-600 mr-2" />
              <span className="font-bold text-gray-900">07:42 AM</span>
            </div>
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
            className="space-y-6">

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                }}>

                  <Card
                  className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0 shadow-xl shadow-primary-500/20"
                  noPadding>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="p-6 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-primary-100 text-sm font-medium">
                          On Board
                        </span>
                        <Users className="h-5 w-5 text-primary-200" />
                      </div>
                      <span className="text-4xl font-bold">12</span>
                      <span className="text-primary-200 text-sm ml-2">
                        / 24 students
                      </span>
                    </div>
                  </Card>
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
                }}>

                  <Card
                  noPadding
                  className="hover:shadow-lg transition-shadow duration-300">

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">
                          Next Stop
                        </span>
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        Galle Road
                      </span>
                      <div className="text-green-600 text-sm mt-1 font-medium flex items-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        ETA: 5 mins
                      </div>
                    </div>
                  </Card>
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
                }}>

                  <Card
                  noPadding
                  className="hover:shadow-lg transition-shadow duration-300">

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">
                          Route Status
                        </span>
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        On Time
                      </span>
                      <div className="text-gray-400 text-sm mt-1">
                        No delays reported
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                }}
                className="lg:col-span-2">

                  <StudentList />
                </motion.div>

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
                  delay: 0.5
                }}
                className="space-y-6">

                  <Card title="Route Schedule">
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 py-2">
                      {[
                    {
                      name: 'Colombo Fort Railway Station',
                      time: '07:00 AM',
                      status: 'done'
                    },
                    {
                      name: 'Galle Road',
                      time: '07:15 AM',
                      status: 'next'
                    },
                    {
                      name: 'Union Place',
                      time: '07:30 AM',
                      status: 'pending'
                    },
                    {
                      name: 'Royal College',
                      time: '07:45 AM',
                      status: 'pending'
                    }].
                    map((stop, i) =>
                    <motion.div
                      key={i}
                      initial={{
                        opacity: 0,
                        x: -10
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        delay: 0.6 + i * 0.1
                      }}
                      className="relative pl-6">

                          <div
                        className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 transition-all duration-300 ${stop.status === 'done' ? 'bg-primary-600 border-primary-600' : stop.status === 'next' ? 'bg-white border-primary-600 animate-pulse shadow-lg shadow-primary-500/50' : 'bg-white border-gray-300'}`}>
                      </div>
                          <div className="flex justify-between items-start">
                            <span
                          className={`font-medium ${stop.status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>

                              {stop.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {stop.time}
                            </span>
                          </div>
                        </motion.div>
                    )}
                    </div>
                  </Card>
                </motion.div>
              </div>
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

              <StudentList />
            </motion.div>
          }

          {activeTab === 'incidents' &&
          <motion.div
            key="incidents"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3
            }}
            className="max-w-2xl mx-auto">

              <IncidentReport />
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}