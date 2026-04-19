import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full">
      {label &&
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1">

          {label}
        </label>
      }
      <div className="relative">
        {leftIcon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        }
        <input
          id={inputId}
          className={`
          block w-full h-10 px-4 rounded-xl border border-gray-300 shadow-sm
          text-sm transition-all duration-200
          appearance-none outline-none
          focus:outline-none focus:shadow-none
          focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10
          disabled:bg-gray-50 disabled:text-gray-500
          ${leftIcon ? 'pl-10' : ''}
          ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}
          ${className}
        `}
          {...props} />

      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error &&
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      }
    </div>);

}