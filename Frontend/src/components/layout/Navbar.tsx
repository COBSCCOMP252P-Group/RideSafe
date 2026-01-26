//@ts-nocheck
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Bell, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
export function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav className="sticky top-0 z-40 bg-purple-200/90 backdrop-blur-lg border-b border-purple-1200/40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
                <img
                  src="/src/components/logo/RideSafe-icon.png"
                  alt="RideSafe Logo"
                  className="h-18 w-18 object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  RideSafe
                </span>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role} Portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden ring-2 ring-primary-100 hover:ring-primary-300 transition-all duration-200">
                {user.avatar ?
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover" /> :


                  <UserIcon className="h-5 w-5 text-primary-600" />
                }
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden sm:flex hover:bg-red-50 hover:text-red-600"
                leftIcon={<LogOut className="h-4 w-4" />}>

                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>);

}
