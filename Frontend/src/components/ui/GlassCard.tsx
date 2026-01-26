import React from 'react';
import { motion } from 'framer-motion';
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}
export function GlassCard({
  children,
  className = '',
  hover = true,
  gradient = false
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
      hover ?
      {
        y: -4,
        scale: 1.02
      } :
      {}
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/40 backdrop-blur-xl
        border border-white/20
        shadow-xl shadow-black/5
        ${hover ? 'hover:shadow-2xl hover:shadow-primary-500/10 hover:border-white/30' : ''}
        transition-all duration-300
        ${className}
      `}>

      {gradient &&
      <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-purple-500/10 opacity-50"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
        </>
      }
      <div className="relative z-10">{children}</div>
    </motion.div>);

}