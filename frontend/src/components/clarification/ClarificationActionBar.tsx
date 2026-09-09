'use client';

import React from 'react';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

interface ClarificationActionBarProps {
  totalCount: number;
  criticalPendingCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ClarificationActionBar({
  totalCount,
  criticalPendingCount,
  isSubmitting,
  onSubmit,
}: ClarificationActionBarProps) {
  const canSubmit = criticalPendingCount === 0;

  return (
    <footer className="sticky bottom-0 z-30 w-full bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xl transition-all">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Notice */}
        <div className="flex items-center gap-2 text-xs">
          {criticalPendingCount > 0 ? (
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Please resolve or skip the <strong>{criticalPendingCount}</strong> critical item(s) before brief synthesis.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                All {totalCount} items reviewed. Ready to synthesize the grounded 11-section brief.
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg transition-all ${
              canSubmit && !isSubmitting
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/25 active:scale-[0.98] cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-70 shadow-none'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
                <span>Synthesizing Brief...</span>
              </>
            ) : (
              <>
                <span>Trigger Brief Synthesis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
