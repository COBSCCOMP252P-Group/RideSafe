//@ts-nocheck
import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MOCK_ATTENDANCE_HISTORY } from '../../utils/mockData';
import { Calendar } from 'lucide-react';
export function AttendanceHistory() {
  return (
    <Card title="Attendance History">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Check In
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Check Out
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_ATTENDANCE_HISTORY.slice(0, 5).map((record) =>
            <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                  variant={record.status === 'present' ? 'success' : 'danger'}>

                    {record.status.charAt(0).toUpperCase() +
                  record.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.checkIn || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.checkOut || '-'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>);

}