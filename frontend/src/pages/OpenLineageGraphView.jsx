import React, { useState } from 'react';
import { GitFork, Database, Layers, Cpu, Server, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OpenLineageGraphView({ lineage }) {
  const [selectedNode, setSelectedNode] = useState(lineage?.nodes?.[3] || null); // dbt_silver default

  const getNodeColor = (type) => {
    switch (type) {
      case 'SOURCE':
        return 'border-blue-500/40 bg-blue-950/20 text-blue-300';
      case 'STREAM':
        return 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300';
      case 'STORAGE':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
      case 'TRANSFORM':
        return 'border-violet-500/40 bg-violet-950/20 text-violet-300';
      case 'FEATURE_STORE':
        return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
      default:
        return 'border-slate-700 bg-slate-900 text-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <GitFork className="w-5 h-5 text-emerald-400" />
          <span>OpenLineage Pipeline DAG & Column-Level Dependency Graph</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Standardized OpenLineage metadata emitted at every pipeline stage. Select any dataset or transformation node to inspect upstream origin feeds and downstream consumers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Pipeline Nodes */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
            Pipeline Lineage Topology (OpenLineage Spec)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lineage?.nodes?.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${getNodeColor(node.type)} ${
                    isSelected ? 'ring-2 ring-emerald-400 shadow-md' : 'hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wide opacity-80">{node.type}</span>
                    <span className="text-[10px] font-mono text-slate-400">{node.tech}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-100 mt-1">{node.label}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">id: {node.id}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Deep Dive */}
        {selectedNode && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">{selectedNode.type} NODE</span>
                <h3 className="font-bold text-slate-100 text-base mt-0.5">{selectedNode.label}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">Powered by {selectedNode.tech}</div>
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Upstream Dependencies:</span>
                  <div className="space-y-1 mt-1">
                    {lineage?.edges?.filter(e => e.to === selectedNode.id).map((e, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                        <span>{e.from}</span>
                        <span className="text-slate-500 text-[10px]">{e.label}</span>
                      </div>
                    ))}
                    {lineage?.edges?.filter(e => e.to === selectedNode.id).length === 0 && (
                      <span className="text-slate-500 text-xs">Root Source (No Upstream)</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Downstream Consumers:</span>
                  <div className="space-y-1 mt-1">
                    {lineage?.edges?.filter(e => e.from === selectedNode.id).map((e, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 flex items-center justify-between">
                        <span>{e.to}</span>
                        <span className="text-slate-500 text-[10px]">{e.label}</span>
                      </div>
                    ))}
                    {lineage?.edges?.filter(e => e.from === selectedNode.id).length === 0 && (
                      <span className="text-slate-500 text-xs">Terminal Consumer Node</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              Lineage Event: <span className="font-mono text-slate-200">START / COMPLETE</span> emitted via OpenLineage HTTP backend on job run.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
