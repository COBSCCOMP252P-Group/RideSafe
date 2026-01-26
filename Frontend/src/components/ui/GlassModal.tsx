import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  return (
    <AnimatePresence>
      {isOpen &&
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true">

          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            aria-hidden="true">
          </motion.div>

            <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true">

              &#8203;
            </span>

            {/* Modal */}
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            transition={{
              type: 'spring',
              duration: 0.5
            }}
            className={`inline-block align-bottom text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]}`}>

              <div className="relative rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-purple-500/5 rounded-2xl"></div>

                {/* Content */}
                <div className="relative z-10 px-6 pt-6 pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3
                    className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary-800 bg-clip-text text-transparent"
                    id="modal-title">

                      {title}
                    </h3>
                    <motion.button
                    whileHover={{
                      scale: 1.1,
                      rotate: 90
                    }}
                    whileTap={{
                      scale: 0.9
                    }}
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/50 backdrop-blur-sm text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200 border border-white/20">

                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                  <div>{children}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      }
    </AnimatePresence>);

}