import React from 'react';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
  const variants = {
  primary:
    'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:scale-[1.03] hover:shadow-purple-500/50 focus:ring-purple-500',

  secondary:
    'bg-white/60 backdrop-blur-md text-purple-700 border border-white/40 hover:bg-purple-100 hover:scale-[1.02] focus:ring-purple-400',

  outline:
    'border border-purple-200 bg-white/40 backdrop-blur-md text-purple-700 hover:bg-purple-50 hover:border-purple-300 hover:scale-[1.02] focus:ring-purple-400',

  ghost:
    'text-gray-600 hover:text-purple-700 hover:bg-white/50 backdrop-blur-md hover:scale-[1.02] focus:ring-purple-400',

  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:scale-[1.03] hover:shadow-red-400/40 focus:ring-red-500'
};
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}>

      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>);

}