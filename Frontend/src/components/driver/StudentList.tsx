import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check, LogOut, Phone, QrCode, Camera, Download } from 'lucide-react';
import { useAttendance, useStudents } from '../../hooks/useAttendance';
import { RealQRScanner } from './RealQRScanner';

import { motion } from 'framer-motion';

export function StudentList() {
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const { 
    checkIn, 
    checkOut, 
    qrCheckIn, 
    qrCheckOut, 
    generateQRCode, 
    downloadQRCode,
    getAttendanceHistory,
    loading 
  } = useAttendance();
  
  const [studentStatus, setStudentStatus] = useState<Record<number, { hasCheckedIn: boolean; hasCheckedOut: boolean; status: string }>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState<number | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'checkin' | 'checkout'>('checkin');

  // Fetch today's attendance for all students
  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      if (!students.length) return;
      
      const today = new Date().toISOString().split('T')[0];
      const statusMap: Record<number, { hasCheckedIn: boolean; hasCheckedOut: boolean; status: string }> = {};
      
      for (const student of students) {
        try {
          const history = await getAttendanceHistory(student.student_id, 1);
          const todayRecord = history.find(record => record.date === today);
          
          statusMap[student.student_id] = {
            hasCheckedIn: !!todayRecord?.check_in_time,
            hasCheckedOut: !!todayRecord?.check_out_time,
            status: todayRecord?.check_out_time ? 'at_school' : 
                   todayRecord?.check_in_time ? 'on_bus' : 'not_checked_in'
          };
        } catch (err) {
          statusMap[student.student_id] = {
            hasCheckedIn: false,
            hasCheckedOut: false,
            status: 'not_checked_in'
          };
        }
      }
      setStudentStatus(statusMap);
    };
    
    fetchAttendanceStatus();
  }, [students]);

  const handleQRScan = async (qrData: string) => {
    console.log('📱 QR Code scanned:', qrData);
    try {
      if (actionType === 'checkin') {
        const result = await qrCheckIn(qrData, 1, 1);
        console.log('✅ Check-in successful:', result);
        alert(`Student ${qrData} checked in successfully!`);
      } else {
        const result = await qrCheckOut(qrData, 1);
        console.log('✅ Check-out successful:', result);
        alert(`Student ${qrData} checked out successfully!`);
      }
      
      // Refresh the page to update status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ QR operation failed:', err);
      alert(`Failed: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  const handleGenerateQR = async (studentId: number) => {
    try {
      const result = await generateQRCode(studentId);
      setQrImage(`data:image/png;base64,${result.qr_image_base64}`);
      setShowQRGenerator(studentId);
    } catch (err: any) {
      alert('Failed to generate QR code: ' + err.message);
    }
  };

  const handleDownloadQR = async (studentId: number, studentName: string) => {
    try {
      await downloadQRCode(studentId, studentName);
    } catch (err: any) {
      alert('Failed to download QR code: ' + err.message);
    }
  };

  const handleBoard = async (studentId: number) => {
    try {
      await checkIn({
        student_id: studentId,
        bus_id: 1,
        route_id: 1
      });
      setStudentStatus(prev => ({
        ...prev,
        [studentId]: {
          hasCheckedIn: true,
          hasCheckedOut: false,
          status: 'on_bus'
        }
      }));
    } catch (err: any) {
      alert('Check-in failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDrop = async (studentId: number) => {
    try {
      await checkOut({
        student_id: studentId,
        bus_id: 1
      });
      setStudentStatus(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          hasCheckedOut: true,
          status: 'at_school'
        }
      }));
    } catch (err: any) {
      alert('Check-out failed: ' + (err.message || 'Unknown error'));
    }
  };

  if (studentsLoading) {
    return <Card title="Student Manifest - Route A" className="h-full">
      <p className="text-center text-gray-500">Loading students...</p>
    </Card>;
  }

  if (studentsError) {
    return <Card title="Student Manifest - Route A" className="h-full">
      <p className="text-center text-red-500">{studentsError}</p>
    </Card>;
  }

  return (
    <>
      <Card title="Student Manifest - Route A" className="h-full">
        {/* QR Scan Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Button 
            onClick={() => {
              setActionType('checkin');
              setShowScanner(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan QR - Check In
          </Button>
          <Button 
            onClick={() => {
              setActionType('checkout');
              setShowScanner(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan QR - Check Out
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800">
            📱 <strong>Quick Tip:</strong> Click "Scan QR" to use your camera for fast check-in/out. 
            No manual entry needed!
          </p>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          {students.map((student) => {
            const status = studentStatus[student.student_id] || { hasCheckedIn: false, hasCheckedOut: false, status: 'not_checked_in' };
            
            return (
              <div
                key={student.student_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://i.pravatar.cc/150?u=s${student.student_id}`}
                    alt={student.full_name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {student.full_name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        ID: {student.student_id} • Grade {student.grade}
                      </span>
                      <Badge
                        variant={
                          status.status === 'on_bus' ? 'success' :
                          status.status === 'at_school' ? 'info' : 'neutral'
                        }
                      >
                        {status.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* QR Code Generator Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerateQR(student.student_id)}
                    className="text-gray-500 hover:text-primary-600"
                    title="Generate QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>

                  {!status.hasCheckedIn ? (
                    <Button
                      size="sm"
                      onClick={() => handleBoard(student.student_id)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Board
                    </Button>
                  ) : !status.hasCheckedOut ? (
                    <Button
                      size="sm"
                      onClick={() => handleDrop(student.student_id)}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Drop-off
                    </Button>
                  ) : (
                    <Badge variant="success" className="px-3 py-1">
                      Completed
                    </Badge>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Real QR Scanner Modal */}
      {showScanner && (
        <RealQRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
          actionType={actionType}
        />
      )}

      {/* QR Code Generator Modal */}
      {showQRGenerator && qrImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Student QR Code</h2>
            </div>
            <div className="p-6 text-center">
              {(() => {
                const student = students.find(s => s.student_id === showQRGenerator);
                return (
                  <>
                    <h3 className="font-bold text-lg">{student?.full_name}</h3>
                    <p className="text-gray-600 mb-4">ID: {showQRGenerator}</p>
                    <img src={qrImage} alt="QR Code" className="mx-auto w-64 h-64 mb-4" />
                    <p className="text-sm text-gray-500 mb-4">
                      Scan this QR code for quick check-in/out
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => handleDownloadQR(showQRGenerator, student?.full_name || 'student')}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={() => setShowQRGenerator(null)} variant="outline">
                        Close
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}