import React, { useState, useCallback } from 'react';
import { solveEquations, detectVariables } from '../utils/evaluate';
import { Display } from './Display';
import { StepsPanel } from './StepsPanel';
import { cn } from '../utils/cn';

const EXAMPLES = [
  { label: 'Linear (1 var)', equations: ['2*x + 3 = 7'], vars: ['x'] },
  { label: 'Quadratic', equations: ['x^2 - 5*x + 6 = 0'], vars: ['x'] },
  { label: 'Cubic', equations: ['x^3 - 6*x^2 + 11*x - 6 = 0'], vars: ['x'] },
  { label: '2-var system', equations: ['x + y = 5', 'x - y = 1'], vars: ['x', 'y'] },
  { label: '3-var system', equations: ['x + y + z = 6', '2*x + y = 8', 'x + 3*z = 7'], vars: ['x', 'y', 'z'] },
  { label: 'Trig eq.', equations: ['2*sin(x) = 1'], vars: ['x'] },
];

export const EquationSolver: React.FC = () => {
  const [equations, setEquations] = useState<string[]>(['']);
  const [variables, setVariables] = useState<string>('');
  const [autoDetect, setAutoDetect] = useState(true);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const addEquation = () => setEquations((prev) => [...prev, '']);

  const removeEquation = (idx: number) =>
    setEquations((prev) => prev.filter((_, i) => i !== idx));

  const updateEquation = (idx: number, val: string) => {
    setEquations((prev) => prev.map((eq, i) => (i === idx ? val : eq)));
    setSolved(false);
    setResult('');
    setError('');
    setSteps([]);
  };

  const solve = useCallback(() => {
    const filtered = equations.map((e) => e.trim()).filter(Boolean);
    if (filtered.length === 0) {
      setError('Please enter at least one equation.');
      return;
    }

    let vars: string[];
    if (autoDetect) {
      vars = detectVariables(filtered);
    } else {
      vars = variables
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }

    if (vars.length === 0) {
      setError('No variables detected. Enter variable names manually.');
      return;
    }

    const res = solveEquations(filtered, vars);
    if (res.error) {
      setError(res.error);
      setResult('');
      setSteps([]);
    } else {
      setResult(res.result);
      setError('');
      setSteps(res.steps ?? []);
      setSolved(true);
    }
  }, [equations, variables, autoDetect]);

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setEquations(ex.equations);
    setVariables(ex.vars.join(', '));
    setAutoDetect(false);
    setResult('');
    setError('');
    setSteps([]);
    setSolved(false);
  };

  const reset = () => {
    setEquations(['']);
    setVariables('');
    setResult('');
    setError('');
    setSteps([]);
    setSolved(false);
  };

  return (
    <div>
      <Display expression={equations.join('  ;  ')} result={result} error={error} mode="solver" />

      {/* Examples */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Quick Examples</p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => loadExample(ex)}
              className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-indigo-700 text-gray-300 hover:text-white rounded-lg border border-gray-600 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equations */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Equations</p>
        <div className="space-y-2">
          {equations.map((eq, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-gray-500 text-sm font-mono w-6 text-right shrink-0">
                [{idx + 1}]
              </span>
              <input
                type="text"
                value={eq}
                onChange={(e) => updateEquation(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') solve();
                }}
                placeholder={`e.g. 2*x + y = 5`}
                className="flex-1 bg-gray-800 border border-gray-600 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono text-sm outline-none transition-colors"
              />
              {equations.length > 1 && (
                <button
                  onClick={() => removeEquation(idx)}
                  className="text-red-400 hover:text-red-300 text-lg leading-none px-1"
                  title="Remove equation"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={addEquation}
            className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-700 hover:border-indigo-500 rounded-lg px-3 py-1.5 transition-colors"
          >
            + Add Equation
          </button>
          <button
            onClick={reset}
            className="text-sm text-gray-400 hover:text-gray-300 border border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Variables */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Variables</p>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            Auto-detect
          </label>
        </div>
        <input
          type="text"
          value={
            autoDetect
              ? detectVariables(equations.map((e) => e.trim()).filter(Boolean)).join(', ')
              : variables
          }
          onChange={(e) => {
            setAutoDetect(false);
            setVariables(e.target.value);
          }}
          placeholder="e.g. x, y, z"
          className={cn(
            'w-full bg-gray-800 border rounded-xl px-3 py-2 text-white font-mono text-sm outline-none transition-colors',
            autoDetect
              ? 'border-gray-700 text-gray-400 cursor-not-allowed'
              : 'border-gray-600 focus:border-indigo-500',
          )}
          readOnly={autoDetect}
        />
      </div>

      {/* Solve button */}
      <button
        onClick={solve}
        className={cn(
          'w-full py-3.5 rounded-2xl font-bold text-lg transition-all duration-150 active:scale-95',
          'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg',
          solved && 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
        )}
      >
        {solved ? '🔁 Solve Again' : '🔍 Solve'}
      </button>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="mt-3">
          <StepsPanel steps={steps} />
        </div>
      )}

      {/* Cheat sheet */}
      <div className="mt-4 bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">📖 Syntax Guide</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs font-mono text-gray-400">
          <span>2*x + 3 = 7</span><span className="text-gray-500">linear</span>
          <span>x^2 - 4 = 0</span><span className="text-gray-500">quadratic</span>
          <span>x^3 + 2*x = 5</span><span className="text-gray-500">cubic</span>
          <span>sin(x) = 0.5</span><span className="text-gray-500">trig</span>
          <span>2*x + y = 5</span><span className="text-gray-500">multi-var</span>
          <span>x + y + z = 6</span><span className="text-gray-500">3-variable</span>
        </div>
      </div>
    </div>
  );
};
