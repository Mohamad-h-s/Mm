// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import nerdamerBase from 'nerdamer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nerdamer = nerdamerBase as any;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'nerdamer/Algebra';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'nerdamer/Calculus';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'nerdamer/Solve';

import { create, all } from 'mathjs';

const math = create(all);

export type EvalResult = {
  result: string;
  steps?: string[];
  error?: string;
};

/** Detect all variable-like symbols from an expression string (letters a-z excluding known constants) */
const KNOWN_CONSTANTS = new Set([
  'e', 'pi', 'i', 'inf', 'Inf', 'true', 'false',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'log', 'ln', 'exp', 'sqrt', 'abs', 'floor', 'ceil', 'round',
  'sign', 'max', 'min', 'sum', 'prod',
]);

export function detectVariables(expressions: string[]): string[] {
  const found = new Set<string>();
  const allText = expressions.join(' ');
  // Match single lowercase letters and multi-letter words that look like variable names
  const tokens = allText.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) ?? [];
  for (const t of tokens) {
    if (!KNOWN_CONSTANTS.has(t) && !/^\d+$/.test(t)) {
      found.add(t);
    }
  }
  return Array.from(found).sort();
}

/**
 * Evaluate a standard arithmetic / math expression.
 * e.g. "2 + 3 * (4 - 1)", "sin(pi/2)", "sqrt(16)", "log(100, 10)"
 */
export function evaluateExpression(expr: string): EvalResult {
  try {
    const cleaned = expr.trim();
    if (!cleaned) return { result: '', error: 'Empty expression.' };

    const result = math.evaluate(cleaned);
    if (typeof result === 'function') {
      return { result: '', error: 'Expression returned a function, not a value.' };
    }
    const formatted = math.format(result, { precision: 14 });
    return { result: formatted };
  } catch (e: unknown) {
    return { result: '', error: (e as Error).message };
  }
}

/**
 * Auto-detect variables in equations and solve.
 */
export function autoSolveEquations(equations: string[]): EvalResult {
  const vars = detectVariables(equations);
  if (vars.length === 0) {
    // No variables — just evaluate as expression
    const joined = equations.join('; ');
    return evaluateExpression(joined);
  }
  return solveEquations(equations, vars);
}

/**
 * Solve one or more equations for given variables using nerdamer.
 */
export function solveEquations(equations: string[], variables: string[]): EvalResult {
  try {
    if (equations.length === 0) return { result: '', error: 'No equations provided.' };
    if (variables.length === 0) return { result: '', error: 'No variables specified.' };

    const steps: string[] = [];
    const vars = variables.map((v) => v.trim()).filter(Boolean);

    steps.push(`📐 Solving for: ${vars.join(', ')}`);
    steps.push(`📋 Equations:`);
    equations.forEach((eq, i) => steps.push(`   [${i + 1}]  ${eq}`));

    if (vars.length === 1 && equations.length === 1) {
      // Single equation, single variable
      const variable = vars[0];
      const eq = equations[0];

      const sol = nerdamer.solveEquations(eq, variable);
      const solStr: string = sol.toString();

      // Parse solutions from nerdamer output like "[2,-2]" or "3"
      const solutions = parseSolutionString(solStr);

      if (solutions.length === 0) {
        return { result: 'No real solutions found.', steps };
      }

      steps.push(`✅ Solution${solutions.length > 1 ? 's' : ''}:`);
      solutions.forEach((s) => steps.push(`   ${variable} = ${s}`));

      const resultStr = solutions.map((s) => `${variable} = ${s}`).join('  OR  ');
      return { result: resultStr, steps };
    }

    // System of equations
    const sol = nerdamer.solveEquations(equations, vars);
    const solStr: string = sol.toString();

    steps.push(`✅ Solutions:`);

    // nerdamer returns [[var, val], [var, val], ...] or flat text
    const resultParts: string[] = [];

    if (Array.isArray(sol)) {
      for (const pair of sol) {
        const varName = pair[0];
        const val = pair[1];
        const formatted = formatValue(String(val));
        steps.push(`   ${varName} = ${formatted}`);
        resultParts.push(`${varName} = ${formatted}`);
      }
    } else {
      // Parse text output
      const raw = solStr.replace(/^\[/, '').replace(/\]$/, '');
      const pairs = raw.split(',').map((s: string) => s.trim());
      pairs.forEach((p: string) => {
        if (p) {
          steps.push(`   ${p}`);
          resultParts.push(p);
        }
      });
    }

    if (resultParts.length === 0) {
      return { result: 'No solution found or system is inconsistent.', steps };
    }

    return { result: resultParts.join('  ,  '), steps };
  } catch (e: unknown) {
    return { result: '', error: (e as Error).message };
  }
}

function parseSolutionString(s: string): string[] {
  const trimmed = s.replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!trimmed) return [];
  // Split on commas that are not inside parentheses
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of trimmed) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts.filter(Boolean);
}

function formatValue(s: string): string {
  // Try to evaluate to decimal
  try {
    const v = math.evaluate(s);
    if (typeof v === 'number' && !Number.isInteger(v)) {
      return `${s} ≈ ${v.toPrecision(8)}`;
    }
    return String(v);
  } catch {
    return s;
  }
}
