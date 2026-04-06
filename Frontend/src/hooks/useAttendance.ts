
import { useState, useEffect } from 'react';
import { AttendanceHistoryResponse, AttendanceSummary } from '../types';


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
      const response = await fetch('/api/v1/attendance/checkin', {
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
      const response = await fetch('/api/v1/attendance/checkout', {
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
  const getAttendanceHistory = async (studentId: number, days: number = 30): Promise<AttendanceHistoryResponse[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/attendance/history/${studentId}?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance history');
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
        `/api/v1/attendance/summary/${studentId}?start_date=${startDate}&end_date=${endDate}`,
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

  return {
    checkIn,
    checkOut,
    getAttendanceHistory,
    getAttendanceSummary,
    loading,
    error
  };
}