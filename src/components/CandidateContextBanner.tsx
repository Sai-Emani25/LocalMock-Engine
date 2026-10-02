import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Cpu, Sparkles } from 'lucide-react';
import { InterviewConfig } from '../types';

interface CandidateContextBannerProps {
  config: InterviewConfig;
  onChangeTrack: (track: string) => void;
}

export const TRACK_OPTIONS = [
  'ML Infrastructure & RAG Architectures',
  'Distributed PyTorch & Multi-GPU Training',
  'MLOps Pipelines, Drift & CI/CD Serving',
  'Low-Latency Inference & Quantization (vLLM / Triton)',
  'Agentic Systems & LangGraph Workflows',
];

export const CandidateContextBanner: React.FC<CandidateContextBannerProps> = ({
  config,
  onChangeTrack,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-slate-800/80 bg-slate-900/40 text-xs px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Role:</span>
              <strong className="text-slate-100 font-semibold">{config.targetRole}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>

            {/* Quick Track Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 hidden sm:inline">Track:</span>
              <select
                value={config.track}
                onChange={(e) => onChangeTrack(e.target.value)}
                aria-label="Interview Focus Track"
                className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded px-2 py-1 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {TRACK_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden lg:inline">
              Preloaded Stack: <span className="text-slate-300">PyTorch · K8s · ChromaDB · Databricks · LangGraph</span>
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] underline underline-offset-2 transition-colors"
            >
              <span>{isExpanded ? 'Hide Profile Context' : 'View Candidate Dossier'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expanded Profile Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300 animate-fadeIn">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Core Specialization
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {config.candidateFocus}
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Active Technical Stack (Evaluator Scrutiny)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {config.stack.map((item) => (
                  <span
                    key={item}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
