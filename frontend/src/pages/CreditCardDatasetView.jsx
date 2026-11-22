import React from 'react';
import { Database, Table, ExternalLink } from 'lucide-react';

export default function CreditCardDatasetView() {
  const sampleTx = [
    { time: '0s', v1: '-1.3598', v2: '-0.0728', v3: '2.5363', v4: '1.3782', amount: '$149.62', classLabel: '0 (Legitimate)' },
    { time: '0s', v1: '1.1918', v2: '0.2662', v3: '0.1665', v4: '0.4482', amount: '$2.69', classLabel: '0 (Legitimate)' },
    { time: '1s', v1: '-1.3584', v2: '-1.3402', v3: '1.7732', v4: '0.3798', amount: '$378.66', classLabel: '0 (Legitimate)' },
    { time: '1s', v1: '-0.9663', v2: '-0.1852', v3: '1.7930', v4: '-0.8633', amount: '$123.50', classLabel: '0 (Legitimate)' },
    { time: '2s', v1: '-1.1582', v2: '0.8777', v3: '1.5487', v4: '0.4030', amount: '$69.99', classLabel: '0 (Legitimate)' },
    { time: '2s', v1: '-0.4260', v2: '0.9605', v3: '1.1411', v4: '-0.1683', amount: '$3.67', classLabel: '0 (Legitimate)' },
    { time: '4s', v1: '1.2297', v2: '0.1410', v3: '0.0454', v4: '1.2026', amount: '$4.99', classLabel: '0 (Legitimate)' },
    { time: '7s', v1: '-0.6443', v2: '0.2881', v3: '1.0744', v4: '-0.5784', amount: '$40.80', classLabel: '0 (Legitimate)' },
    { time: '9s', v1: '-0.3383', v2: '1.1196', v3: '1.0444', v4: '-0.2222', amount: '$3.99', classLabel: '0 (Legitimate)' },
    { time: '10s', v1: '1.4490', v2: '-1.1763', v3: '0.9139', v4: '-1.3757', amount: '$7.80', classLabel: '0 (Legitimate)' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Kaggle Credit Card Fraud Detection Benchmark</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Kaggle Financial Transactions Dataset</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real European cardholder transactions transformed via PCA features ($V1$ through $V28$), authorized amounts, and binary fraud classification labels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Total Validated Transactions</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">949</div>
          <div className="text-[11px] text-slate-500 mt-1">In data/ directory</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Feature Dimensions</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">31 Columns</div>
          <div className="text-[11px] text-slate-500 mt-1">Time, V1-V28, Amount, Class</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Contract Schema Match</div>
          <div className="text-2xl font-bold text-cyan-300 font-mono mt-1">100%</div>
          <div className="text-[11px] text-slate-500 mt-1">Validated against v1.2.0 spec</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">File Footprint</div>
          <div className="text-2xl font-bold text-violet-300 font-mono mt-1">338 KB</div>
          <div className="text-[11px] text-slate-500 mt-1">CSV (UTF-8) raw data</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Table className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-xs text-slate-200">Sample Records (First 10 of 949)</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">kaggle_creditcard_transactions.csv</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">V1</th>
                <th className="py-2.5 px-4">V2</th>
                <th className="py-2.5 px-4">V3</th>
                <th className="py-2.5 px-4">V4</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4 text-center">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {sampleTx.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 text-slate-400">{t.time}</td>
                  <td className="py-2 px-4 text-slate-300">{t.v1}</td>
                  <td className="py-2 px-4 text-slate-300">{t.v2}</td>
                  <td className="py-2 px-4 text-slate-300">{t.v3}</td>
                  <td className="py-2 px-4 text-slate-300">{t.v4}</td>
                  <td className="py-2 px-4 text-right font-bold text-slate-100">{t.amount}</td>
                  <td className="py-2 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                      {t.classLabel}
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
