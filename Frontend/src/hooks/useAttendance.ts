import { useState, useEffect } from 'react';
import { AttendanceHistoryResponse, AttendanceSummary } from '../types';

const API_BASE = 'http://localhost:8000';

export interface CheckInRequest {
  student_id: number;
  bus_id: number;
  route_id: number;
  qr_code?: string;
}

export interface CheckOutRequest {
  student_id: number;
  bus_id: number;
  qr_code?: string;
}

export interface AbsenceRequest {
  student_id: number;
  date: string;
  reason: string;
}

// QR Code specific interfaces
export interface QRCodeResponse {
  student_id: number;
  student_name: string;
  qr_token: string;
  qr_image_base64: string;
  message: string;
}

export interface QRCheckRequest {
  qr_token: string;
  bus_id: number;
  route_id?: number; // Optional for check-out
}

export function useAttendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIn = async (data: CheckInRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Check-in failed');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async (data: CheckOutRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/attendance/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Check-out failed');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };


  

  // 🆕 QR Code Check-in
  const qrCheckIn = async (qr_token: string, bus_id: number, route_id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/attendance/qr/checkin?qr_token=${qr_token}&bus_id=${bus_id}&route_id=${route_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'QR check-in failed');
      }

      const data = await response.json();
      console.log('✅ QR Check-in successful:', data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'QR check-in failed');
      console.error('❌ QR Check-in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 QR Code Check-out
  const qrCheckOut = async (qr_token: string, bus_id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/attendance/qr/checkout?qr_token=${qr_token}&bus_id=${bus_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'QR check-out failed');
      }

      const data = await response.json();
      console.log('✅ QR Check-out successful:', data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'QR check-out failed');
      console.error('❌ QR Check-out error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Generate QR Code for a student
  const generateQRCode = async (student_id: number): Promise<QRCodeResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/attendance/qr/generate/${student_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'QR code generation failed');
      }

      const data = await response.json();
      console.log('✅ QR Code generated for student:', student_id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'QR code generation failed');
      console.error('❌ QR generation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Get QR Code as base64 image
  const getQRCodeImage = async (student_id: number): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/attendance/qr-dataurl/${student_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch QR code image');
      }

      const data = await response.json();
      return data.qr_data_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch QR code');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Download QR Code as PNG
  const downloadQRCode = async (student_id: number, student_name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/attendance/qr/download/${student_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_code_${student_name}_${student_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ QR Code downloaded for:', student_name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download QR code');
      console.error('❌ QR download error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceHistory = async (
    studentId: number,
    days: number = 30
  ): Promise<AttendanceHistoryResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/attendance/history/${studentId}?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance history");
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        console.log("⚠️ No attendance records found for this student");
        setError("No attendance records found");
        return [];
      }

      console.log("✅ Attendance history loaded:", data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch attendance history";

      setError(message);
      console.error("❌ Attendance API error:", message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = async (
    studentId: number,
    startDate: string,
    endDate: string
  ): Promise<AttendanceSummary> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/attendance/summary/${studentId}?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance summary');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance summary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reportAbsence = async (data: AbsenceRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/attendance/absence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to report absence');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report absence');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Existing functions
    checkIn,
    checkOut,
    getAttendanceHistory,
    getAttendanceSummary,
    reportAbsence,
    // 🆕 QR Code functions
    qrCheckIn,
    qrCheckOut,
    generateQRCode,
    getQRCodeImage,
    downloadQRCode,
    // State
    loading,
    error
  };
}

export interface Student {
  student_id: number;
  full_name: string;
  grade: string | null;
  parent_id: number;
  status: string;
  index_no: string | null;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE}/api/v1/students`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
      console.log('✅ Students loaded:', data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch students';
      setError(message);
      console.error('❌ Students API error:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents
  };
}