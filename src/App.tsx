import { useState } from 'react';
import { StandardCalc } from './components/StandardCalc';
import { EquationSolver } from './components/EquationSolver';

type Tab = 'calc' | 'solver';

export default function App() {
  const [tab, setTab] = useState<Tab>('calc');

  return (
    <div className="min-h-screen bg-gray-950 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="text-3xl">🧮</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Smart<span className="text-indigo-400">Calc</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Standard Calculator & Symbolic Equation Solver — 100% Offline
          </p>
        </div>

        {/* Main card */}
        <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">

          {/* Tab switcher */}
          <div className="flex bg-gray-900">
            <button
              onClick={() => setTab('calc')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                tab === 'calc'
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800'
                  : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
              }`}
            >
              ⚙️ Calculator
            </button>
            <button
              onClick={() => setTab('solver')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                tab === 'solver'
                  ? 'text-emerald-400 border-b-2 border-emerald-500 bg-gray-800'
                  : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
              }`}
            >
              🔣 Equation Solver
            </button>
          </div>

          {/* Tab content */}
          <div className="p-4">
            {tab === 'calc' ? <StandardCalc /> : <EquationSolver />}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-700 text-xs mt-4">
          Powered by <span className="text-gray-600">math.js</span> &amp;{' '}
          <span className="text-gray-600">nerdamer</span> · No network required
        </p>
      </div>
    </div>
  );
}
