'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface ClarificationProgressHeaderProps {
  projectId: string;
  projectTitle: string;
  totalCount: number;
  resolvedCount: number;
  skippedCount: number;
  criticalPendingCount: number;
}

export function ClarificationProgressHeader({
  projectId,
  projectTitle,
  totalCount,
  resolvedCount,
  skippedCount,
  criticalPendingCount,
}: ClarificationProgressHeaderProps) {
  const addressedCount = resolvedCount + skippedCount;
  const progressPercent = totalCount > 0 ? Math.round((addressedCount / totalCount) * 100) : 100;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Top Row: Navigation & Project Title */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workspace</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800 shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-sm text-zinc-100 shrink-0">Clarification</span>
              <span className="text-zinc-600 shrink-0">/</span>
              <span className="text-xs sm:text-sm text-zinc-300 truncate font-semibold">
                {projectTitle}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 shrink-0">
            {criticalPendingCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>{criticalPendingCount} critical to resolve</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Critical items clear</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Details */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {addressedCount} of {totalCount} items addressed ({progressPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-400 font-medium">{resolvedCount} answered</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-zinc-400">{skippedCount} skipped</span>
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
