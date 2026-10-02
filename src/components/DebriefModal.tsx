import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Copy,
  Check,
  Download,
  Terminal,
} from 'lucide-react';
import { DebriefReport, DialogueTurn, InterviewConfig } from '../types';

interface DebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DebriefReport;
  config: InterviewConfig;
  history: DialogueTurn[];
}

export const DebriefModal: React.FC<DebriefModalProps> = ({
  isOpen,
  onClose,
  report,
  config,
  history,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const evaluatedTurns = history.filter((t) => t.role === 'candidate' && t.evaluation);

  const generateMarkdownReport = () => {
    return `# Senior ML / MLOps Candidate Debrief Report

**Role:** ${config.targetRole}
**Track:** ${config.track}
**Overall Recommendation:** ${report.overall_recommendation}
**Score:** ${report.overall_score_out_of_10.toFixed(1)} / 10.0
**Date:** ${new Date().toLocaleDateString()}

---

## Executive Summary
${report.executive_summary}

---

## Competency Breakdown (Radar)
- System Architecture: ${report.radar_scores.system_architecture} / 10
- Edge-Case Resilience: ${report.radar_scores.edge_case_resilience} / 10
- Latency & Optimization: ${report.radar_scores.latency_optimization} / 10
- Production MLOps: ${report.radar_scores.production_mlops} / 10
- Tooling & Frameworks: ${report.radar_scores.tooling_and_frameworks} / 10

---

## Key Demonstrated Strengths
${report.top_strengths.map((s) => `- ${s}`).join('\n')}

---

## Critical Growth Areas & Missing Trade-offs
${report.critical_growth_areas.map((g) => `- ${g}`).join('\n')}

---

## Recommended Study Topics
${report.recommended_study_topics.map((t) => `- ${t}`).join('\n')}

---

## Complete Interview Transcript (${evaluatedTurns.length} Candidate Turns)
${history
  .map((t, idx) => {
    if (t.role === 'interviewer') {
      return `### Question ${Math.floor(idx / 2) + 1} (Interviewer Agent)\n${t.content}\n`;
    } else {
      return `### Candidate Response\n${t.content}\n\n*Critique Score: ${
        t.evaluation?.score_out_of_10
      }/10 | Adjustment: ${t.evaluation?.difficulty_adjustment}*\n*Strengths: ${
        t.evaluation?.strengths
      }*\n*Gaps: ${t.evaluation?.gaps_or_hallucinations}*\n`;
    }
  })
  .join('\n---\n')}
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdownReport();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `localmock-debrief-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Senior ML Hiring Committee Debrief
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                {config.targetRole} · {config.track}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-slate-700/60"
              title="Copy Markdown Report"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-slate-700/60"
              title="Download Markdown Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export .md</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Verdict Scorecard */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Final Hiring Committee Recommendation
              </div>
              <div
                className={`inline-block text-sm font-mono font-bold px-3 py-1 rounded-md border ${
                  report.overall_recommendation === 'STRONG HIRE'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : report.overall_recommendation === 'HIRE'
                    ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                    : report.overall_recommendation === 'LEAN HIRE'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}
              >
                {report.overall_recommendation}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Aggregate Score
              </div>
              <div className="text-3xl font-mono font-bold text-slate-100">
                {report.overall_score_out_of_10.toFixed(1)}
                <span className="text-base font-normal text-slate-400 ml-1">/ 10.0</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Executive Evaluation Summary
            </h3>
            <p className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 leading-relaxed text-slate-200">
              {report.executive_summary}
            </p>
          </div>

          {/* Radar Metrics */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Competency Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(report.radar_scores).map(([metric, score]) => (
                <div
                  key={metric}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-slate-300 capitalize">
                      {metric.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-emerald-400">
                      {score.toFixed(1)} / 10.0
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.top_strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 shrink-0 font-bold">·</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Blind Spots</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.critical_growth_areas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 shrink-0 font-bold">·</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Study Roadmap */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Recommended Study Topics & Resources</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {report.recommended_study_topics.map((t, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-400 shrink-0 font-bold">·</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
