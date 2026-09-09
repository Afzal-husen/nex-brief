'use client';

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Info, ShieldAlert } from 'lucide-react';
import type { CritiqueReport } from '@/lib/api/types';

interface BriefCritiqueBannerProps {
  critique: CritiqueReport | null | undefined;
}

export const BriefCritiqueBanner: React.FC<BriefCritiqueBannerProps> = ({ critique }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!critique) {
    return null;
  }

  const score = Math.max(0, Math.min(100, critique.score || 0));
  const issues = critique.issues || [];

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  let scoreColorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let badgeText = 'Strong Grounding';
  if (score < 60) {
    scoreColorClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    badgeText = 'Needs Attention';
  } else if (score < 80) {
    scoreColorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    badgeText = 'Moderate Grounding';
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Score & Summary */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Circular Score Badge */}
          <div
            className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 font-bold ${scoreColorClass}`}
          >
            <span className="text-lg leading-none tracking-tight">{score}</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400">Score</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>AI Automated Critique Audit</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreColorClass}`}>
                {badgeText}
              </span>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2 max-w-2xl leading-relaxed">
              {critique.summary || 'Critique audit completed against source transcript facts and extracted inferences.'}
            </p>
          </div>
        </div>

        {/* Severity Metrics and Expand Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{criticalCount} Critical</span>
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warningCount} Warnings</span>
            </span>
          )}
          {infoCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
              <Info className="w-3.5 h-3.5" />
              <span>{infoCount} Info</span>
            </span>
          )}
          {issues.length === 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clean Audit</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            title={isExpanded ? 'Collapse critique details' : 'Expand critique details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Breakdown */}
      {isExpanded && issues.length > 0 && (
        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Advisory Findings ({issues.length})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {issues.map((issue) => {
              const isCrit = issue.severity === 'critical';
              const isWarn = issue.severity === 'warning';
              return (
                <div
                  key={issue.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    isCrit
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                      : isWarn
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                      : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px] opacity-80">
                      {issue.issue_type.replace('_', ' ')} &bull; {issue.section_key}
                    </span>
                    <span className="capitalize font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/30">
                      {issue.severity}
                    </span>
                  </div>
                  <p className="line-clamp-2 leading-relaxed opacity-90">{issue.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
