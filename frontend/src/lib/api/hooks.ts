'use client';

import useSWR, { type KeyedMutator } from 'swr';
import { apiClient, type ApiError } from './client';
import type { AnalyzeResponse, Project, Transcript } from './types';

export interface UseProjectsResult {
  projects: Project[] | undefined;
  isLoading: boolean;
  error: ApiError | undefined;
  mutate: KeyedMutator<Project[]>;
}

export function useProjects(): UseProjectsResult {
  const { data, error, isLoading, mutate } = useSWR<Project[], ApiError>(
    '/projects',
    () => apiClient.projects.list(),
    {
      revalidateOnFocus: true,
      refreshInterval: (latestData) => {
        const hasActiveJobs = latestData?.some(
          (p) => p.status === 'analyzing' || p.status === 'synthesizing'
        );
        return hasActiveJobs ? 2500 : 0;
      },
    }
  );

  return {
    projects: data,
    isLoading,
    error,
    mutate,
  };
}

export interface UseProjectResult {
  project: Project | undefined;
  isLoading: boolean;
  error: ApiError | undefined;
  mutate: KeyedMutator<Project>;
}

export function useProject(id?: string): UseProjectResult {
  const { data, error, isLoading, mutate } = useSWR<Project, ApiError>(
    id ? `/projects/${id}` : null,
    () => apiClient.projects.get(id!),
    {
      revalidateOnFocus: true,
      refreshInterval: (latestData) => {
        const isActive =
          latestData?.status === 'analyzing' || latestData?.status === 'synthesizing';
        return isActive ? 2500 : 0;
      },
    }
  );

  return {
    project: data,
    isLoading,
    error,
    mutate,
  };
}

export interface UseTranscriptsResult {
  transcripts: Transcript[] | undefined;
  isLoading: boolean;
  error: ApiError | undefined;
  mutate: KeyedMutator<Transcript[]>;
}

export function useTranscripts(projectId?: string): UseTranscriptsResult {
  const { data, error, isLoading, mutate } = useSWR<Transcript[], ApiError>(
    projectId ? `/projects/${projectId}/transcripts` : null,
    () => apiClient.transcripts.list(projectId!),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    transcripts: data,
    isLoading,
    error,
    mutate,
  };
}

export interface UseAnalysisResult {
  analysis: AnalyzeResponse | undefined;
  isLoading: boolean;
  error: ApiError | undefined;
  mutate: KeyedMutator<AnalyzeResponse>;
}

export function useAnalysis(projectId?: string, projectStatus?: string): UseAnalysisResult {
  const { data, error, isLoading, mutate } = useSWR<AnalyzeResponse, ApiError>(
    projectId ? `/projects/${projectId}/analysis` : null,
    () => apiClient.workflow.getAnalysis(projectId!),
    {
      revalidateOnFocus: false,
      refreshInterval: () => {
        return projectStatus === 'analyzing' ? 2500 : 0;
      },
    }
  );

  return {
    analysis: data,
    isLoading,
    error,
    mutate,
  };
}
