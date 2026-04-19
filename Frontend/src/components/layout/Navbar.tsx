//@ts-nocheck
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Bell, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../images/RideSafe-icon.png';

export function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav className="sticky top-0 z-40 bg-purple-200/90 backdrop-blur-lg border-b border-purple-1200/40 shadow-md">
      <div className="w-full px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-300 to-primary-400 rounded-xl flex items-center justify-start mr-3 shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
                <img
                  src={logo}
                  alt="RideSafe Logo"
                  className="scale-125 object-contain"
                />
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
            <button className="relative p-2 rounded-xl text-purple-500 hover:bg-purple-100 hover:text-primary-700 transition-all duration-200">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 block h-1 w-1 rounded-full bg-red-400 ring-2 ring-white animate-pulse"></span>
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
