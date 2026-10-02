import React, { useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Terminal,
  Loader2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { DialogueTurn } from '../types';

interface DialogueStreamProps {
  history: DialogueTurn[];
  isLoading: boolean;
  onStartInterview: () => void;
  playingAudioTurnId: string | null;
  onPlayAudio: (turn: DialogueTurn) => void;
  voiceLoadingTurnId: string | null;
}

export const DialogueStream: React.FC<DialogueStreamProps> = ({
  history,
  isLoading,
  onStartInterview,
  playingAudioTurnId,
  onPlayAudio,
  voiceLoadingTurnId,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-xl shadow-emerald-500/5">
          <Terminal className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">
          LocalMock Engine
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Adaptive multi-agent mock interview cockpit for Senior ML Engineers, MLOps Specialists, and AI Infrastructure Architects.
        </p>

        {/* Dual Agent Architecture Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left mb-6">
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <Bot className="w-4 h-4" />
              <span>[INTERVIEWER AGENT]</span>
            </div>
            <p className="text-xs text-slate-400">
              Conducts technical dialogue, strictly asks 1 scenario-based question at a time, and drills deep into production edge cases and bottlenecks.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>[CRITIQUE AGENT]</span>
            </div>
            <p className="text-xs text-slate-400">
              Silently scores answers (1–10), pinpoints gaps & hallucinations, and dynamically increases or decreases questioning difficulty.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onStartInterview}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing Interviewer...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START INTERVIEW</span>
              </>
            )}
          </button>
          <span className="text-xs text-slate-400">
            Or type <code className="text-emerald-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">START INTERVIEW</code> in the prompt bar below.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {history.map((turn, index) => {
        const isInterviewer = turn.role === 'interviewer';
        const isPlaying = playingAudioTurnId === turn.id;
        const isVoiceLoading = voiceLoadingTurnId === turn.id;

        return (
          <div
            key={turn.id || index}
            className={`flex flex-col ${isInterviewer ? 'items-start' : 'items-end'} max-w-4xl mx-auto w-full`}
          >
            {/* Speaker Tag / Header */}
            <div className="flex items-center gap-2 mb-1.5 px-1 text-xs">
              {isInterviewer ? (
                <>
                  <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-emerald-400 font-medium text-[11px]">
                    INTERVIEWER AGENT
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    · Turn {Math.floor(index / 2) + 1}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-400 text-[10px]">Candidate Response ·</span>
                  <span className="font-mono text-sky-400 font-medium text-[11px]">
                    YOU (CANDIDATE)
                  </span>
                  <div className="w-5 h-5 rounded bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`rounded-xl p-4 transition-all w-full md:max-w-[90%] text-sm ${
                isInterviewer
                  ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                  : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 shadow-md'
              }`}
            >
              {isInterviewer ? (
                <div className="space-y-3">
                  {/* Feedback on previous answer */}
                  {turn.feedback && (
                    <div className="text-xs text-slate-400 border-l-2 border-emerald-500/80 pl-2.5 py-0.5 italic">
                      "{turn.feedback}"
                    </div>
                  )}

                  {/* Main technical question */}
                  <div className="font-medium text-slate-100 text-[15px] leading-relaxed">
                    {turn.content}
                  </div>

                  {/* Audio TTS Playback Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <button
                      onClick={() => onPlayAudio(turn)}
                      disabled={isVoiceLoading}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                        isPlaying
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isVoiceLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Generating Voice...</span>
                        </>
                      ) : isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current text-emerald-400" />
                          <span className="text-emerald-300">Playing Question</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen (Gemini TTS)</span>
                        </>
                      )}
                    </button>

                    <span className="font-mono text-[11px] text-slate-400">
                      Scenario-Based Probe
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {turn.content}
                  </div>

                  {/* Attached Critique Telemetry */}
                  {turn.evaluation && (
                    <div className="mt-3 pt-3 border-t border-slate-700/80 bg-slate-950/40 rounded-lg p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px]">
                            Critique Score:
                          </span>
                          <span
                            className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs ${
                              turn.evaluation.score_out_of_10 >= 8
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                                : turn.evaluation.score_out_of_10 >= 6
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                            }`}
                          >
                            {turn.evaluation.score_out_of_10.toFixed(1)} / 10.0
                          </span>
                        </div>

                        {/* Difficulty Shift Badge */}
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="text-slate-400">Difficulty:</span>
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              turn.evaluation.difficulty_adjustment === 'INCREASE'
                                ? 'text-amber-400'
                                : turn.evaluation.difficulty_adjustment === 'DECREASE'
                                ? 'text-sky-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {turn.evaluation.difficulty_adjustment === 'INCREASE' && (
                              <TrendingUp className="w-3 h-3 text-amber-400" />
                            )}
                            {turn.evaluation.difficulty_adjustment === 'DECREASE' && (
                              <TrendingDown className="w-3 h-3 text-sky-400" />
                            )}
                            {turn.evaluation.difficulty_adjustment === 'MAINTAIN' && (
                              <Minus className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{turn.evaluation.difficulty_adjustment}</span>
                          </span>
                        </div>
                      </div>

                      {/* Strengths */}
                      {turn.evaluation.strengths && (
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-emerald-300 font-medium">Strength:</strong>{' '}
                            {turn.evaluation.strengths}
                          </span>
                        </div>
                      )}

                      {/* Gaps or Hallucinations */}
                      {turn.evaluation.gaps_or_hallucinations && (
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-amber-300 font-medium">Identified Gap / Edge Case:</strong>{' '}
                            {turn.evaluation.gaps_or_hallucinations}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Turn State */}
      {isLoading && (
        <div className="flex items-start gap-3 max-w-4xl mx-auto w-full">
          <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mt-1">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-3 shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-200 font-medium">
                Critique Agent evaluating technical depth & edge cases...
              </span>
              <span className="block text-slate-400 text-[11px]">
                Calculating score out of 10 and dynamically tuning next question difficulty.
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
