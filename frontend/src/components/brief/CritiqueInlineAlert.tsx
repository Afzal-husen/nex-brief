'use client';

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Check, ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';
import type { CritiqueIssue } from '@/lib/api/types';

interface CritiqueInlineAlertProps {
  issue: CritiqueIssue;
  onApplyFix?: (fixText: string) => void;
  isEditing?: boolean;
}

export const CritiqueInlineAlert: React.FC<CritiqueInlineAlertProps> = ({
  issue,
  onApplyFix,
  isEditing = false,
}) => {
  const [showFix, setShowFix] = useState(true);
  const [applied, setApplied] = useState(false);

  const isCrit = issue.severity === 'critical';
  const isWarn = issue.severity === 'warning';

  const containerStyle = isCrit
    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
    : isWarn
    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
    : 'bg-sky-950/20 border-sky-500/30 text-sky-200';

  const iconColor = isCrit
    ? 'text-rose-400'
    : isWarn
    ? 'text-amber-400'
    : 'text-sky-400';

  const handleApply = () => {
    if (onApplyFix && issue.suggested_fix) {
      onApplyFix(issue.suggested_fix);
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  return (
    <div className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${containerStyle}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 shrink-0">
            {isCrit ? (
              <AlertCircle className={`w-4 h-4 ${iconColor}`} />
            ) : isWarn ? (
              <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
            ) : (
              <Info className={`w-4 h-4 ${iconColor}`} />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {issue.issue_type.replace(/_/g, ' ')}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-black/40">
                {issue.severity}
              </span>
            </div>
            <p className="leading-relaxed opacity-95">{issue.explanation}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFix(!showFix)}
          className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-black/20 shrink-0"
          title={showFix ? 'Hide suggested fix' : 'Show suggested fix'}
        >
          {showFix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Suggested Fix Action Block */}
      {showFix && issue.suggested_fix && (
        <div className="mt-2 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Suggested Revision
            </span>
            <p className="font-mono text-[11px] text-zinc-300 line-clamp-2 bg-black/30 px-2 py-1 rounded">
              {issue.suggested_fix}
            </p>
          </div>

          {onApplyFix && (
            <button
              type="button"
              onClick={handleApply}
              disabled={applied}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-emerald-600/80 shadow-sm transition-all self-end sm:self-auto shrink-0 cursor-pointer"
            >
              {applied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-200" />
                  <span>Fix Applied!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>{isEditing ? 'Insert Fix' : 'Edit & Apply Fix'}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
