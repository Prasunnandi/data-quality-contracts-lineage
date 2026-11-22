import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Table, ArrowUpRight } from 'lucide-react';

export default function DataQualityScorecardView({ summary, assertions }) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-800/40 p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Great Expectations Assertions & Automated Quality Gate</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Data Quality & Schema Assertion Scorecard
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Continuous validation of streaming financial transactions against strict semantic constraints. Pipeline health score is <span className="text-emerald-400 font-bold font-mono">99.4%</span> with zero critical schema breaches.
          </p>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Quality Health Score</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {summary?.overallHealthScore}%
          </div>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>140 of 142 checks passed</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Critical Breaches</div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
            0 Violations
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Zero non-nullable nulls</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Schema Warnings</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {summary?.failedWarnings} Warnings
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Non-breaking enum drift</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">CI/CD Gatekeeper</div>
          <div className="text-2xl font-bold text-emerald-300 font-mono mt-1">
            ALLOWED
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Automatic pull request pass</div>
        </div>
      </div>

      {/* Assertions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Table className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-xs text-slate-200">Active Expectation Suite Assertions</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Engine: Great Expectations v0.18</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-4">Assertion Rule</th>
                <th className="py-2.5 px-4">Column</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Evaluated Rows</th>
                <th className="py-2.5 px-4 text-right">Unexpected</th>
                <th className="py-2.5 px-4 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {assertions?.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-mono text-slate-200 max-w-md truncate">
                    <div>{a.rule}</div>
                    {a.note && <div className="text-[10px] text-amber-300 font-sans mt-0.5">{a.note}</div>}
                  </td>
                  <td className="py-2.5 px-4 text-cyan-300">{a.column}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">{a.evaluatedRows.toLocaleString()}</td>
                  <td className={`py-2.5 px-4 text-right font-bold ${
                    a.unexpectedCount > 0 ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {a.unexpectedCount} ({a.unexpectedPct}%)
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                      a.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                      a.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
