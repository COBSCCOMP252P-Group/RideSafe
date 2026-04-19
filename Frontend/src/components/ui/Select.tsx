import React from 'react';
interface SelectOption {
  value: string;
  label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}
export function Select({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full">
      {label &&
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700 mb-1">

          {label}
        </label>
      }
      <select
        id={selectId}
        className={`
        block w-full h-10 px-4 rounded-xl border border-gray-300 shadow-sm
        text-sm transition-all duration-200 appearance-none outline-none
        focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500
        disabled:bg-gray-50 disabled:text-gray-500
        ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/10' : ''}
        ${className}
      `}
        {...props}>

        {options.map((option) =>
        <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>);

}