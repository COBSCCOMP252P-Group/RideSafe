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
              <tr
                key={record.id}
                className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-purple-50' : 'bg-white'} hover:shadow-md hover:scale-[1.01] rounded-lg`}
              >

                {/* Date */}
                <td className="px-6 py-4 text-sm text-gray-800">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-purple-200 flex items-center justify-center mr-3">
                      <Calendar className="h-4 w-4 text-purple-700" />
                    </div>
                    <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      record.status === 'present'
                        ? 'success'
                        : record.status === 'absent'
                        ? 'danger'
                        : 'secondary'
                    }
                    className="px-3 py-1 text-sm"
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </td>

                {/* Check In */}
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{record.checkIn || '-'}</td>

                {/* Check Out */}
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{record.checkOut || '-'}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </Card>

  );

}