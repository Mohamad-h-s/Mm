import React from 'react';

interface StepsPanelProps {
  steps: string[];
}

export const StepsPanel: React.FC<StepsPanelProps> = ({ steps }) => {
  if (steps.length === 0) return null;
  return (
    <div className="bg-gray-800 rounded-xl p-3 mb-3 border border-gray-700 text-sm font-mono">
      <p className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-sans">Steps</p>
      <ul className="space-y-0.5">
        {steps.map((step, i) => (
          <li key={i} className="text-gray-300 leading-snug whitespace-pre-wrap break-all">
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
};
