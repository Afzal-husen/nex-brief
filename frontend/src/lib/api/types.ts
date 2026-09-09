/**
 * API TypeScript definitions mirroring FastAPI models and workflow states
 */

export type ProjectStatus =
  | 'created'
  | 'analyzing'
  | 'awaiting_clarification'
  | 'synthesizing'
  | 'ready_for_review'
  | 'approved';

export interface Project {
  id: string;
  name?: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreatePayload {
  name?: string;
  title?: string;
  description?: string | null;
}

export interface HealthResponse {
  status: string;
  app: string;
}

export interface DeleteProjectResponse {
  status: string;
  id: string;
}

export interface ApiErrorResponse {
  detail?: string | Array<{ msg: string; loc: Array<string | number> }>;
}

export interface Transcript {
  id: string;
  project_id: string;
  title: string;
  source_type: string;
  raw_text: string;
  normalized_text: string;
  created_at: string;
  updated_at: string;
}

export interface TranscriptCreate {
  title: string;
  raw_text: string;
  source_type?: string;
}

export type FactCategory =
  | 'scope'
  | 'timeline'
  | 'budget'
  | 'tech_stack'
  | 'target_audience'
  | 'constraints'
  | 'integrations'
  | 'other';

export interface QuoteSpan {
  start_char: number;
  end_char: number;
  line_start: number;
  line_end: number;
}

export interface ConfirmedFact {
  id: string;
  category: FactCategory;
  statement: string;
  source_quote: string;
  speaker: string | null;
  spans?: QuoteSpan[];
}

export interface InferredPoint {
  id: string;
  category: FactCategory;
  statement: string;
  source_fact_ids: string[];
  rationale: string;
  status?: string;
}

export interface Contradiction {
  id: string;
  category: FactCategory;
  claim_a: string;
  quote_a: string;
  spans_a?: QuoteSpan[];
  fact_id_a?: string | null;
  claim_b: string;
  quote_b: string;
  spans_b?: QuoteSpan[];
  fact_id_b?: string | null;
  conflict_rationale: string;
  severity: 'direct_conflict' | 'tension';
}

export interface UnknownGap {
  id: string;
  category: FactCategory;
  missing_information: string;
  impact_level: 'high' | 'medium' | 'low';
  suggested_question: string;
}

export interface ClarificationQuestion {
  id: string;
  priority: number;
  target_type: 'contradiction' | 'unknown_gap';
  target_id: string;
  question: string;
  rationale: string;
  suggested_options: string[];
}

export interface AnalyzeResponse {
  project_id: string;
  status: string;
  confirmed_facts: ConfirmedFact[];
  inferred_points: InferredPoint[];
  contradictions: Contradiction[];
  unknown_gaps: UnknownGap[];
  clarification_questions: ClarificationQuestion[];
}
