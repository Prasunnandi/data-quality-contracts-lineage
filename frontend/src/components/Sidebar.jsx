import React from 'react';
import { ShieldCheck, FileCode, GitFork, Database, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const items = [
    { id: 'quality', label: 'Great Expectations Assertions', icon: ShieldCheck, badge: '99.4% Pass' },
    { id: 'contract', label: 'Data Contract Spec & Gate', icon: FileCode, badge: 'v1.2.0' },
    { id: 'lineage', label: 'OpenLineage Column DAG', icon: GitFork, badge: '7 Nodes' },
    { id: 'dataset', label: 'Kaggle Fraud Transactions', icon: Database, badge: '1,000 Rows' }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg shadow-lg shadow-emerald-500/20 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-wide">DataTrust Hub</h1>
            <p className="text-xs text-emerald-400 font-mono">Contracts & Lineage</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Governance & Quality
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 m-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>CI/CD Gate: PROMOTION ALLOWED</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Zero breaking schema changes detected. Downstream consumers protected across all 7 pipeline hops.
        </p>
      </div>
    </aside>
  );
}
