import React from 'react';
interface TextareaProps extends
  React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full">
      {label &&
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-gray-700 mb-1">

          {label}
        </label>
      }
      <textarea
        id={textareaId}
        className={`
          block w-full rounded-lg border-gray-300 shadow-sm 
          focus:border-primary-500 focus:ring-primary-500 sm:text-sm
          ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props} />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>);

}