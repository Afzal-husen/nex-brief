'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { useProject } from '@/lib/api/hooks';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export default function ProjectWorkspacePage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id;
  const { project, isLoading, error, mutate } = useProject(projectId);

  const formattedDate = project?.created_at
    ? new Date(project.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-100">NexBrief</span>
              <span className="text-zinc-600">/</span>
              <span className="text-xs text-zinc-400 truncate max-w-xs font-medium">
                {project?.title || 'Workspace'}
              </span>
            </div>
          </div>

          {project && (
            <div className="flex items-center gap-3">
              <Badge status={project.status} />
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-8 rounded-2xl bg-zinc-900 border border-red-500/30 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-lg font-semibold text-zinc-100">Project Not Found</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {error.detail || 'Unable to retrieve project details from the server.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/">
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
              <Button variant="primary" onClick={() => mutate()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Project Content */}
        {!isLoading && !error && project && (
          <div className="space-y-8">
            {/* Project Header Banner */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                    {project.title}
                  </h1>
                  <Badge status={project.status} />
                </div>
                <p className="mt-1 text-sm text-zinc-400">
                  {project.description || 'No description provided.'}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Created on {formattedDate} • Project ID: <code className="text-zinc-400">{project.id}</code>
                </p>
              </div>
            </div>

            {/* Pipeline Step Navigator Placeholder (Ready for Phase 8) */}
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>

              <div className="max-w-lg mx-auto">
                <h2 className="text-lg font-semibold text-zinc-100 mb-1">
                  Discovery Pipeline Workspace
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Phase 7 dashboard and API connectivity established. The next phases connect the interactive brief generation lifecycle:
                </p>
              </div>

              {/* Steps overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left pt-2">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">
                      8
                    </span>
                    Phase 8
                  </div>
                  <h3 className="text-sm font-medium text-zinc-200">Transcript Ingestion</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Upload transcripts & view grounded fact cards with quote highlight linking.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                      9
                    </span>
                    Phase 9
                  </div>
                  <h3 className="text-sm font-medium text-zinc-200">Gap Clarifications</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Review flagged contradictions and answer unknowns before brief synthesis.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                      10
                    </span>
                    Phase 10
                  </div>
                  <h3 className="text-sm font-medium text-zinc-200">Brief Editor & Approval</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    11-section markdown editor, automated critique review, and final approval gate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
