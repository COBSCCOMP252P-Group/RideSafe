
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
        throw new Error('Check-in failed');
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
        throw new Error('Check-out failed');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // const getAttendanceHistory = async (studentId: number, days: number = 30): Promise<AttendanceHistoryResponse[]> => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch(`/api/v1/attendance/history/${studentId}?days=${days}`, {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch attendance history');
  //     }

  //     return await response.json();
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to fetch attendance history');
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // };


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

    // ✅ Handle empty attendance case
    if (!data || data.length === 0) {
      console.log("⚠️ No attendance records found for this student");

      // optional: show UI message
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
    checkIn,
    checkOut,
    getAttendanceHistory,
    getAttendanceSummary,
    reportAbsence,
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