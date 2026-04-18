//@ts-nocheck
import React from 'react';
import { Card } from '../ui/Card';
import { MOCK_NOTIFICATIONS } from '../../utils/mockData';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function NotificationsList() {

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Card title="Recent Notifications" className="h-full bg-white/90 backdrop-blur-sm shadow-lg">

      <div className="space-y-3">

        {MOCK_NOTIFICATIONS.map((notification) => (
          <div
            key={notification.id}
            className="group flex items-start p-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-purple-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center
                ${notification.type === 'success' ? 'bg-green-100' :
                  notification.type === 'error' ? 'bg-red-100' :
                  notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}
                transition-all duration-200`}
              >
                {getIcon(notification.type)}
              </div>
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                  {new Date(notification.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
            </div>

          </div>
        ))}

        {/* Empty state */}
        {MOCK_NOTIFICATIONS.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No new notifications</p>
          </div>
        )}

      </div>
    </Card>
  );

}