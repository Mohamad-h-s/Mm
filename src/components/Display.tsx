import React from 'react';
import { cn } from '../utils/cn';

interface DisplayProps {
  expression: string;
  result: string;
  error: string;
  mode: 'calc' | 'solver';
}

export const Display: React.FC<DisplayProps> = ({ expression, result, error, mode }) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-3 min-h-[110px] flex flex-col justify-between border border-gray-700">
      {/* Mode badge */}
      <div className="flex justify-end mb-1">
        <span
          className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            mode === 'calc'
              ? 'bg-indigo-900 text-indigo-300'
              : 'bg-emerald-900 text-emerald-300',
          )}
        >
          {mode === 'calc' ? '⚙ Calculator' : '🔣 Equation Solver'}
        </span>
      </div>

      {/* Expression input */}
      <div
        className="text-right text-gray-400 font-mono text-base break-all min-h-[1.5rem] leading-snug"
        style={{ wordBreak: 'break-all' }}
      >
        {expression || <span className="opacity-30">Enter expression…</span>}
      </div>

      {/* Result / Error */}
      <div
        className={cn(
          'text-right font-mono font-bold break-all leading-tight mt-1',
          error
            ? 'text-red-400 text-sm'
            : result
            ? 'text-emerald-400 text-2xl'
            : 'text-gray-600 text-2xl',
        )}
        style={{ wordBreak: 'break-all' }}
      >
        {error ? `⚠ ${error}` : result || '0'}
      </div>
    </div>
  );
};
