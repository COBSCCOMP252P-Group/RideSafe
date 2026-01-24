import React from 'react';
import { Card } from '../ui/Card';
import { MOCK_NOTIFICATIONS } from '../../utils/mockData';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
export function NotificationsList() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  return (
    <Card title="Recent Notifications" className="h-full">
      <div className="space-y-4">
        {MOCK_NOTIFICATIONS.map((notification) =>
        <div
          key={notification.id}
          className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">

            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {new Date(notification.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {notification.message}
              </p>
            </div>
          </div>
        )}
        {MOCK_NOTIFICATIONS.length === 0 &&
        <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>No new notifications</p>
          </div>
        }
      </div>
    </Card>);

}

