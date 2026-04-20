import React, { useEffect } from 'react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: GlassModalProps) {

  useEffect(() => {
    if (isOpen) {
      window.scrollTo(0, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null; // 🔥 important (prevents overlay feel)

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-10">

      <div className={`mx-auto w-full ${sizes[size]}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-6">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}