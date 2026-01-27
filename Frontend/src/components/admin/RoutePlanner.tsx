//@ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MOCK_OPTIMIZED_ROUTES, MOCK_ROUTES } from '../../utils/mockData';
import {
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Zap } from
'lucide-react';
export function RoutePlanner() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Attendance-Based Route Planner
          </h2>
          <p className="text-gray-600 mt-1">
            Optimize routes based on confirmed student attendance
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800">
          <Zap className="h-4 w-4 mr-2" />
          Apply Optimizations
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_OPTIMIZED_ROUTES.map((optimized, index) => {
          const route = MOCK_ROUTES.find((r) => r.id === optimized.routeId);
          if (!route) return null;
          return (
            <motion.div
              key={optimized.routeId}
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: index * 0.1
              }}>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-100 to-transparent opacity-30 rounded-full blur-3xl"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {route.name}
                      </h3>
                      <p className="text-sm text-gray-500">{route.busNumber}</p>
                    </div>
                    <Badge
                      variant={
                      optimized.efficiency >= 90 ? 'success' : 'warning'
                      }
                      className="text-base px-3 py-1">

                      {optimized.efficiency}% Efficient
                    </Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                      <div className="flex items-center text-green-700 mb-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-semibold">Active</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {optimized.studentsActive}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-100">
                      <div className="flex items-center text-red-700 mb-1">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-semibold">Absent</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">
                        {optimized.studentsAbsent}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                      <div className="flex items-center text-blue-700 mb-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs font-semibold">Saved</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {optimized.timeSaved}m
                      </p>
                    </div>
                  </div>

                  {/* Route Comparison */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        Original Route ({optimized.originalStops.length} stops)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {optimized.originalStops.map((stop, i) =>
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${optimized.skippedStops.includes(stop) ? 'bg-red-100 text-red-700 line-through' : 'bg-gray-100 text-gray-700'}`}>

                            {stop}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1 text-primary-600" />
                        Optimized Route ({optimized.optimizedStops.length}{' '}
                        stops)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {optimized.optimizedStops.map((stop, i) =>
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300">

                            {stop}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {optimized.skippedStops.length > 0 &&
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Skipped:</strong>{' '}
                        {optimized.skippedStops.join(', ')} (no students
                        scheduled)
                      </p>
                    </div>
                  }
                </div>
              </Card>
            </motion.div>);

        })}
      </div>
    </div>);

}