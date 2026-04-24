// src/components/layout/Navbar.tsx
//@ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Bell, User as UserIcon, CheckCircle, AlertCircle, Info, XCircle, Bus, Megaphone } from 'lucide-react';
import { Button } from '../ui/Button';
import { notificationService, Notification } from '../../services/notificationService';
import logo from '../images/RideSafe-icon.png';

export function Navbar() {
  const { user, logout, token } = useAuth(); // Make sure token is available
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(token);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    if (!token) return;
    
    try {
      await notificationService.markAsRead(notificationId, token);
      setNotifications(prev =>
        prev.map(n => 
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.notification_id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getTypeIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'boarding': return <Bus className="h-5 w-5 text-green-500" />;
      case 'delay': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'sos': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'announcement': return <Megaphone className="h-5 w-5 text-purple-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'boarding': return 'border-green-500 bg-green-50/50';
      case 'delay': return 'border-yellow-500 bg-yellow-50/50';
      case 'sos': return 'border-red-500 bg-red-50/50';
      case 'announcement': return 'border-purple-500 bg-purple-50/50';
      default: return 'border-blue-500 bg-blue-50/50';
    }
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 bg-purple-200/90 backdrop-blur-lg border-b border-purple-1200/40 shadow-md">
      <div className="w-full px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-300 to-primary-400 rounded-xl flex items-center justify-start mr-3 shadow-lg shadow-primary-500/20">
                <img src={logo} alt="RideSafe Logo" className="scale-125 object-contain" />
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary-400 to-primary-700 bg-clip-text text-transparent">
                  RideSafe
                </span>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role} Portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-purple-500 hover:bg-purple-100 transition-all duration-200"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.notification_id}
                            onClick={() => !notification.is_read && markAsRead(notification.notification_id)}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.is_read ? `border-l-4 ${getTypeBgColor(notification.type)}` : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                {getTypeIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                    {notification.type?.toUpperCase() || 'INFO'}
                                  </p>
                                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                    {formatTime(notification.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-4 py-2 border-t bg-gray-50">
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-purple-600 hover:text-purple-700 w-full text-center"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5 text-primary-600" />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:flex hover:bg-red-50 hover:text-red-600" leftIcon={<LogOut className="h-4 w-4" />}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}