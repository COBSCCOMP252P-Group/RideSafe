import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../hooks/useAuth';
import { BusTracker } from '../../components/parent/BusTracker';
import { NotificationsList } from '../../components/parent/NotificationsList';
import { AttendanceHistory } from '../../components/parent/AttendanceHistory';
import { AdvancedAbsenceCalendar } from '../../components/parent/AdvancedAbsenceCalendar';
import {
  MapPin,
  Calendar,
  Bell,
  CalendarX,
  Map,
  Plus,
  ChevronDown,
  QrCode,
} from 'lucide-react';

import SetLocationModal from '../../components/layout/SetLocationModal';
import { PaymentForm } from '../../components/parent/PaymentForm';
import { useStudents } from '../../hooks/useAttendance';
import { useAttendance } from '../../hooks/useAttendance'; 


export function ParentDashboard() {

   const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { students, loading: studentsLoading } = useStudents();
  const { downloadQRCode, loading } = useAttendance();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  

  const selectedChild = useMemo(() => {
    if (!students || students.length === 0) return null;

    const chosenId =
      selectedStudentId ?? students[0]?.student_id;

    return (
      students.find((s) => s.student_id === chosenId) ||
      students[0]
    );
  }, [students, selectedStudentId]);
  const handleDownloadQR = async () => {
    if (!selectedChild) return;
    try {
      await downloadQRCode(selectedChild.student_id, selectedChild.full_name);
    } catch (err: any) {
      alert('Failed to download QR code: ' + err.message);
    }
  };

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
    }
  ];

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
          className="mb-8 flex justify-between items-start gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-800 bg-clip-text text-transparent">
              {user.name ? `Welcome, ${user.name.split(' ')[0]}!` : 'Welcome!'}
            </h1>

            <p className="text-gray-600 mt-2">
              Manage {selectedChild ? selectedChild.full_name : 'your child'}'s school transport
            </p>

            {/* Student Selector */}
            {students && students.length > 1 && (
              <div className="mt-4 relative w-72">
                <select
                  value={selectedChild?.student_id ?? ''}
                  onChange={(e) =>
                    setSelectedStudentId(Number(e.target.value))
                  }
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {students.map((student) => (
                    <option
                      key={student.student_id}
                      value={student.student_id}
                    >
                      {student.full_name}
                    </option>
                  ))}
                </select>

                <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            )}
          </div>
                {/* Download QR Code Button */}
            <motion.button
              onClick={handleDownloadQR}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedChild || loading}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.3)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <QrCode className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Download QR</span>
              </div>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </motion.button>


          {/* Manage Locations Button */}
          <motion.button
            onClick={() => setIsLocationModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            style={{
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-center gap-2">
              <Map className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Manage Locations</span>
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            </div>

            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-8"
        />

        {/* Content */}
        <AnimatePresence mode="wait">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >

              {/* Student Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={
                        selectedChild
                          ? `https://i.pravatar.cc/150?u=student-${selectedChild.student_id}`
                          : 'https://i.pravatar.cc/150?u=placeholder'
                      }
                      alt={selectedChild?.full_name ?? 'Student'}
                      className="h-20 w-20 rounded-2xl object-cover border-4 border-primary-100"
                    />

                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedChild?.full_name ?? 'Student Name'}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {selectedChild
                        ? `${selectedChild.grade ?? 'N/A'} Grade`
                        : 'Grade unavailable'}
                    </p>

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300">
                      Route A • {selectedChild?.status?.replace('_', ' ') ?? 'active'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Bus Tracker - selected student route */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <BusTracker studentId={selectedChild?.student_id} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <AttendanceHistory/>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <NotificationsList/>
              </motion.div>

            </motion.div>
          )}

          {/* TRACK */}
          {activeTab === 'track' && (
            <motion.div
              key="track"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <BusTracker studentId={selectedChild?.student_id} />
            </motion.div>
          )}

          {/* ATTENDANCE */}
          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <AttendanceHistory/>
            </motion.div>
          )}

          {/* ABSENCES */}
          {activeTab === 'absences' && (
            <motion.div
              key="absences"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <AdvancedAbsenceCalendar/>
            </motion.div>
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <PaymentForm/>
            </motion.div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <NotificationsList/>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Location Modal */}
      <SetLocationModal
        open={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}