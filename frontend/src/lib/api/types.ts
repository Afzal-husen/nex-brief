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
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreatePayload {
  title: string;
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
