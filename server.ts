import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini SDK client with mandatory telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient generation helper with fallback models in case of transient 503 spikes
async function generateContentWithFallback(params: {
  model: string;
  contents: any;
  config: any;
}) {
  const candidateModels = [
    params.model || 'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  const uniqueModels = Array.from(new Set(candidateModels));

  let lastErr: any = null;
  for (const m of uniqueModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastErr = err;
        console.warn(`Generate with ${m} (attempt ${attempt + 1}) encountered: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw lastErr;
}

interface DialogueTurn {
  role: 'candidate' | 'interviewer';
  content: string;
  evaluation?: {
    score_out_of_10: number;
    strengths: string;
    gaps_or_hallucinations: string;
    difficulty_adjustment: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
    topic_tags?: string[];
    edge_cases_probed?: string;
  };
}

interface CandidateProfile {
  name: string;
  targetRole: string;
  experience: string;
  focus: string;
  stack: string[];
}

const DEFAULT_PROFILE: CandidateProfile = {
  name: "Candidate",
  targetRole: "Senior Machine Learning / MLOps Engineer",
  experience: "5+ Years Production ML",
  focus: "ML Infrastructure, MLOps Pipelines, RAG Architectures, Agentic Workflows",
  stack: [
    "Python",
    "PyTorch",
    "Docker",
    "Kubernetes",
    "Vector DBs (ChromaDB, Milvus, Qdrant)",
    "Ollama",
    "Databricks",
    "LangChain / LangGraph",
    "Triton / vLLM",
    "MLflow / Kubeflow"
  ]
};

// API: Process candidate turn & generate next question with critique
app.post('/api/interview/chat', async (req: Request, res: Response) => {
  try {
    const {
      history = [],
      candidateInput = '',
      currentDifficulty = 'Senior',
      track = 'ML Infrastructure & RAG Systems',
      model = 'gemini-3.8-flash',
      temperature = 0.3,
      candidateProfile = DEFAULT_PROFILE,
    } = req.body;

    const isInitialTurn =
      history.length === 0 ||
      candidateInput.trim().toUpperCase() === 'START INTERVIEW' ||
      candidateInput.trim().toUpperCase() === 'START';

    // Construct the dual-agent system prompt
    const systemInstruction = `
You are "LocalMock Engine", an adaptive, multi-agent AI system conducting high-stakes technical mock interviews for Senior Machine Learning Engineers, MLOps Specialists, and AI Engineers.

=== ARCHITECTURE & DUAL PERSISTENCE MODE ===
You operate simultaneously as two internal sub-agents:
1. [INTERVIEWER AGENT]:
   - Conducts dialogue, asks sharp scenario-based technical questions.
   - Pushes deep into production edge cases (e.g., RAG optimization, vector indexing algorithms, MLOps pipelines, distributed training, latency vs. accuracy trade-offs, GPU memory limits, network I/O bottlenecks).
   - Tone: Professional, technical, rigorous, and supportive.
   - MANDATORY RULE: ONE question at a time. Never ask multiple questions in a single output turn.
   - MANDATORY RULE: Avoid elementary definition queries (e.g. NEVER ask "What is RAG?" or "What is Docker?"). Ask operational design scenarios (e.g. "How would you optimize chunking strategies, hybrid BM25 + dense search with Reciprocal Rank Fusion, and cross-encoder re-ranking when serving million-token dynamic legal documents under 250ms p95 latency?").

2. [CRITIQUE AGENT]:
   - Evaluates candidate answers silently with unsparing technical accuracy.
   - Assigns a strict numerical score (1.0 to 10.0) based on depth, correctness, production viability, and awareness of trade-offs.
   - Identifies specific technical strengths.
   - Identifies gaps, omissions, potential hallucinations, naive assumptions, or missing failure mode considerations.
   - Decides the difficulty adjustment:
     * "INCREASE": If the candidate answered with high nuance, solid architecture, and edge-case mastery.
     * "DECREASE": If the candidate struggled, had fundamental misconceptions, or missed critical failure points.
     * "MAINTAIN": If the candidate gave a solid standard answer but needs one more drill at the current level.
   - Probes edge cases: If surface-level answer, drill deeper into data drift, OOM errors, cold starts, concurrency, failover, or quantization degradation.

=== CANDIDATE PRELOAD CONTEXT ===
- Target Role: ${candidateProfile.targetRole || 'Senior ML/MLOps Engineer'}
- Focus Areas: ${candidateProfile.focus || 'Machine Learning Infrastructure, MLOps, RAG Architectures, Agentic Workflows'}
- Stack Expertise: ${(candidateProfile.stack || []).join(', ')}
- Interview Track: ${track}
- Current Difficulty Tier: ${currentDifficulty}
`;

    if (isInitialTurn) {
      // First question generation
      const openingPrompt = `
The candidate has initiated the technical interview by typing "${candidateInput || 'START INTERVIEW'}".
Current track: "${track}".
Current difficulty: "${currentDifficulty}".

As the [INTERVIEWER AGENT], formulate the first realistic, senior-level production scenario question to kick off the interview.
As the [CRITIQUE AGENT], provide a neutral/initial evaluation baseline (score: 10.0, strengths: "Interview initiated with prompt '${candidateInput || 'START INTERVIEW'}'. Candidate ready for evaluation.", gaps_or_hallucinations: "None yet - opening question.", difficulty_adjustment: "MAINTAIN").
`;

      const response = await generateContentWithFallback({
        model: model || 'gemini-3.8-flash',
        contents: openingPrompt,
        config: {
          systemInstruction,
          temperature: typeof temperature === 'number' ? temperature : 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              internal_evaluation: {
                type: Type.OBJECT,
                properties: {
                  score_out_of_10: { type: Type.NUMBER },
                  strengths: { type: Type.STRING },
                  gaps_or_hallucinations: { type: Type.STRING },
                  difficulty_adjustment: { type: Type.STRING },
                  topic_tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  edge_cases_probed: { type: Type.STRING },
                },
                required: [
                  'score_out_of_10',
                  'strengths',
                  'gaps_or_hallucinations',
                  'difficulty_adjustment',
                ],
              },
              interviewer_response: {
                type: Type.OBJECT,
                properties: {
                  feedback: { type: Type.STRING },
                  next_question: { type: Type.STRING },
                },
                required: ['feedback', 'next_question'],
              },
            },
            required: ['internal_evaluation', 'interviewer_response'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        data: parsed,
        raw_json_output: response.text,
      });
    }

    // Continuing dialogue
    // Format conversation history for context
    const formattedHistory = history
      .map((turn: DialogueTurn, idx: number) => {
        if (turn.role === 'interviewer') {
          return `[Turn ${idx + 1} - Interviewer Question]: ${turn.content}`;
        } else {
          const evalSummary = turn.evaluation
            ? `(Previous Critique Score: ${turn.evaluation.score_out_of_10}/10, Difficulty Adj: ${turn.evaluation.difficulty_adjustment})`
            : '';
          return `[Turn ${idx + 1} - Candidate Answer]: ${turn.content} ${evalSummary}`;
        }
      })
      .join('\n\n');

    const prompt = `
${formattedHistory}

[Current Turn Candidate Response]:
"${candidateInput}"

Execute the dual-agent evaluation:
1. [CRITIQUE AGENT]:
   - Evaluate the candidate's latest response against senior ML engineering criteria.
   - Compute score_out_of_10 (1.0 to 10.0). Be realistic and analytical.
   - List key technical strengths (specific concepts, tools, or architectures they nailed).
   - List gaps or subtle hallucinations (what failure modes, trade-offs, hardware bottlenecks did they miss?).
   - Set difficulty_adjustment to "INCREASE", "DECREASE", or "MAINTAIN".
   - Extract 1-3 specific topic_tags (e.g. ["HNSW Indexing", "Quantization", "Gradient Accumulation"]).
   - State the edge_cases_probed next.

2. [INTERVIEWER AGENT]:
   - feedback: 1-2 concise, professional sentences acknowledging the technical nuance of their answer.
   - next_question: Exactly ONE sharp, scenario-driven follow-up question. If they answered well, increase depth or explore an edge case (e.g. sudden latency spikes, memory OOM, out-of-vocabulary data drift, network partitioning).
`;

    const response = await generateContentWithFallback({
      model: model || 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            internal_evaluation: {
              type: Type.OBJECT,
              properties: {
                score_out_of_10: { type: Type.NUMBER },
                strengths: { type: Type.STRING },
                gaps_or_hallucinations: { type: Type.STRING },
                difficulty_adjustment: { type: Type.STRING },
                topic_tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                edge_cases_probed: { type: Type.STRING },
              },
              required: [
                'score_out_of_10',
                'strengths',
                'gaps_or_hallucinations',
                'difficulty_adjustment',
              ],
            },
            interviewer_response: {
              type: Type.OBJECT,
              properties: {
                feedback: { type: Type.STRING },
                next_question: { type: Type.STRING },
              },
              required: ['feedback', 'next_question'],
            },
          },
          required: ['internal_evaluation', 'interviewer_response'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: parsed,
      raw_json_output: response.text,
    });
  } catch (err: any) {
    console.error('Error in /api/interview/chat:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process interview turn.',
    });
  }
});

// API: Audio Text-to-Speech for interviewer voice
app.post('/api/interview/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Fenrir' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500), // Limit for rapid conversational turnaround
              speechMetadata: {
                style: 'Professional, calm, analytical technical interviewer',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Fenrir' },
          },
        },
      },
    });

    const base64Audio =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio data received' });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (err: any) {
    console.warn('TTS error (non-fatal):', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'TTS generation unavailable',
    });
  }
});

// API: Final Interview Evaluation & Debrief Report
app.post('/api/interview/report', async (req: Request, res: Response) => {
  try {
    const { history = [], track = 'ML Infrastructure & MLOps', candidateProfile = DEFAULT_PROFILE } = req.body;

    const systemInstruction = `
You are the Senior Technical Hiring Committee Lead and Lead Critique Evaluator at a top-tier AI engineering organization.
Analyze the complete interview history and produce an exhaustive, authoritative Senior ML/MLOps Engineering Candidate Debrief Report.
`;

    const prompt = `
Candidate Profile:
- Target Role: ${candidateProfile.targetRole}
- Interview Track: ${track}
- Stack: ${(candidateProfile.stack || []).join(', ')}

Dialogue Turns & Telemetry:
${JSON.stringify(history, null, 2)}

Generate a structured debrief report with:
1. overall_recommendation: One of ["STRONG HIRE", "HIRE", "LEAN HIRE", "NO HIRE"]
2. overall_score_out_of_10: float between 1.0 and 10.0
3. executive_summary: 2-3 paragraph summary of candidate performance, depth, and mindset.
4. radar_scores:
   - system_architecture: score 1-10
   - edge_case_resilience: score 1-10
   - latency_optimization: score 1-10
   - production_mlops: score 1-10
   - tooling_and_frameworks: score 1-10
5. top_strengths: list of 3-5 strings
6. critical_growth_areas: list of 3-5 strings
7. recommended_study_topics: list of 3-5 specific technical resources, papers, or systems to review.
`;

    const response = await generateContentWithFallback({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_recommendation: { type: Type.STRING },
            overall_score_out_of_10: { type: Type.NUMBER },
            executive_summary: { type: Type.STRING },
            radar_scores: {
              type: Type.OBJECT,
              properties: {
                system_architecture: { type: Type.NUMBER },
                edge_case_resilience: { type: Type.NUMBER },
                latency_optimization: { type: Type.NUMBER },
                production_mlops: { type: Type.NUMBER },
                tooling_and_frameworks: { type: Type.NUMBER },
              },
              required: [
                'system_architecture',
                'edge_case_resilience',
                'latency_optimization',
                'production_mlops',
                'tooling_and_frameworks',
              ],
            },
            top_strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            critical_growth_areas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommended_study_topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'overall_recommendation',
            'overall_score_out_of_10',
            'executive_summary',
            'radar_scores',
            'top_strengths',
            'critical_growth_areas',
            'recommended_study_topics',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      report: parsed,
    });
  } catch (err: any) {
    console.error('Error in /api/interview/report:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate report',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LocalMock Engine server listening on port ${PORT}`);
  });
}

startServer();
