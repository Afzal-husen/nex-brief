'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Upload,
  Play,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useProject, useTranscripts, useAnalysis } from '@/lib/api/hooks';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { IngestionHero } from '@/components/workspace/IngestionHero';
import { ResizableSplitView } from '@/components/workspace/ResizableSplitView';
import { TranscriptPane } from '@/components/workspace/TranscriptPane';
import { FactCardsPane } from '@/components/workspace/FactCardsPane';
import { ClarificationFooter } from '@/components/workspace/ClarificationFooter';
import { TranscriptQuoteItem } from '@/lib/utils/quote-matcher';

export default function ProjectWorkspacePage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const { project, isLoading: isProjectLoading, error: projectError, mutate: mutateProject } = useProject(projectId);
  const { transcripts, isLoading: isTranscriptsLoading, mutate: mutateTranscripts } = useTranscripts(projectId);
  const { analysis, mutate: mutateAnalysis } = useAnalysis(projectId, project?.status);

  const [activeFactId, setActiveFactId] = useState<string | null>(null);
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState<boolean>(false);
  const [isReplacingTranscript, setIsReplacingTranscript] = useState<boolean>(false);

  const { success, error: toastError, info } = useToast();

  const currentTranscript = transcripts && transcripts.length > 0 ? transcripts[0] : null;

  // Build grounded quote intervals from confirmed facts
  const confirmedFacts = analysis?.confirmed_facts;
  const groundedQuotes = useMemo<TranscriptQuoteItem[]>(() => {
    if (!confirmedFacts) return [];
    return confirmedFacts
      .filter((fact) => !!fact.source_quote && fact.source_quote.trim().length > 0)
      .map((fact) => ({
        factId: fact.id,
        quote: fact.source_quote,
      }));
  }, [confirmedFacts]);

  const totalFactsCount =
    (analysis?.confirmed_facts?.length || 0) +
    (analysis?.inferred_points?.length || 0) +
    (analysis?.contradictions?.length || 0) +
    (analysis?.unknown_gaps?.length || 0);

  // Trigger backend analysis
  const handleTriggerAnalysis = async () => {
    if (!projectId) return;
    setIsAnalyzingLocal(true);
    try {
      info('Analysis Started', 'Running extraction and fact grounding pipeline...');
      const res = await apiClient.workflow.analyze(projectId);
      await Promise.all([
        mutateProject(),
        mutateTranscripts(),
        mutateAnalysis(res, false),
      ]);
      success('Extraction Complete', 'Epistemic facts and grounded quote anchors are ready.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed to complete.';
      toastError('Analysis Error', msg);
    } finally {
      setIsAnalyzingLocal(false);
    }
  };

  const formattedDate = project?.created_at
    ? new Date(project.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const isAnalyzing = isAnalyzingLocal || project?.status === 'analyzing';
  const isAnalyzed = project?.status !== 'created';
  const hasAnalysisData = isAnalyzed || Boolean(
    analysis && (
      (analysis.confirmed_facts?.length ?? 0) > 0 ||
      (analysis.inferred_points?.length ?? 0) > 0 ||
      (analysis.contradictions?.length ?? 0) > 0 ||
      (analysis.unknown_gaps?.length ?? 0) > 0
    )
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Sticky Top Workspace Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800 shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-sm text-zinc-100 shrink-0">NexBrief</span>
              <span className="text-zinc-600 shrink-0">/</span>
              <span className="text-xs sm:text-sm text-zinc-300 truncate font-semibold">
                {project?.name || project?.title || 'Workspace'}
              </span>
            </div>
          </div>

          {project && (
            <div className="flex items-center gap-3 shrink-0">
              <Badge status={project.status} />

              {(project.status === 'ready_for_review' || project.status === 'approved') ? (
                <Link
                  href={`/projects/${project.id}/brief`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{project.status === 'approved' ? 'View Approved Brief' : 'Review Brief'}</span>
                </Link>
              ) : currentTranscript && !isReplacingTranscript && (
                <button
                  type="button"
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {isAnalyzing ? 'Analyzing...' : 'Run Extraction'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Loading state */}
        {(isProjectLoading || isTranscriptsLoading) && (
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        )}

        {/* Error state */}
        {projectError && (
          <div className="p-8 rounded-2xl bg-zinc-900 border border-red-500/30 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-lg font-semibold text-zinc-100">Project Not Found</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {projectError.detail || 'Unable to retrieve project details from the server.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/">
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
              <Button variant="primary" onClick={() => mutateProject()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Project Loaded */}
        {!isProjectLoading && !projectError && project && (
          <div className="space-y-6">
            {/* Context Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
                    {project.name || project.title}
                  </h1>
                  {hasAnalysisData && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Grounded
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {project.description || 'Client discovery call brief workspace.'} &bull; Created {formattedDate}
                </p>
              </div>

              {currentTranscript && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReplacingTranscript(!isReplacingTranscript)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isReplacingTranscript ? 'Cancel Replace' : 'Replace Transcript'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Ingestion Hero: Shown when no transcript exists OR when user clicked Replace */}
            {(!currentTranscript || isReplacingTranscript) && (
              <div className="space-y-4">
                {isReplacingTranscript && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                    <span>Uploading a new transcript will replace the active conversation text.</span>
                    <button
                      type="button"
                      onClick={() => setIsReplacingTranscript(false)}
                      className="underline text-amber-200 hover:text-amber-100 font-semibold ml-2"
                    >
                      Keep Current
                    </button>
                  </div>
                )}
                <IngestionHero
                  projectId={project.id}
                  projectTitle={project.name || project.title}
                  onTranscriptSubmitted={async (_savedTranscript, startAnalysis) => {
                    setIsReplacingTranscript(false);
                    await Promise.all([mutateTranscripts(), mutateProject()]);
                    if (startAnalysis) {
                      await handleTriggerAnalysis();
                    }
                  }}
                />
              </div>
            )}

            {/* When Transcript Exists and user is NOT replacing */}
            {currentTranscript && !isReplacingTranscript && (
              <>
                {/* Analyzing in-progress state banner */}
                {isAnalyzing && (
                  <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center gap-4 animate-pulse">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin shrink-0" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-indigo-200">
                        AI Epistemic Extraction in Progress
                      </h3>
                      <p className="text-xs text-indigo-300/80">
                        Separating explicit client statements from AI inferences, anchoring verbatim quotes, and identifying unknown gaps...
                      </p>
                    </div>
                  </div>
                )}

                {/* Pre-Analysis State: Transcript saved but not analyzed yet */}
                {!hasAnalysisData && !isAnalyzing && (
                  <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4 max-w-xl mx-auto my-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-base font-semibold text-zinc-100">
                        Transcript Ingested & Ready
                      </h2>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                        The conversation transcript has been normalized ({currentTranscript.raw_text.length.toLocaleString()} characters). Run the AI epistemic pipeline to ground facts and extract insights.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTriggerAnalysis}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Epistemic Analysis</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Grounded Dual-Pane Workspace */}
                {hasAnalysisData && (
                  <div className="space-y-4">
                    <ResizableSplitView
                      factCount={totalFactsCount}
                      activeFactId={activeFactId}
                      leftPane={
                        <TranscriptPane
                          rawText={currentTranscript.raw_text}
                          quotes={groundedQuotes}
                          activeFactId={activeFactId}
                          onSelectFact={(factId) => setActiveFactId(factId)}
                          onClearActiveFact={() => setActiveFactId(null)}
                          title={currentTranscript.title || 'Discovery Call Transcript'}
                        />
                      }
                      rightPane={
                        <FactCardsPane
                          confirmedFacts={analysis?.confirmed_facts}
                          inferredPoints={analysis?.inferred_points}
                          contradictions={analysis?.contradictions}
                          unknownGaps={analysis?.unknown_gaps}
                          activeFactId={activeFactId}
                          onSelectQuote={(factId) => setActiveFactId(factId)}
                          onSelectFact={(factId) => setActiveFactId(factId)}
                        />
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Sticky Progression Footer: shown when analysis data is available */}
      {hasAnalysisData && project && (
        <ClarificationFooter
          confirmedCount={analysis?.confirmed_facts?.length || 0}
          inferredCount={analysis?.inferred_points?.length || 0}
          contradictionCount={analysis?.contradictions?.length || 0}
          unknownCount={analysis?.unknown_gaps?.length || 0}
          projectId={project.id}
          status={project.status}
        />
      )}
    </div>
  );
}
