import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}
export function Toast({
  id,
  message,
  type = 'info',
  duration = 3000,
  onClose
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };
  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
        scale: 0.95
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      exit={{
        opacity: 0,
        scale: 0.95
      }}
      className={`flex items-center p-4 rounded-lg border shadow-lg ${colors[type]} backdrop-blur-sm`}>

      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="ml-3 text-sm font-medium text-gray-900">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">

        <X className="h-4 w-4" />
      </button>
    </motion.div>);

}
export function ToastContainer({
  toasts,
  onClose



}: {toasts: ToastProps[];onClose: (id: string) => void;}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) =>
        <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        )}
      </AnimatePresence>
    </div>);

}