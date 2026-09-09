'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useProject, useTranscripts, useAnalysis } from '@/lib/api/hooks';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Contradiction, UnknownGap, UserClarification } from '@/lib/api/types';
import { ClarificationProgressHeader } from '@/components/clarification/ClarificationProgressHeader';
import { ClarificationActionBar } from '@/components/clarification/ClarificationActionBar';
import { ContradictionResolverCard } from '@/components/clarification/ContradictionResolverCard';
import { UnknownGapQuestionCard } from '@/components/clarification/UnknownGapQuestionCard';
import { TranscriptContextDrawer } from '@/components/clarification/TranscriptContextDrawer';

export default function ClarificationPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id;
  const router = useRouter();

  const { project, isLoading: isProjectLoading, error: projectError } = useProject(projectId);
  const { transcripts, isLoading: isTranscriptsLoading } = useTranscripts(projectId);
  const { analysis, isLoading: isAnalysisLoading } = useAnalysis(projectId, project?.status);

  // Storage key for draft persistence
  const storageKey = projectId ? `nexbrief_clarify_draft_${projectId}` : null;

  const [resolutions, setResolutions] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined' || !storageKey) return {};
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.resolutions || {};
      }
    } catch {
      // Ignore storage errors
    }
    return {};
  });

  const [skipped, setSkipped] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined' || !storageKey) return {};
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.skipped || {};
      }
    } catch {
      // Ignore storage errors
    }
    return {};
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<{
    isOpen: boolean;
    quote: string;
    speaker?: string | null;
    category?: string;
  }>({
    isOpen: false,
    quote: '',
  });

  const { success, error: toastError, info } = useToast();

  const currentTranscript = transcripts && transcripts.length > 0 ? transcripts[0] : null;
  const rawTranscriptText = currentTranscript?.raw_text || '';

  // Persist draft on state changes
  useEffect(() => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ resolutions, skipped })
      );
    } catch {
      // Ignore storage write errors
    }
  }, [storageKey, resolutions, skipped]);

  // Questions and lookup tables
  const clarificationQuestions = analysis?.clarification_questions;
  const questions = useMemo(() => {
    return clarificationQuestions || [];
  }, [clarificationQuestions]);

  const contradictions = analysis?.contradictions;
  const contradictionsMap = useMemo(() => {
    const map = new Map<string, Contradiction>();
    if (contradictions) {
      for (const c of contradictions) {
        map.set(c.id, c);
      }
    }
    return map;
  }, [contradictions]);

  const unknownGaps = analysis?.unknown_gaps;
  const unknownGapsMap = useMemo(() => {
    const map = new Map<string, UnknownGap>();
    if (unknownGaps) {
      for (const u of unknownGaps) {
        map.set(u.id, u);
      }
    }
    return map;
  }, [unknownGaps]);

  // Count critical items
  const { totalCount, resolvedCount, skippedCount, criticalPendingCount } = useMemo(() => {
    const total = questions.length;
    let resolved = 0;
    let skipCount = 0;
    let criticalPending = 0;

    for (const q of questions) {
      const isSkip = !!skipped[q.id];
      const hasText = !!(resolutions[q.id] && resolutions[q.id].trim().length > 0);
      const isAddressed = isSkip || hasText;

      if (hasText) resolved++;
      if (isSkip) skipCount++;

      // Check if this is a high-severity item
      let isCritical = false;
      if (q.target_type === 'contradiction') {
        isCritical = true;
      } else if (q.target_type === 'unknown_gap') {
        const gap = unknownGapsMap.get(q.target_id);
        if (gap?.impact_level === 'high') {
          isCritical = true;
        }
      }

      if (isCritical && !isAddressed) {
        criticalPending++;
      }
    }

    return {
      totalCount: total,
      resolvedCount: resolved,
      skippedCount: skipCount,
      criticalPendingCount: criticalPending,
    };
  }, [questions, skipped, resolutions, unknownGapsMap]);

  const handleResolutionChange = useCallback((questionId: string, text: string) => {
    setResolutions((prev) => ({ ...prev, [questionId]: text }));
  }, []);

  const handleToggleSkip = useCallback((questionId: string, isSkip: boolean) => {
    setSkipped((prev) => ({ ...prev, [questionId]: isSkip }));
    if (isSkip) {
      setResolutions((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  }, []);

  const handleOpenDrawer = useCallback((quote: string, speaker?: string | null, category?: string) => {
    setActiveDrawer({
      isOpen: true,
      quote,
      speaker,
      category,
    });
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setActiveDrawer((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Submit clarifications and resume workflow
  const handleSubmit = async () => {
    if (!projectId) return;
    setIsSubmitting(true);

    try {
      // Build clarifications payload
      const clarificationsPayload: UserClarification[] = [];

      for (const q of questions) {
        if (skipped[q.id]) {
          clarificationsPayload.push({
            question_id: q.id,
            resolved_text: 'Skipped by operator: use best AI inference.',
            resolved_by: 'user',
          });
        } else if (resolutions[q.id] && resolutions[q.id].trim().length > 0) {
          clarificationsPayload.push({
            question_id: q.id,
            resolved_text: resolutions[q.id].trim(),
            resolved_by: 'user',
          });
        }
      }

      info('Resuming Pipeline', 'Injecting clarifications and starting brief synthesis...');
      await apiClient.workflow.clarify(projectId, clarificationsPayload);

      if (storageKey) {
        sessionStorage.removeItem(storageKey);
      }

      success('Brief Synthesis Complete', 'Your grounded project brief has been generated.');
      router.push(`/projects/${projectId}/brief`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit clarifications.';
      toastError('Synthesis Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isProjectLoading || isTranscriptsLoading || isAnalysisLoading;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Sticky Progress Header */}
      {project && (
        <ClarificationProgressHeader
          projectId={project.id}
          projectTitle={project.name || project.title}
          totalCount={totalCount}
          resolvedCount={resolvedCount}
          skippedCount={skippedCount}
          criticalPendingCount={criticalPendingCount}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        )}

        {/* Error State */}
        {projectError && (
          <div className="p-8 rounded-2xl bg-zinc-900 border border-red-500/30 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-lg font-semibold text-zinc-100">Project Not Found</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {projectError.detail || 'Unable to retrieve project details.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/">
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && !projectError && project && (
          <div className="space-y-8">
            {/* Header Description */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                Interactive Gap Clarification
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Review flagged transcript contradictions and answer unknown gaps before brief synthesis.
                Direct conflicts and high-impact questions require resolution or an explicit skip decision.
              </p>
            </div>

            {/* Zero-State: If no questions or contradictions exist */}
            {questions.length === 0 && (
              <div className="p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4 max-w-md mx-auto my-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-zinc-100">
                    All Clear: No Gaps Identified
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The AI analysis detected no transcript contradictions or high-impact missing information. You can proceed directly to brief synthesis.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Synthesize Project Brief</span>
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-6">
                {questions.map((q) => {
                  if (q.target_type === 'contradiction') {
                    const contradiction = contradictionsMap.get(q.target_id);
                    if (!contradiction) return null;

                    return (
                      <ContradictionResolverCard
                        key={q.id}
                        questionId={q.id}
                        contradiction={contradiction}
                        questionText={q.question}
                        resolvedText={resolutions[q.id] || ''}
                        isSkipped={!!skipped[q.id]}
                        onChangeResolution={(text) => handleResolutionChange(q.id, text)}
                        onToggleSkip={(skip) => handleToggleSkip(q.id, skip)}
                        onViewContext={(quote, speaker) =>
                          handleOpenDrawer(quote, speaker, contradiction.category)
                        }
                      />
                    );
                  }

                  if (q.target_type === 'unknown_gap') {
                    const gap = unknownGapsMap.get(q.target_id);

                    return (
                      <UnknownGapQuestionCard
                        key={q.id}
                        question={q}
                        unknownGap={gap}
                        resolvedText={resolutions[q.id] || ''}
                        isSkipped={!!skipped[q.id]}
                        onChangeResolution={(text) => handleResolutionChange(q.id, text)}
                        onToggleSkip={(skip) => handleToggleSkip(q.id, skip)}
                      />
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Action Footer */}
      {!isLoading && !projectError && project && questions.length > 0 && (
        <ClarificationActionBar
          totalCount={totalCount}
          criticalPendingCount={criticalPendingCount}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}

      {/* Transcript Context Drawer */}
      <TranscriptContextDrawer
        isOpen={activeDrawer.isOpen}
        onClose={handleCloseDrawer}
        quoteText={activeDrawer.quote}
        speaker={activeDrawer.speaker}
        category={activeDrawer.category}
        rawTranscriptText={rawTranscriptText}
      />
    </div>
  );
}
