import React, { useState } from 'react';
import { motion } from 'framer-motion';
export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}
export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                transition-colors duration-200
                ${isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}>

              <span className="flex items-center space-x-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 &&
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-bold bg-primary-100 text-primary-600">
                    {tab.badge}
                  </span>
                }
              </span>

              {isActive &&
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                layoutId="activeTab"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30
                }} />

              }
            </button>);

        })}
      </nav>
    </div>);

}