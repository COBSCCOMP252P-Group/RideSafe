//@ts-nocheck

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MOCK_LATE_PATTERNS } from '../../utils/mockData';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Mail
} from
  'lucide-react';
import { useAttendance } from '../../hooks/useAttendance';
import { useState, useEffect } from 'react';

export function LateStudentWarnings() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'worsening':
        return 'border-red-200 bg-red-50';
      case 'improving':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };
  const getSeverityBadge = (percentage: number) => {
    if (percentage >= 20) return <Badge variant="danger">High Risk</Badge>;
    if (percentage >= 10) return <Badge variant="warning">Moderate</Badge>;
    return <Badge variant="neutral">Low</Badge>;
  };
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  useEffect(() => {
    // Simulate fetching attendance data
    setAttendanceData(MOCK_LATE_PATTERNS);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 border border-white/70 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Late Student Warnings
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor students with repeated late arrivals
          </p>
        </div>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Notify Parents
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-3xl bg-gradient-to-br from-red-100 via-red-50 to-pink-100 border-red-200 shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">
                High Risk Students
              </p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {
                  attendanceData.filter((p) => p.latePercentage >= 20).
                    length
                }
              </p>
            </div>
            <div className="p-4 bg-red-300 rounded-2xl shadow-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-amber-300 shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">
                Moderate Risk
              </p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {
                  attendanceData.filter(
                    (p) => p.latePercentage >= 10 && p.latePercentage < 20
                  ).length
                }
              </p>
            </div>
            <div className="p-4 bg-amber-300 rounded-2xl shadow-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-400 shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Delay</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {Math.round(
                  attendanceData.reduce(
                    (sum, p) => sum + p.averageDelayMinutes,
                    0
                  ) / attendanceData.length
                )}
                m
              </p>
            </div>
            <div className="p-4 bg-blue-300 rounded-2xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Student List */}
      <Card title="Students Requiring Attention">
        <div className="space-y-4">
          {attendanceData.map((pattern, index) =>
            <motion.div
              key={pattern.studentId}
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: index * 0.1
              }}
              className={`p-6 rounded-3xl border-2 ${getTrendColor(pattern.trend)} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] bg-red/70 backdrop-blur-xl`}>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {pattern.studentName}
                    </h3>
                    {getSeverityBadge(pattern.latePercentage)}
                    <div className="flex items-center space-x-1 text-sm">
                      {getTrendIcon(pattern.trend)}
                      <span className="font-medium text-gray-700 capitalize">
                        {pattern.trend}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Late Count
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {pattern.totalLateCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Late Rate
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {pattern.latePercentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Avg Delay
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {pattern.averageDelayMinutes}m
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Last Late
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(pattern.lastLateDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric'
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Punctuality Score</span>
                      <span>{100 - pattern.latePercentage}%</span>
                    </div>
                    <div className="w-full bg-white/80 rounded-full h-3 overflow-hidden shadow-inner border border-white">
                      <motion.div
                        initial={{
                          width: 0
                        }}
                        animate={{
                          width: `${100 - pattern.latePercentage}%`
                        }}
                        transition={{
                          duration: 1,
                          delay: index * 0.1
                        }}
                        className={`h-full rounded-full ${pattern.latePercentage >= 20 ? 'bg-gradient-to-r from-rose-300 to-rose-400' : pattern.latePercentage >= 15 ? 'bg-gradient-to-r from-yellow-300 to-yellow-400' : 'bg-gradient-to-r from-green-300 to-green-400'}`} />
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="whitespace-nowrap">

                    <Bell className="h-3 w-3 mr-1" />
                    Notify Parent
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="whitespace-nowrap">

                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </div>);

}