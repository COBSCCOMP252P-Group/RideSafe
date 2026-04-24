//@ts-nocheck
import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useAttendance } from '../../hooks/useAttendance';
import { useState, useEffect } from 'react';

export function AttendanceHistory() {

  const { getAttendanceHistory, loading } = useAttendance();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAttendanceHistory(1, 30); // student_id = 1
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  return (

    <Card title="Attendance History" className="bg-white/90 backdrop-blur-md shadow-lg">

      <div className="overflow-x-auto rounded-2xl border border-gray-200">

        <table className="min-w-full border-separate border-spacing-0">

          {/* Header */}
          <thead className="bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 text-gray-700 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-semibold rounded-tl-xl">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Check In</th>
              <th className="px-6 py-3 text-left font-semibold rounded-tr-xl">Check Out</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>

            {history.slice(0, 5).map((record, idx) => (
              <tr key={record.attendance_id || idx}>
                <td className="px-6 py-4 text-sm text-gray-800">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-purple-200 flex items-center justify-center mr-3">
                      {/* Calendar icon removed */}
                    </div>
                    <span className="font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                 </td>
                
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      record.status === 'PRESENT' ? 'success' :
                      record.status === 'ABSENT' ? 'danger' : 'secondary'
                    }
                    className="px-3 py-1 text-sm"
                  >
                    {record.status.toLowerCase()}
                  </Badge>
                 </td>
                
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {record.check_in_time ? 
                    new Date(`1970-01-01T${record.check_in_time}`).toLocaleTimeString() : 
                    '-'}
                 </td>
                
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {record.check_out_time ? 
                    new Date(`1970-01-01T${record.check_out_time}`).toLocaleTimeString() : 
                    '-'}
                 </td>
               </tr>
            ))}

          </tbody>

        </table>

      </div>

    </Card>

  );

}