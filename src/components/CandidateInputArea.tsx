import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Play,
  RotateCcw,
  CornerDownLeft,
  ChevronRight,
} from 'lucide-react';

interface CandidateInputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isInitialTurn: boolean;
}

const PRESET_SENIOR_RESPONSES = [
  {
    label: 'RAG Hybrid & RRF',
    text: 'For million-token dynamic documents, I implement parent-child chunking (512 token child chunks with 15% overlap mapped to 2048 token parent contexts). For retrieval, I run a hybrid pipeline: dense embeddings using BGE-M3 indexed with HNSW (M=32, efConstruction=200) in ChromaDB/Milvus, combined with BM25 sparse search. Results are fused using Reciprocal Rank Fusion (k=60), followed by a cross-encoder reranker (e.g., bge-reranker-large) restricted to top-50 candidates to keep p95 latency under 250ms.',
  },
  {
    label: 'PyTorch FSDP & ZeRO-3',
    text: 'To resolve GPU OOM during 70B parameter fine-tuning on an 8x A100 (80GB) cluster, I configure PyTorch FSDP with Full Shard (ZeRO-3 equivalent) and activation checkpointing. Model states, gradients, and optimizer states are partitioned across the cluster. We enable CPU offloading for optimizer states if batch size requires it, and enforce mixed precision bf16 with NCCL bucket size tuning (e.g., 25MB) to prevent communication overhead from saturating NVLink bandwidth.',
  },
  {
    label: 'MLOps Drift & Canary',
    text: 'We monitor production embedding drift using Evidently AI computing Kolmogorov-Smirnov tests and Wasserstein distance against a rolling 7-day baseline stored in Databricks Feature Store. If drift exceeds threshold (>0.15), an automated Airflow/Kubeflow DAG triggers an incremental fine-tuning run. Models are deployed via Argo Rollouts using canary deployment with 5% traffic split, automated Prometheus latency/error budget checks, and instant automated rollback if 5xx spikes >0.5%.',
  },
  {
    label: 'vLLM PagedAttention & AWQ',
    text: 'To optimize throughput for high-concurrency LLM serving, we deploy vLLM with PagedAttention to eliminate memory fragmentation from dynamic sequence lengths. We apply AWQ 4-bit weight-only quantization to fit model weights in 40GB VRAM, preserving FP16 activation precision to minimize perplexity loss. We configure continuous batching with chunked prefill to balance TTFT (Time to First Token) and TPOT (Time Per Output Token).',
  },
];

export const CandidateInputArea: React.FC<CandidateInputAreaProps> = ({
  onSendMessage,
  isLoading,
  isInitialTurn,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handlePresetClick = (presetText: string) => {
    setInput(presetText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/90 backdrop-blur-md p-4">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Preset scenario answers for fast evaluation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            {isInitialTurn ? 'Quick Start:' : 'Test Scenarios:'}
          </span>

          {isInitialTurn ? (
            <button
              onClick={() => onSendMessage('START INTERVIEW')}
              disabled={isLoading}
              className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors font-mono text-xs flex items-center gap-1 shrink-0"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>START INTERVIEW</span>
            </button>
          ) : (
            PRESET_SENIOR_RESPONSES.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.text)}
                className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-colors text-[11px] shrink-0"
              >
                {preset.label}
              </button>
            ))
          )}
        </div>

        {/* Text Input Box */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-900/90 focus-within:border-emerald-500/80 transition-colors shadow-inner">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isInitialTurn
                ? 'Type "START INTERVIEW" or press the button above to begin...'
                : 'Explain your technical architecture, trade-offs, and failure handling...'
            }
            className="w-full bg-transparent text-slate-100 text-sm px-4 pt-3 pb-12 focus:outline-none resize-none leading-relaxed placeholder:text-slate-500"
          />

          {/* Controls Bar */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Mic / Audio Input */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isListening ? 'Stop microphone dictation' : 'Start speech dictation'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              {isListening && (
                <span className="text-[11px] text-rose-400 font-mono animate-pulse">
                  Listening...
                </span>
              )}
            </div>

            {/* Send Button & Shortcut Hint */}
            <div className="pointer-events-auto flex items-center gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
                Press Enter to send (Shift+Enter for newline)
              </span>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <span>Send</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
