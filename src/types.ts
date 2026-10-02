export type DifficultyTier = 'Junior' | 'Mid' | 'Senior' | 'Staff/Principal';

export interface InternalEvaluation {
  score_out_of_10: number;
  strengths: string;
  gaps_or_hallucinations: string;
  difficulty_adjustment: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
  topic_tags?: string[];
  edge_cases_probed?: string;
}

export interface InterviewerResponse {
  feedback: string;
  next_question: string;
}

export interface DialogueTurn {
  id: string;
  role: 'candidate' | 'interviewer';
  content: string;
  timestamp: number;
  evaluation?: InternalEvaluation;
  feedback?: string;
  audioUrl?: string;
  rawJson?: string;
}

export interface InterviewConfig {
  model: string;
  temperature: number;
  structuredOutput: boolean;
  track: string;
  targetRole: string;
  candidateFocus: string;
  stack: string[];
  voice: string;
  autoVoicePlayback: boolean;
}

export interface DebriefReport {
  overall_recommendation: 'STRONG HIRE' | 'HIRE' | 'LEAN HIRE' | 'NO HIRE';
  overall_score_out_of_10: number;
  executive_summary: string;
  radar_scores: {
    system_architecture: number;
    edge_case_resilience: number;
    latency_optimization: number;
    production_mlops: number;
    tooling_and_frameworks: number;
  };
  top_strengths: string[];
  critical_growth_areas: string[];
  recommended_study_topics: string[];
}
