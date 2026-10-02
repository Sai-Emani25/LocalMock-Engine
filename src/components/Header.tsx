import React from 'react';
import { Terminal, Activity, Sliders, Volume2, VolumeX, RotateCcw, Award } from 'lucide-react';
import { DifficultyTier } from '../types';

interface HeaderProps {
  currentDifficulty: DifficultyTier;
  latestScore: number | null;
  turnCount: number;
  activeTab: 'telemetry' | 'config' | 'profile' | 'report';
  setActiveTab: (tab: 'telemetry' | 'config' | 'profile' | 'report') => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  onResetSession: () => void;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDifficulty,
  latestScore,
  turnCount,
  activeTab,
  setActiveTab,
  voiceEnabled,
  setVoiceEnabled,
  onResetSession,
  onGenerateReport,
  isGeneratingReport,
}) => {
  const getDifficultyColor = (diff: DifficultyTier) => {
    switch (diff) {
      case 'Staff/Principal':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'Senior':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'Mid':
        return 'text-sky-400 bg-sky-950/40 border-sky-800/60';
      default:
        return 'text-slate-400 bg-slate-800/40 border-slate-700/60';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Engine Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 tracking-tight text-base">
                LocalMock Engine
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Dual-Agent Technical Interviewer
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-mono text-[11px]">Interviewer + Critique Active</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 text-[11px]">Turns: <strong className="text-slate-200 font-mono">{turnCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Live Difficulty & Score Telemetry */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400">Difficulty Tier:</span>
            <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${getDifficultyColor(currentDifficulty)}`}>
              {currentDifficulty}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400">Critique Score:</span>
            <span className="text-xs font-mono font-bold text-slate-100">
              {latestScore !== null ? `${latestScore.toFixed(1)} / 10.0` : '-- / 10.0'}
            </span>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dual-Agent Telemetry & Critique Gauge"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Critique</span>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="AI Studio Configuration (Model, Temp, Output)"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Config</span>
            </button>
          </div>

          {/* Voice Audio Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg border transition-colors ${
              voiceEnabled
                ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
            }`}
            title={voiceEnabled ? 'Interviewer Voice TTS Enabled' : 'Interviewer Voice TTS Muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Report Trigger */}
          <button
            onClick={onGenerateReport}
            disabled={isGeneratingReport || turnCount === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Generate Senior ML Hiring Committee Report"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Debrief Report</span>
          </button>

          {/* Reset Session */}
          <button
            onClick={onResetSession}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            title="Restart Interview Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
