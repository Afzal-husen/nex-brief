'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, FileText, Loader2, Sparkles } from 'lucide-react';
import { useProject, useBrief } from '@/lib/api/hooks';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { BriefHeader } from '@/components/brief/BriefHeader';
import { BriefCritiqueBanner } from '@/components/brief/BriefCritiqueBanner';
import { BriefTableOfContents } from '@/components/brief/BriefTableOfContents';
import { BriefSectionCard } from '@/components/brief/BriefSectionCard';
import { ApprovalModal } from '@/components/brief/ApprovalModal';
import { SECTION_ORDER, SECTION_TITLES, buildUnifiedBriefMarkdown } from '@/lib/utils/export-brief';
import type { BriefSection } from '@/lib/api/types';

export default function BriefPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id;
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const { project, isLoading: isProjectLoading, error: projectError, mutate: mutateProject } = useProject(projectId);
  const { briefData, isLoading: isBriefLoading, error: briefError, mutate: mutateBrief } = useBrief(projectId, project?.status);

  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(SECTION_ORDER[0]);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Determine active brief: approved_brief if project is approved, otherwise draft_brief
  const isApproved = project?.status === 'approved' || Boolean(briefData?.approved_brief);
  const sourceBrief = isApproved ? (briefData?.approved_brief || briefData?.draft_brief) : briefData?.draft_brief;

  // Track draft sections and user edits
  const draftSections = useMemo(() => {
    return sourceBrief?.sections || {};
  }, [sourceBrief]);

  const [editedSections, setEditedSections] = useState<Record<string, BriefSection>>({});

  // Initialize or reset editedSections when sourceBrief loads
  useEffect(() => {
    if (sourceBrief?.sections) {
      setEditedSections(sourceBrief.sections);
    }
  }, [sourceBrief]);

  // Set of modified section keys
  const modifiedSectionKeys = useMemo(() => {
    const set = new Set<string>();
    SECTION_ORDER.forEach((key) => {
      const orig = draftSections[key]?.content?.trim() || '';
      const curr = editedSections[key]?.content?.trim() || '';
      if (orig !== curr) {
        set.add(key);
      }
    });
    return set;
  }, [draftSections, editedSections]);

  const projectTitle = project?.name || project?.title || 'Project Brief';
  const fullMarkdown = useMemo(() => {
    return buildUnifiedBriefMarkdown(projectTitle, editedSections);
  }, [projectTitle, editedSections]);

  const handleUpdateSectionContent = (key: string, newContent: string) => {
    setEditedSections((prev) => {
      const existing = prev[key] || {
        key,
        title: SECTION_TITLES[key] || key,
        content: '',
      };
      return {
        ...prev,
        [key]: {
          ...existing,
          content: newContent,
        },
      };
    });
    success('Section Saved', `Saved updates for ${SECTION_TITLES[key] || key}.`);
  };

  const handleResetSection = (key: string) => {
    if (draftSections[key]) {
      setEditedSections((prev) => ({
        ...prev,
        [key]: draftSections[key],
      }));
      info('Section Reset', `Reverted ${SECTION_TITLES[key] || key} to AI draft.`);
    }
  };

  const handleScrollToSection = (key: string) => {
    setActiveSectionKey(key);
    const el = document.getElementById(`section-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleConfirmApproval = async () => {
    if (!projectId) return;
    setIsApproving(true);
    try {
      // Build edited_brief payload mapping sections for backend correction logging
      const editedPayload: Record<string, unknown> = {
        sections: editedSections,
        full_markdown: fullMarkdown,
      };

      const res = await apiClient.workflow.approve(projectId, {
        edited_brief: editedPayload,
      });

      await Promise.all([mutateProject(), mutateBrief()]);
      setIsApprovalModalOpen(false);
      success('Brief Approved!', 'Project brief signed off and editorial corrections logged.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      toastError('Approval Error', msg);
    } finally {
      setIsApproving(false);
    }
  };

  // Loading state
  if (isProjectLoading || isBriefLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <div className="h-16 border-b border-zinc-800 bg-zinc-900/40" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Skeleton className="h-96 rounded-2xl hidden lg:block" />
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-semibold text-zinc-100">Project Not Found</h2>
          <p className="text-xs text-zinc-400">
            {projectError?.detail || 'Unable to load project details for this brief.'}
          </p>
          <Link href="/">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Synthesis in progress state
  if (project.status === 'synthesizing' || (!sourceBrief && !briefError)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <BriefHeader
          projectId={project.id}
          projectTitle={projectTitle}
          status={project.status}
          isApproved={false}
          fullMarkdown=""
          onOpenApprovalModal={() => {}}
        />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center space-y-4 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">Brief Synthesis in Progress</h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            The AI is synthesizing the 11-section project brief, grounding claims with confirmed facts, and running self-critique audits...
          </p>
          <div className="flex items-center gap-2 pt-4">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            <span className="text-xs font-mono text-zinc-500">Auto-refreshing brief state...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Sticky Header */}
      <BriefHeader
        projectId={project.id}
        projectTitle={projectTitle}
        status={project.status}
        isApproved={isApproved}
        fullMarkdown={fullMarkdown}
        onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Approved Stamp Banner */}
        {isApproved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-200">
                  Approved &amp; Grounded Project Brief
                </h3>
                <p className="text-xs text-emerald-300/80">
                  This brief was officially reviewed and approved on{' '}
                  {briefData?.approved_at
                    ? new Date(briefData.approved_at).toLocaleString()
                    : new Date().toLocaleDateString()}
                  .
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
              Sign-off Complete
            </span>
          </div>
        )}

        {/* Critique Banner */}
        {briefData?.critique_report && (
          <BriefCritiqueBanner critique={briefData.critique_report} />
        )}

        {/* Document Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column: Table of Contents */}
          <div className="hidden lg:block lg:col-span-1">
            <BriefTableOfContents
              activeSectionKey={activeSectionKey}
              onSelectSection={handleScrollToSection}
              critiqueIssues={briefData?.critique_report?.issues || []}
              modifiedSectionKeys={modifiedSectionKeys}
            />
          </div>

          {/* Right Column: 11 Section Cards */}
          <div className="lg:col-span-3 space-y-6">
            {SECTION_ORDER.map((key, idx) => {
              const title = SECTION_TITLES[key] || key;
              const section = editedSections[key];
              const draftSection = draftSections[key];
              const sectionCritiqueIssues = (briefData?.critique_report?.issues || []).filter(
                (i) => i.section_key === key
              );

              return (
                <BriefSectionCard
                  key={key}
                  index={idx + 1}
                  sectionKey={key}
                  title={title}
                  section={section}
                  draftSection={draftSection}
                  critiqueIssues={sectionCritiqueIssues}
                  isApproved={isApproved}
                  onUpdateSectionContent={handleUpdateSectionContent}
                  onResetSection={handleResetSection}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Approval & Diff Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        projectTitle={projectTitle}
        draftSections={draftSections}
        editedSections={editedSections}
        fullMarkdown={fullMarkdown}
        isApproving={isApproving}
        onConfirmApproval={handleConfirmApproval}
      />
    </div>
  );
}
