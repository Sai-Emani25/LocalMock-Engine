import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  Cpu,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Volume2,
} from 'lucide-react';
import {
  DialogueTurn,
  DifficultyTier,
  InterviewConfig,
  InternalEvaluation,
  DebriefReport,
} from '../types';

interface CritiqueTelemetryPanelProps {
  history: DialogueTurn[];
  config: InterviewConfig;
  onChangeConfig: (newConfig: Partial<InterviewConfig>) => void;
  activeTab: 'telemetry' | 'config' | 'profile' | 'report';
  setActiveTab: (tab: 'telemetry' | 'config' | 'profile' | 'report') => void;
  currentDifficulty: DifficultyTier;
  latestEvaluation: InternalEvaluation | null;
  debriefReport: DebriefReport | null;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
  rawJsonOutput: string | null;
}

export const CritiqueTelemetryPanel: React.FC<CritiqueTelemetryPanelProps> = ({
  history,
  config,
  onChangeConfig,
  activeTab,
  setActiveTab,
  currentDifficulty,
  latestEvaluation,
  debriefReport,
  onGenerateReport,
  isGeneratingReport,
  rawJsonOutput,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [newStackTag, setNewStackTag] = useState('');

  const difficultyTiers: DifficultyTier[] = ['Junior', 'Mid', 'Senior', 'Staff/Principal'];

  // Calculate average score across all candidate turns
  const evaluatedTurns = history.filter((t) => t.role === 'candidate' && t.evaluation);
  const avgScore =
    evaluatedTurns.length > 0
      ? evaluatedTurns.reduce((acc, t) => acc + (t.evaluation?.score_out_of_10 || 0), 0) /
        evaluatedTurns.length
      : null;

  const handleCopyJson = () => {
    if (!rawJsonOutput) return;
    navigator.clipboard.writeText(rawJsonOutput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleAddStackItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackTag.trim()) return;
    if (!config.stack.includes(newStackTag.trim())) {
      onChangeConfig({ stack: [...config.stack, newStackTag.trim()] });
    }
    setNewStackTag('');
  };

  const handleRemoveStackItem = (itemToRemove: string) => {
    onChangeConfig({ stack: config.stack.filter((s) => s !== itemToRemove) });
  };

  return (
    <aside className="w-full lg:w-96 border-l border-slate-800 bg-slate-950/80 flex flex-col h-full overflow-hidden">
      {/* Panel Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 p-2 bg-slate-900/60">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'telemetry'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'config'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>AI Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'report'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Debrief</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: TELEMETRY & CRITIQUE GAUGE */}
        {activeTab === 'telemetry' && (
          <div className="space-y-5">
            {/* Real-Time Score Dial */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 uppercase tracking-wider">
                  Critique Evaluation Score
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Scale: 1.0 – 10.0
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-mono font-bold text-slate-100 tracking-tight">
                    {latestEvaluation
                      ? latestEvaluation.score_out_of_10.toFixed(1)
                      : avgScore
                      ? avgScore.toFixed(1)
                      : '--'}
                    <span className="text-sm font-normal text-slate-400 ml-1">/ 10.0</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {latestEvaluation?.score_out_of_10 !== undefined ? (
                      latestEvaluation.score_out_of_10 >= 8.5 ? (
                        <span className="text-emerald-400 font-medium">Strong Senior Distinction</span>
                      ) : latestEvaluation.score_out_of_10 >= 7.0 ? (
                        <span className="text-emerald-300 font-medium">Solid Technical Competence</span>
                      ) : latestEvaluation.score_out_of_10 >= 5.0 ? (
                        <span className="text-amber-400 font-medium">Moderate Gaps / Edge Cases Missed</span>
                      ) : (
                        <span className="text-rose-400 font-medium">Significant Architecture Deficiencies</span>
                      )
                    ) : (
                      'Awaiting candidate answer...'
                    )}
                  </div>
                </div>

                {/* Score Progress Gauge Bar */}
                <div className="w-24 text-right">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">
                    Avg: {avgScore ? avgScore.toFixed(1) : '--'}
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (latestEvaluation?.score_out_of_10 || 0) >= 8
                          ? 'bg-emerald-400'
                          : (latestEvaluation?.score_out_of_10 || 0) >= 6
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          ((latestEvaluation?.score_out_of_10 || avgScore || 0) / 10) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Difficulty Level Tracker */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 uppercase tracking-wider">
                  Adaptive Difficulty
                </span>
                {latestEvaluation?.difficulty_adjustment && (
                  <span
                    className={`flex items-center gap-1 font-mono text-[11px] font-semibold ${
                      latestEvaluation.difficulty_adjustment === 'INCREASE'
                        ? 'text-amber-400'
                        : latestEvaluation.difficulty_adjustment === 'DECREASE'
                        ? 'text-sky-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {latestEvaluation.difficulty_adjustment === 'INCREASE' && (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {latestEvaluation.difficulty_adjustment === 'DECREASE' && (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {latestEvaluation.difficulty_adjustment === 'MAINTAIN' && (
                      <Minus className="w-3 h-3" />
                    )}
                    <span>{latestEvaluation.difficulty_adjustment}</span>
                  </span>
                )}
              </div>

              {/* Tiers visualization */}
              <div className="grid grid-cols-4 gap-1.5">
                {difficultyTiers.map((tier) => {
                  const isCurrent = currentDifficulty === tier;
                  return (
                    <div
                      key={tier}
                      className={`py-2 px-1 text-center rounded border transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 font-bold shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 text-[11px]'
                      }`}
                    >
                      <div className="text-[11px] truncate">{tier}</div>
                      {isCurrent && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                The Critique Agent increases scenario complexity when you handle edge cases and reduces it if you show architectural confusion.
              </p>
            </div>

            {/* Latest Strengths & Gaps Analysis */}
            {latestEvaluation && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Latest Critique Insights
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-emerald-400 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Demonstrated Strengths</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 bg-slate-950/40 p-2 rounded border border-slate-800/80">
                      {latestEvaluation.strengths}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-amber-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Identified Gaps & Blind Spots</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 bg-slate-950/40 p-2 rounded border border-slate-800/80">
                      {latestEvaluation.gaps_or_hallucinations}
                    </p>
                  </div>

                  {latestEvaluation.edge_cases_probed && (
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-sky-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Edge Case Under Scrutiny</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-5 bg-slate-950/40 p-2 rounded border border-slate-800/80">
                        {latestEvaluation.edge_cases_probed}
                      </p>
                    </div>
                  )}

                  {latestEvaluation.topic_tags && latestEvaluation.topic_tags.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[11px] text-slate-400 mb-1.5">Topic Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {latestEvaluation.topic_tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Turn History Progression */}
            {evaluatedTurns.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Score Trajectory ({evaluatedTurns.length} Turns)
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {evaluatedTurns.map((turn, i) => (
                    <div
                      key={turn.id || i}
                      className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800/80"
                    >
                      <span className="text-slate-400 font-mono">Turn {i + 1}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-medium ${
                            (turn.evaluation?.score_out_of_10 || 0) >= 8
                              ? 'text-emerald-400'
                              : (turn.evaluation?.score_out_of_10 || 0) >= 6
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {turn.evaluation?.score_out_of_10.toFixed(1)}/10
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 px-1 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {turn.evaluation?.difficulty_adjustment}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI STUDIO CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Google AI Studio Parameters</span>
              </div>

              {/* Model Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Model Selection
                </label>
                <select
                  value={config.model}
                  onChange={(e) => onChangeConfig({ model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended, Ultra-Fast)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning & STEM)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Uses Gemini 3 series models with strict JSON schema validation.
                </p>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-300">Temperature</label>
                  <span className="font-mono font-bold text-sky-400">
                    {config.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => onChangeConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.0 (Strict Analytical)</span>
                  <span className="text-emerald-400 font-medium">0.2 – 0.4 Recommended</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Interview Voice Selection */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gemini TTS Voice</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoVoicePlayback}
                      onChange={(e) => onChangeConfig({ autoVoicePlayback: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                    <span>Auto-speak questions</span>
                  </label>
                </div>
                <select
                  value={config.voice}
                  onChange={(e) => onChangeConfig({ voice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="Fenrir">Fenrir (Authoritative & Deep)</option>
                  <option value="Kore">Kore (Clear & Professional)</option>
                  <option value="Puck">Puck (Fast & Engaging)</option>
                  <option value="Zephyr">Zephyr (Calm & Technical)</option>
                  <option value="Charon">Charon (Measured & Deliberate)</option>
                </select>
              </div>

              {/* Structured Output Mode */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Structured Output (JSON Schema)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                    ENFORCED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Guarantees clean output formatting with internal critique evaluation and candidate next question.
                </p>
              </div>
            </div>

            {/* Raw JSON Schema Output Inspector */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-sky-400" />
                  <span>JSON Output Inspector</span>
                </span>
                <button
                  onClick={handleCopyJson}
                  disabled={!rawJsonOutput}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 disabled:opacity-30"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Schema</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto border border-slate-800/80 whitespace-pre-wrap">
                {rawJsonOutput || '// No response generated yet.\n// Type "START INTERVIEW" to inspect the JSON schema output.'}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: CANDIDATE PROFILE & STACK */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Candidate Dossier Preload</span>
              </div>

              {/* Target Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Target Role
                </label>
                <input
                  type="text"
                  value={config.targetRole}
                  onChange={(e) => onChangeConfig({ targetRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Specialization Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Core Specialization
                </label>
                <textarea
                  rows={3}
                  value={config.candidateFocus}
                  onChange={(e) => onChangeConfig({ candidateFocus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stack items */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-medium text-slate-300">
                  Evaluated Tech Stack
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {config.stack.map((item) => (
                    <span
                      key={item}
                      className="text-[11px] px-2 py-1 rounded bg-slate-950 text-slate-200 border border-slate-800 font-mono flex items-center gap-1.5"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemoveStackItem(item)}
                        className="text-slate-500 hover:text-rose-400 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new tag */}
                <form onSubmit={handleAddStackItem} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add tool/framework (e.g. Triton, vLLM)"
                    value={newStackTag}
                    onChange={(e) => setNewStackTag(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HIRING COMMITTEE DEBRIEF REPORT */}
        {activeTab === 'report' && (
          <div className="space-y-5">
            {!debriefReport ? (
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Hiring Committee Report
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Synthesize all interviewer questions, critique scores, edge-case evaluations, and difficulty transitions into an executive hiring verdict.
                </p>
                <button
                  onClick={onGenerateReport}
                  disabled={isGeneratingReport || evaluatedTurns.length === 0}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGeneratingReport ? 'Compiling Hiring Dossier...' : 'Generate Hiring Committee Report'}
                </button>
                {evaluatedTurns.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    Complete at least one candidate answer turn to generate a debrief report.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Executive Recommendation Banner */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Verdict
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        debriefReport.overall_recommendation === 'STRONG HIRE'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : debriefReport.overall_recommendation === 'HIRE'
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-400'
                          : debriefReport.overall_recommendation === 'LEAN HIRE'
                          ? 'bg-amber-950 border-amber-500 text-amber-300'
                          : 'bg-rose-950 border-rose-500 text-rose-300'
                      }`}
                    >
                      {debriefReport.overall_recommendation}
                    </span>
                  </div>

                  <div className="text-2xl font-mono font-bold text-slate-100">
                    {debriefReport.overall_score_out_of_10.toFixed(1)}{' '}
                    <span className="text-sm font-normal text-slate-400">/ 10.0</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800">
                    {debriefReport.executive_summary}
                  </p>
                </div>

                {/* Radar Breakdown */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Core Competency Breakdown
                  </div>
                  <div className="space-y-2 text-xs">
                    {Object.entries(debriefReport.radar_scores).map(([metric, score]) => (
                      <div key={metric} className="space-y-1">
                        <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                          <span className="capitalize">{metric.replace(/_/g, ' ')}</span>
                          <span className="font-bold">{score.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all"
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Strengths */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Key Hiring Strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {debriefReport.top_strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0">·</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Growth Areas */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Critical Growth Areas</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {debriefReport.critical_growth_areas.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 shrink-0">·</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Study Roadmap */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Recommended Study Topics</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {debriefReport.recommended_study_topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-sky-400 shrink-0">·</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
