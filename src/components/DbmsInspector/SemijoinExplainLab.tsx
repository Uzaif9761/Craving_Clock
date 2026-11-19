import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { GitCompare, Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const SemijoinExplainLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'semijoin' | 'antisemijoin'>('semijoin');
  const [executionResult, setExecutionResult] = useState<any>(null);

  const handleRunQuery = () => {
    if (activeMode === 'semijoin') {
      const res = db.executeSemijoinQuery();
      setExecutionResult(res);
    } else {
      const res = db.executeAntiSemijoinQuery();
      setExecutionResult(res);
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Selector Bar */}
      <div className="p-6 rounded-2xl glass-panel border border-[#FF9F1C]/25 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold font-syne text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#FF9F1C]" />
            Semijoin & Anti-Semijoin Query Optimizer & EXPLAIN Visualizer
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Demonstrates LooseScan and FirstMatch execution strategies in relational optimizers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
            <button
              onClick={() => {
                setActiveMode('semijoin');
                setExecutionResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'semijoin'
                  ? 'bg-[#FF9F1C] text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Semijoin (EXISTS)
            </button>
            <button
              onClick={() => {
                setActiveMode('antisemijoin');
                setExecutionResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'antisemijoin'
                  ? 'bg-[#2EC4B6] text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Anti-Semijoin (NOT EXISTS)
            </button>
          </div>

          <button
            onClick={handleRunQuery}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-xs shadow-lg shadow-[#FF9F1C]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>EXPLAIN Query</span>
          </button>
        </div>
      </div>

      {/* Query & Strategy Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-[#0B0908] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#FF9F1C]">
              {activeMode === 'semijoin' ? 'SEMIJOIN (Optimized Strategy)' : 'ANTI-SEMIJOIN (Optimized Strategy)'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2EC4B6]/15 text-[#2EC4B6]">
              Cost: O(N) FirstMatch
            </span>
          </div>

          <pre className="p-3.5 rounded-xl bg-black/70 border border-white/5 text-[11px] font-mono text-[#FFB84D] overflow-x-auto leading-relaxed">
            <code>
              {activeMode === 'semijoin'
                ? `SELECT v.vendor_id, v.name, v.area_zone, v.rating
FROM VENDORS v
WHERE EXISTS (
    SELECT 1 FROM MENU_ITEMS m
    JOIN DAILY_AVAILABILITY d ON m.item_id = d.item_id
    WHERE m.vendor_id = v.vendor_id
      AND d.meal_slot = 'Lunch'
      AND d.stock_qty > 0
);`
                : `SELECT c.cust_id, c.regd_no, c.name, c.course
FROM CUSTOMERS c
WHERE NOT EXISTS (
    SELECT 1 FROM ORDERS o
    WHERE o.cust_id = c.cust_id
);`}
            </code>
          </pre>

          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            {activeMode === 'semijoin'
              ? 'Halts evaluation as soon as the first matching available dish is located for the mess. Eliminates duplicate vendor rows without allocating temporary tables for DISTINCT.'
              : 'Immediately halts scanning student orders upon locating the first order. Yields students with zero transaction history (dormant accounts).'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0908] border border-white/10 space-y-3 opacity-75">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-neutral-400">
              {activeMode === 'semijoin' ? 'NAIVE INNER JOIN + DISTINCT' : 'NAIVE LEFT JOIN + IS NULL'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-400">
              High Memory / Filesort
            </span>
          </div>

          <pre className="p-3.5 rounded-xl bg-black/70 border border-white/5 text-[11px] font-mono text-neutral-400 overflow-x-auto leading-relaxed">
            <code>
              {activeMode === 'semijoin'
                ? `SELECT DISTINCT v.vendor_id, v.name
FROM VENDORS v
JOIN MENU_ITEMS m ON v.vendor_id = m.vendor_id
JOIN DAILY_AVAILABILITY d ON m.item_id = d.item_id
WHERE d.meal_slot = 'Lunch' AND d.stock_qty > 0;`
                : `SELECT c.cust_id, c.regd_no, c.name
FROM CUSTOMERS c
LEFT JOIN ORDERS o ON c.cust_id = o.cust_id
WHERE o.order_id IS NULL;`}
            </code>
          </pre>

          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Requires materialized cartesian join buffer followed by an expensive hash deduplication pass or full null-check outer scan.
          </p>
        </div>
      </div>

      {/* EXPLAIN Execution Output */}
      {executionResult && (
        <div className="p-6 rounded-2xl glass-panel border border-[#2EC4B6]/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2EC4B6]" />
              EXPLAIN Optimizer Telemetry & Result Set ({executionResult.results.length} rows returned)
            </h5>
            <span className="text-[10px] font-mono text-[#2EC4B6]">
              Execution Time: {executionResult.timeMs} ms
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 text-xs font-mono text-[#2EC4B6]">
            Strategy: <strong>{executionResult.optimizerStrategy}</strong>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#14110F] text-neutral-400">
                <tr>
                  {Object.keys(executionResult.results[0] || {}).map((col) => (
                    <th key={col} className="p-2.5 font-bold uppercase text-[10px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#0B0908]">
                {executionResult.results.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-2.5 text-neutral-300">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
