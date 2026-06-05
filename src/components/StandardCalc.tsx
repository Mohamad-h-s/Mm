import React, { useState, useCallback, useEffect } from 'react';
import { CalcButton } from './CalcButton';
import { Display } from './Display';
import { evaluateExpression } from '../utils/evaluate';

type HistoryEntry = { expr: string; result: string };

export const StandardCalc: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const append = useCallback(
    (val: string) => {
      setError('');
      if (justEvaluated) {
        if (/^[0-9.(]$/.test(val)) {
          setExpression(val);
          setResult('');
          setJustEvaluated(false);
          return;
        }
        setExpression((result || '0') + val);
        setResult('');
        setJustEvaluated(false);
        return;
      }
      setExpression((prev) => prev + val);
    },
    [justEvaluated, result],
  );

  const clear = useCallback(() => {
    setExpression('');
    setResult('');
    setError('');
    setJustEvaluated(false);
  }, []);

  const backspace = useCallback(() => {
    setError('');
    if (justEvaluated) {
      setExpression('');
      setResult('');
      setJustEvaluated(false);
      return;
    }
    setExpression((prev) => prev.slice(0, -1));
  }, [justEvaluated]);

  const evaluate = useCallback(() => {
    if (!expression.trim()) return;
    const evalResult = evaluateExpression(expression);
    if (evalResult.error) {
      setError(evalResult.error);
      setResult('');
    } else {
      setResult(evalResult.result);
      setError('');
      setHistory((prev) => [{ expr: expression, result: evalResult.result }, ...prev.slice(0, 19)]);
      setJustEvaluated(true);
    }
  }, [expression]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        evaluate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Escape') {
        clear();
      } else if (/^[0-9+\-*/.(),^%! ]$/.test(e.key)) {
        append(e.key);
      } else if (e.key.toLowerCase() === 'p') {
        append('pi');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [evaluate, backspace, clear, append]);

  const btn = (
    label: string,
    val: string,
    variant: 'default' | 'operator' | 'action' | 'equals' | 'function' | 'clear' = 'default',
    wide = false,
  ) => (
    <CalcButton
      key={label + val}
      label={label}
      onClick={() => append(val)}
      variant={variant}
      wide={wide}
    />
  );

  return (
    <div>
      <Display expression={expression} result={result} error={error} mode="calc" />

      {/* History toggle */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setShowHistory((p) => !p)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showHistory ? '▲ Hide History' : '▼ Show History'} ({history.length})
        </button>
        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="text-xs text-red-700 hover:text-red-500 transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 mb-3 max-h-36 overflow-y-auto">
          {history.map((h, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-3 py-1.5 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0"
              onClick={() => {
                setExpression(h.result);
                setResult('');
                setJustEvaluated(false);
              }}
            >
              <span className="text-gray-500 font-mono text-xs truncate">{h.expr}</span>
              <span className="text-emerald-400 font-mono text-sm ml-2 shrink-0">= {h.result}</span>
            </div>
          ))}
        </div>
      )}

      {/* Function row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {btn('sin(', 'sin(', 'function')}
        {btn('cos(', 'cos(', 'function')}
        {btn('tan(', 'tan(', 'function')}
        {btn('log(', 'log(', 'function')}
        {btn('√(', 'sqrt(', 'function')}
        {btn('π', 'pi', 'function')}
        {btn('e', 'e', 'function')}
        {btn('^', '^', 'function')}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-4 gap-2">
        <CalcButton label="AC" onClick={clear} variant="clear" />
        {btn('(', '(', 'action')}
        {btn(')', ')', 'action')}
        {btn('÷', '/', 'operator')}

        {btn('7', '7')}
        {btn('8', '8')}
        {btn('9', '9')}
        {btn('×', '*', 'operator')}

        {btn('4', '4')}
        {btn('5', '5')}
        {btn('6', '6')}
        {btn('−', '-', 'operator')}

        {btn('1', '1')}
        {btn('2', '2')}
        {btn('3', '3')}
        {btn('+', '+', 'operator')}

        {btn('%', '%', 'action')}
        {btn('0', '0')}
        {btn('.', '.')}
        <CalcButton label="=" onClick={evaluate} variant="equals" />

        <CalcButton label="⌫" onClick={backspace} variant="action" wide />
        {btn('Ans', result || '0', 'action')}
        {btn('n!', '!', 'action')}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-gray-700 text-xs mt-3">
        ⌨ Keyboard supported · Enter = evaluate · Esc = clear
      </p>
    </div>
  );
};
