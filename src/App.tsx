import React, { useState, useRef } from 'react';
import {
  DifficultyTier,
  DialogueTurn,
  InterviewConfig,
  InternalEvaluation,
  DebriefReport,
} from './types';
import { Header } from './components/Header';
import { CandidateContextBanner, TRACK_OPTIONS } from './components/CandidateContextBanner';
import { DialogueStream } from './components/DialogueStream';
import { CritiqueTelemetryPanel } from './components/CritiqueTelemetryPanel';
import { CandidateInputArea } from './components/CandidateInputArea';
import { DebriefModal } from './components/DebriefModal';

const DEFAULT_CONFIG: InterviewConfig = {
  model: 'gemini-3.8-flash',
  temperature: 0.3,
  structuredOutput: true,
  track: TRACK_OPTIONS[0],
  targetRole: 'Senior Machine Learning / MLOps Engineer',
  candidateFocus:
    'Machine Learning Infrastructure, MLOps Pipelines, RAG Architectures, Agentic Workflows',
  stack: [
    'Python',
    'PyTorch',
    'Docker',
    'Kubernetes',
    'Vector DBs (ChromaDB)',
    'Ollama',
    'Databricks',
    'LangChain / LangGraph',
    'vLLM',
    'Triton Inference Server',
  ],
  voice: 'Fenrir',
  autoVoicePlayback: false,
};

export default function App() {
  const [history, setHistory] = useState<DialogueTurn[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyTier>('Senior');
  const [config, setConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'config' | 'profile' | 'report'>('telemetry');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latestEvaluation, setLatestEvaluation] = useState<InternalEvaluation | null>(null);
  const [rawJsonOutput, setRawJsonOutput] = useState<string | null>(null);
  const [debriefReport, setDebriefReport] = useState<DebriefReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isDebriefModalOpen, setIsDebriefModalOpen] = useState<boolean>(false);
  const [playingAudioTurnId, setPlayingAudioTurnId] = useState<string | null>(null);
  const [voiceLoadingTurnId, setVoiceLoadingTurnId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to adjust difficulty dynamically
  const adjustDifficulty = (adjustment: 'INCREASE' | 'DECREASE' | 'MAINTAIN') => {
    setCurrentDifficulty((prev) => {
      if (adjustment === 'INCREASE') {
        if (prev === 'Junior') return 'Mid';
        if (prev === 'Mid') return 'Senior';
        if (prev === 'Senior') return 'Staff/Principal';
        return 'Staff/Principal';
      } else if (adjustment === 'DECREASE') {
        if (prev === 'Staff/Principal') return 'Senior';
        if (prev === 'Senior') return 'Mid';
        if (prev === 'Mid') return 'Junior';
        return 'Junior';
      }
      return prev;
    });
  };

  // Play audio for a question turn
  const handlePlayAudio = async (turn: DialogueTurn) => {
    if (playingAudioTurnId === turn.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudioTurnId(null);
      return;
    }

    try {
      let audioSrc = turn.audioUrl;

      if (!audioSrc) {
        setVoiceLoadingTurnId(turn.id);
        const res = await fetch('/api/interview/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: turn.content,
            voice: config.voice,
          }),
        });

        const data = await res.json();
        setVoiceLoadingTurnId(null);

        if (!data.success || !data.audioBase64) {
          throw new Error(data.error || 'Failed to synthesize speech');
        }

        audioSrc = `data:audio/wav;base64,${data.audioBase64}`;

        // Cache in turn
        setHistory((prev) =>
          prev.map((t) => (t.id === turn.id ? { ...t, audioUrl: audioSrc } : t))
        );
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingAudioTurnId(null);
      };

      audio.onerror = () => {
        setPlayingAudioTurnId(null);
      };

      setPlayingAudioTurnId(turn.id);
      await audio.play();
    } catch (err: any) {
      console.warn('Audio playback error:', err);
      setVoiceLoadingTurnId(null);
      setPlayingAudioTurnId(null);
    }
  };

  // Main turn cycle: send message to dual-agent interviewer
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const isInitial =
      history.length === 0 ||
      text.trim().toUpperCase() === 'START INTERVIEW' ||
      text.trim().toUpperCase() === 'START';

    setIsLoading(true);

    const candidateTurn: DialogueTurn = {
      id: `turn-candidate-${Date.now()}`,
      role: 'candidate',
      content: text,
      timestamp: Date.now(),
    };

    // Optimistically update conversation history
    const updatedHistory = [...history, candidateTurn];
    setHistory(updatedHistory);

    try {
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history,
          candidateInput: text,
          currentDifficulty,
          track: config.track,
          model: config.model,
          temperature: config.temperature,
          candidateProfile: {
            targetRole: config.targetRole,
            focus: config.candidateFocus,
            stack: config.stack,
          },
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to process interview response');
      }

      const { internal_evaluation, interviewer_response } = result.data;

      // Update telemetry
      setLatestEvaluation(internal_evaluation);
      setRawJsonOutput(result.raw_json_output || JSON.stringify(result.data, null, 2));

      // Dynamic difficulty adjustment
      if (internal_evaluation?.difficulty_adjustment) {
        adjustDifficulty(internal_evaluation.difficulty_adjustment);
      }

      // Attach critique evaluation to candidate's turn
      const interviewerTurn: DialogueTurn = {
        id: `turn-interviewer-${Date.now()}`,
        role: 'interviewer',
        content: interviewer_response.next_question,
        feedback: interviewer_response.feedback,
        timestamp: Date.now(),
        rawJson: result.raw_json_output,
      };

      setHistory((prev) => {
        const next = [...prev];
        const lastCandidateIdx = next.findIndex((t) => t.id === candidateTurn.id);
        if (lastCandidateIdx !== -1) {
          next[lastCandidateIdx] = {
            ...next[lastCandidateIdx],
            evaluation: internal_evaluation,
          };
        }
        return [...next, interviewerTurn];
      });

      // Auto-voice playback if enabled
      if (voiceEnabled && config.autoVoicePlayback) {
        handlePlayAudio(interviewerTurn);
      }
    } catch (err: any) {
      console.error('Error during interview turn:', err);
      // Append an error turn
      setHistory((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'interviewer',
          content:
            'A telemetry communication glitch occurred with the Critique Agent. Please try submitting your answer again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Debrief Report
  const handleGenerateReport = async () => {
    if (history.length === 0) return;
    setIsGeneratingReport(true);
    setActiveTab('report');

    try {
      const res = await fetch('/api/interview/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          track: config.track,
          candidateProfile: {
            targetRole: config.targetRole,
            focus: config.candidateFocus,
            stack: config.stack,
          },
        }),
      });

      const data = await res.json();
      if (!data.success || !data.report) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setDebriefReport(data.report);
      setIsDebriefModalOpen(true);
    } catch (err: any) {
      console.error('Debrief report error:', err);
      alert('Failed to generate report: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Reset interview session
  const handleResetSession = () => {
    if (history.length > 0 && !confirm('Restart this mock interview session? All turns will be cleared.')) {
      return;
    }
    setHistory([]);
    setCurrentDifficulty('Senior');
    setLatestEvaluation(null);
    setRawJsonOutput(null);
    setDebriefReport(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingAudioTurnId(null);
  };

  const latestScore = latestEvaluation ? latestEvaluation.score_out_of_10 : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Application Header */}
      <Header
        currentDifficulty={currentDifficulty}
        latestScore={latestScore}
        turnCount={Math.floor(history.filter((t) => t.role === 'candidate').length)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onResetSession={handleResetSession}
        onGenerateReport={handleGenerateReport}
        isGeneratingReport={isGeneratingReport}
      />

      {/* Candidate Dossier Context Preload Banner */}
      <CandidateContextBanner
        config={config}
        onChangeTrack={(track) => setConfig((prev) => ({ ...prev, track }))}
      />

      {/* Main Workspace (Dialogue Stream + Telemetry Panel) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Area: Dialogue Stream & Input Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <DialogueStream
            history={history}
            isLoading={isLoading}
            onStartInterview={() => handleSendMessage('START INTERVIEW')}
            playingAudioTurnId={playingAudioTurnId}
            onPlayAudio={handlePlayAudio}
            voiceLoadingTurnId={voiceLoadingTurnId}
          />

          <CandidateInputArea
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isInitialTurn={history.length === 0}
          />
        </main>

        {/* Right Area: Dual-Agent Telemetry & AI Studio Settings Hub */}
        <CritiqueTelemetryPanel
          history={history}
          config={config}
          onChangeConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentDifficulty={currentDifficulty}
          latestEvaluation={latestEvaluation}
          debriefReport={debriefReport}
          onGenerateReport={handleGenerateReport}
          isGeneratingReport={isGeneratingReport}
          rawJsonOutput={rawJsonOutput}
        />
      </div>

      {/* Debrief Report Modal */}
      {debriefReport && (
        <DebriefModal
          isOpen={isDebriefModalOpen}
          onClose={() => setIsDebriefModalOpen(false)}
          report={debriefReport}
          config={config}
          history={history}
        />
      )}
    </div>
  );
}
