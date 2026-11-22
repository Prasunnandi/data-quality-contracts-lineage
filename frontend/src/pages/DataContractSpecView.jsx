import React, { useState } from 'react';
import { FileCode, ShieldAlert, CheckCircle2, AlertOctagon, Play, HelpCircle, Terminal } from 'lucide-react';
import { validateSchemaChange } from '../services/api';

export default function DataContractSpecView() {
  const [testMode, setTestMode] = useState('compatible');
  const [validationResult, setValidationResult] = useState({
    isBreakingChange: false,
    verdict: 'APPROVED: Backward compatible schema evolution. Changes permitted to merge into production catalog.',
    gateAction: 'MERGE_PERMITTED'
  });
  const [testing, setTesting] = useState(false);

  const handleTestGate = async (mode) => {
    setTestMode(mode);
    setTesting(true);

    const changes = mode === 'breaking'
      ? [{ type: 'DROP_FIELD', field: 'currency' }]
      : [{ type: 'ADD_FIELD', field: 'risk_score', required: false }];

    const res = await validateSchemaChange(changes);
    if (res) {
      setValidationResult(res);
    } else {
      if (mode === 'breaking') {
        setValidationResult({
          isBreakingChange: true,
          verdict: 'BLOCKED: Breaking contract mutation detected. Dropping required column "currency" violates downstream SLA contracts.',
          gateAction: 'REJECT_PR'
        });
      } else {
        setValidationResult({
          isBreakingChange: false,
          verdict: 'APPROVED: Backward compatible schema evolution. Optional field additions permitted.',
          gateAction: 'MERGE_PERMITTED'
        });
      }
    }
    setTesting(false);
  };

  const contractJson = `{
  "contractVersion": "v1.2.0",
  "dataset": "financial.payments.transactions_bronze",
  "owner": "data-engineering@fintech-core.internal",
  "sla": {
    "freshnessMinutes": 15,
    "availabilityPct": 99.95
  },
  "schema": {
    "fields": [
      { "name": "transaction_id", "type": "string", "required": true, "unique": true },
      { "name": "timestamp", "type": "timestamp", "required": true },
      { "name": "amount", "type": "decimal(12,2)", "required": true, "min": 0.01 },
      { "name": "currency", "type": "string", "enum": ["USD", "EUR", "GBP", "CAD"], "required": true },
      { "name": "fraud_label", "type": "integer", "enum": [0, 1], "required": true }
    ]
  }
}`;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-emerald-400" />
          <span>Open Data Contract Specification & CI/CD Gatekeeper</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Data Contracts define formal producer-consumer agreements. Pull requests attempting backward-incompatible schema changes are blocked before deployment to production.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Code Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-semibold text-xs text-slate-200">contract_spec.json (Production v1.2.0)</span>
              <span className="text-[10px] text-emerald-400 font-mono">Status: ACTIVE</span>
            </div>
            <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto mt-3">
              {contractJson}
            </pre>
          </div>
        </div>

        {/* CI/CD Gatekeeper Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
            Automated CI/CD Contract Gatekeeper
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test how the CI/CD pipeline validates proposed schema pull requests against downstream SLA contracts:
          </p>

          <div className="flex space-x-3">
            <button
              onClick={() => handleTestGate('compatible')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                testMode === 'compatible'
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Test Compatible PR (Add Field)
            </button>
            <button
              onClick={() => handleTestGate('breaking')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                testMode === 'breaking'
                  ? 'bg-rose-600/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Test Breaking PR (Drop Field)
            </button>
          </div>

          <div className={`p-4 rounded-xl border mt-4 ${
            validationResult.isBreakingChange
              ? 'bg-rose-950/20 border-rose-800/50'
              : 'bg-emerald-950/20 border-emerald-800/50'
          }`}>
            <div className="flex items-start space-x-3">
              {validationResult.isBreakingChange ? (
                <AlertOctagon className="w-5 h-5 text-rose-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              )}
              <div>
                <div className={`font-bold text-sm ${validationResult.isBreakingChange ? 'text-rose-300' : 'text-emerald-300'}`}>
                  Gate Decision: {validationResult.gateAction}
                </div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {validationResult.verdict}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
