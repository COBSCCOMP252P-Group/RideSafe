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
  Mail } from
'lucide-react';
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">
                High Risk Students
              </p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {
                MOCK_LATE_PATTERNS.filter((p) => p.latePercentage >= 20).
                length
                }
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">
                Moderate Risk
              </p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {
                MOCK_LATE_PATTERNS.filter(
                  (p) => p.latePercentage >= 10 && p.latePercentage < 20
                ).length
                }
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Avg Delay</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {Math.round(
                  MOCK_LATE_PATTERNS.reduce(
                    (sum, p) => sum + p.averageDelayMinutes,
                    0
                  ) / MOCK_LATE_PATTERNS.length
                )}
                m
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Student List */}
      <Card title="Students Requiring Attention">
        <div className="space-y-4">
          {MOCK_LATE_PATTERNS.map((pattern, index) =>
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
            className={`p-4 rounded-xl border-2 ${getTrendColor(pattern.trend)} transition-all duration-200 hover:shadow-md`}>

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
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
                      className={`h-full rounded-full ${pattern.latePercentage >= 20 ? 'bg-gradient-to-r from-red-500 to-red-600' : pattern.latePercentage >= 10 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`} />

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