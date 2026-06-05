import React from 'react';
import { cn } from '../utils/cn';

type Variant = 'default' | 'operator' | 'action' | 'equals' | 'function' | 'clear';

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  variant?: Variant;
  wide?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default:
    'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600',
  operator:
    'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500',
  action:
    'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-500',
  equals:
    'bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-400 font-bold',
  function:
    'bg-blue-800 hover:bg-blue-700 text-blue-100 border border-blue-700 text-sm',
  clear:
    'bg-red-600 hover:bg-red-500 text-white border border-red-500',
};

export const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  onClick,
  variant = 'default',
  wide = false,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-xl font-mono text-lg',
        'transition-all duration-100 active:scale-95 select-none cursor-pointer',
        'h-14',
        wide ? 'col-span-2' : '',
        variantClasses[variant],
        className,
      )}
    >
      {label}
    </button>
  );
};
